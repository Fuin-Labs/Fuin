use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;
use crate::{error::ErrorCode, state::{Delegate, Vault, delegate::CAN_TRANSFER}, pricing::calculate_usd_value};
use super::validate_and_update_limits;

#[derive(Accounts)]
#[instruction(nonce_vault:u64, nonce_delegate:u64)]
pub struct ExecuteSplTransfer<'info>{
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

    #[account(
        constraint = vault_token_account.mint == mint.key() @ErrorCode::MintMismatch,
        constraint = vault_token_account.owner == vault.key() @ErrorCode::VaultOwnerMismatch,
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = destination_token_account.mint == mint.key() @ErrorCode::MintMismatch,
    )]
    pub destination_token_account: InterfaceAccount<'info, TokenAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub price_update: Account<'info, PriceUpdateV2>,
}

pub fn execute_spl_transfer(ctx: Context<ExecuteSplTransfer>, _nonce_vault: u64, _nonce_delegate: u64, amount: u64, feed_id: String)->Result<()>{
    let clock = Clock::get()?;

    // Permission check
    require!(ctx.accounts.delegate.has_permission(CAN_TRANSFER), ErrorCode::PermissionDenied);

    let _usd_spend_amount = calculate_usd_value(
        &ctx.accounts.price_update,
        &feed_id,
        amount,
        ctx.accounts.mint.decimals
    )?;

    validate_and_update_limits(
        &mut ctx.accounts.vault,
        &mut ctx.accounts.delegate,
        &clock,
        amount
    )?;

    let vault = &ctx.accounts.vault;
    let seeds: &[&[&[u8]]] = &[&[
        b"vault",
        vault.guardian.as_ref(),
        &vault.nonce.to_le_bytes(),
        &[vault.bump],
    ]];

    let cpi_accounts = TransferChecked {
        authority: vault.to_account_info(),
        from: ctx.accounts.vault_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.destination_token_account.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        seeds
    );

    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    msg!("SPL Transfer executed: {} tokens", amount);
    Ok(())
}
