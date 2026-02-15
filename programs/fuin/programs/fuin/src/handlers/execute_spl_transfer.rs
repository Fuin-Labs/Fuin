use anchor_lang::prelude::*;
use anchor_spl::{token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked,transfer_checked}};
use crate::{error::ErrorCode, state::{Session, Vault}};

#[derive(Accounts)]
#[instruction(nonce_vault:u64,nonce_session:u64)]
pub struct ExecuteSplTransfer<'info>{
    #[account(mut)]
    pub relayer: Signer<'info>,

    pub session_key: Signer<'info>, // Agent

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
    pub vault: Account<'info,Vault>,

    #[account(
        mut,
        seeds = [
            b"session",
            guardian.key.as_ref(),
            vault.key().as_ref(),
            nonce_session.to_le_bytes().as_ref(),
        ],
        bump = session.bump,
        constraint = session.vault == vault.key() @ErrorCode::InvalidSession,
        constraint = session.authority == session_key.key() @ErrorCode::InvalidSession, 
    )]
    pub session: Account<'info,Session>,

    #[account(
        constraint = vault_token_account.mint == mint.key() @ErrorCode::MintMismatch,
        constraint = vault_token_account.owner == vault.key() @ErrorCode::VaultOwnerMismatch,
    )]
    pub vault_token_account: InterfaceAccount<'info,TokenAccount>,

    #[account(
        constraint = destination_token_account.mint == mint.key() @ErrorCode::MintMismatch,
    )]
    pub destination_token_account: InterfaceAccount<'info,TokenAccount>,

    pub mint: InterfaceAccount<'info,Mint>,

    pub token_program: Interface<'info,TokenInterface>,
}


/// For Transferring tokens
/// 
pub fn execute_spl_transfer(ctx: Context<ExecuteSplTransfer>,nonce_vault:u64, nonce_session: u64,amount: u64)->Result<()>{
    let vault = &ctx.accounts.vault;
    let session = &ctx.accounts.session;
    let clock = Clock::get()?;

    require!(session.is_active,ErrorCode::SessionInactive);
    require!(clock.unix_timestamp <= session.expires_at, ErrorCode::SessionExpired);

    // TODO: Call the oracle and add the find out the price of the token to SOL value so that we can add that in daily spend and do some checks

    let seeds:&[&[&[u8]]] = &[&[
        b"vault",
        vault.guardian.as_ref(),
        &vault.nonce.to_le_bytes(),
        &[vault.bump],
    ]];

    let cpi_accounts= TransferChecked {
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

    transfer_checked(
        cpi_ctx, 
        amount, 
        ctx.accounts.mint.decimals
    );

    msg!("SPL Transfer executed: {} tokens", amount);

    
    Ok(())
}