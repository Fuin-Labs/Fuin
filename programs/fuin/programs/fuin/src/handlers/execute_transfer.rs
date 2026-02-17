use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use crate::{error::ErrorCode, state::{Session, Vault}};
use super::validate_and_update_limits;

#[derive(Accounts)]
#[instruction(nonce_vault:u64,nonce_session:u64)]
pub struct ExecuteTransfer<'info>{

    #[account(mut)]
    pub relayer:Signer<'info>,

    pub session_key: Signer<'info>,

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

    /// CHECK: Destination is validated against the vault's whitelist
    #[account(mut)]
    pub destination: AccountInfo<'info>,

    pub system_program:Program<'info,System>,

}

pub fn execute_transfer<'info>(ctx:Context<ExecuteTransfer>, nonce_vault:u64, nonce_session: u64, amount:u64)->Result<()>{
    
    let clock = Clock::get()?;

    if !ctx.accounts.vault.whitelisted_address.is_empty() {
        require!(ctx.accounts.vault.whitelisted_address.contains(&ctx.accounts.destination.key()), ErrorCode::AddressNotWhitelisted);
    }

    validate_and_update_limits(
        &mut ctx.accounts.vault,
        &mut ctx.accounts.session,
        &clock,
        amount
    )?;

    let vault = &ctx.accounts.vault;
    let seeds: &[&[&[u8]]] = &[&[
        b"vault",
        vault.guardian.as_ref(),
        &vault.nonce.to_le_bytes(),
        &[vault.bump]
    ]];

    let cpi_accounts = Transfer{
        from: vault.to_account_info(),
        to: ctx.accounts.destination.to_account_info()
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(), 
        cpi_accounts, 
        seeds
    );

    transfer(cpi_ctx, amount)?;

    msg!("Transfer executed: {} lamports. Daily Spent: {}", amount, vault.daily_spent);
    Ok(())
}