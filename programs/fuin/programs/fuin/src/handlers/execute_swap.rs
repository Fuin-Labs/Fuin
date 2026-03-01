use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

use crate::{
    dlmm,
    error::ErrorCode,
    pricing::calculate_usd_value,
    state::{delegate::CAN_SWAP, Delegate, Vault},
};
use super::{validate_and_update_limits, validate_program_policy};

#[derive(Accounts)]
#[instruction(nonce_vault: u64, nonce_delegate: u64)]
pub struct ExecuteSwap<'info> {
    #[account(mut)]
    pub relayer: Signer<'info>,

    pub delegate_key: Signer<'info>,

    /// CHECK: Validated via vault PDA seeds (vault is derived from guardian's key)
    pub guardian: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"vault",
            guardian.key.as_ref(),
            &nonce_vault.to_le_bytes(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [
            b"delegate",
            vault.key().as_ref(),
            &nonce_delegate.to_le_bytes(),
        ],
        bump = delegate.bump,
        constraint = delegate.vault == vault.key() @ErrorCode::InvalidSession,
        constraint = delegate.authority == delegate_key.key() @ErrorCode::InvalidSession,
    )]
    pub delegate: Account<'info, Delegate>,

    pub price_update: Account<'info, PriceUpdateV2>,

    // --- Meteora DLMM accounts ---

    /// CHECK: The DLMM pool account
    #[account(mut)]
    pub lb_pair: UncheckedAccount<'info>,

    /// CHECK: Bin array bitmap extension (optional for some pools)
    pub bin_array_bitmap_extension: Option<UncheckedAccount<'info>>,

    /// CHECK: Reserve account of token X
    #[account(mut)]
    pub reserve_x: UncheckedAccount<'info>,

    /// CHECK: Reserve account of token Y
    #[account(mut)]
    pub reserve_y: UncheckedAccount<'info>,

    /// Vault's token account for the input token
    #[account(
        mut,
        constraint = user_token_in.owner == vault.key() @ErrorCode::VaultOwnerMismatch,
    )]
    pub user_token_in: InterfaceAccount<'info, TokenAccount>,

    /// Vault's token account for the output token
    #[account(
        mut,
        constraint = user_token_out.owner == vault.key() @ErrorCode::VaultOwnerMismatch,
    )]
    pub user_token_out: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Mint of token X in the pool
    pub token_x_mint: UncheckedAccount<'info>,

    /// CHECK: Mint of token Y in the pool
    pub token_y_mint: UncheckedAccount<'info>,

    /// CHECK: Oracle account of the pool
    #[account(mut)]
    pub oracle: UncheckedAccount<'info>,

    /// CHECK: Host fee account (optional)
    #[account(mut)]
    pub host_fee_in: Option<UncheckedAccount<'info>>,

    /// Mint of the input token (for decimals in USD conversion)
    pub token_in_mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Token program for token X
    pub token_x_program: Interface<'info, TokenInterface>,

    /// CHECK: Token program for token Y
    pub token_y_program: Interface<'info, TokenInterface>,

    /// CHECK: DLMM event authority PDA
    pub event_authority: UncheckedAccount<'info>,

    /// CHECK: Meteora DLMM program
    #[account(address = dlmm::ID)]
    pub dlmm_program: UncheckedAccount<'info>,
}

pub fn execute_swap<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSwap<'info>>,
    _nonce_vault: u64,
    _nonce_delegate: u64,
    amount_in: u64,
    min_amount_out: u64,
    feed_id: String,
) -> Result<()> {
    let clock = Clock::get()?;

    // 1. Permission check
    require!(
        ctx.accounts.delegate.has_permission(CAN_SWAP),
        ErrorCode::PermissionDenied
    );

    // 2. Program policy check
    validate_program_policy(&ctx.accounts.vault, ctx.accounts.dlmm_program.key)?;

    // 3. USD conversion — kept for future audit/logging use
    let decimals = ctx.accounts.token_in_mint.decimals;
    let _usd_spend_amount = calculate_usd_value(
        &ctx.accounts.price_update,
        &feed_id,
        amount_in,
        decimals,
    )?;

    // 4. Spending limits
    validate_and_update_limits(
        &mut ctx.accounts.vault,
        &mut ctx.accounts.delegate,
        &clock,
        amount_in,
    )?;

    // 5. Build vault PDA signer seeds
    let vault = &ctx.accounts.vault;
    let seeds: &[&[&[u8]]] = &[&[
        b"vault",
        vault.guardian.as_ref(),
        &vault.nonce.to_le_bytes(),
        &[vault.bump],
    ]];

    // 6. Build CPI accounts — vault PDA is the "user" signer
    let swap_accounts = dlmm::cpi::accounts::Swap {
        lb_pair: ctx.accounts.lb_pair.to_account_info(),
        bin_array_bitmap_extension: ctx
            .accounts
            .bin_array_bitmap_extension
            .as_ref()
            .map(|a| a.to_account_info()),
        reserve_x: ctx.accounts.reserve_x.to_account_info(),
        reserve_y: ctx.accounts.reserve_y.to_account_info(),
        user_token_in: ctx.accounts.user_token_in.to_account_info(),
        user_token_out: ctx.accounts.user_token_out.to_account_info(),
        token_x_mint: ctx.accounts.token_x_mint.to_account_info(),
        token_y_mint: ctx.accounts.token_y_mint.to_account_info(),
        oracle: ctx.accounts.oracle.to_account_info(),
        host_fee_in: ctx
            .accounts
            .host_fee_in
            .as_ref()
            .map(|a| a.to_account_info()),
        user: ctx.accounts.vault.to_account_info(),
        token_x_program: ctx.accounts.token_x_program.to_account_info(),
        token_y_program: ctx.accounts.token_y_program.to_account_info(),
        event_authority: ctx.accounts.event_authority.to_account_info(),
        program: ctx.accounts.dlmm_program.to_account_info(),
    };

    // 7. CPI with vault as signer + remaining accounts (bin arrays)
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.dlmm_program.to_account_info(),
        swap_accounts,
        seeds,
    )
    .with_remaining_accounts(ctx.remaining_accounts.to_vec());

    // 8. Execute swap
    dlmm::cpi::swap(cpi_ctx, amount_in, min_amount_out)?;

    msg!("Swap executed: {} tokens in, min {} out", amount_in, min_amount_out);
    Ok(())
}
