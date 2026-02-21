use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::{Delegate, Vault, delegate::CAN_TRANSFER}};
use super::{validate_and_update_limits, validate_program_policy};

#[derive(Accounts)]
#[instruction(nonce_vault:u64, nonce_delegate:u64)]
pub struct ExecuteTransfer<'info>{

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

    /// CHECK: Destination address
    #[account(mut)]
    pub destination: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn execute_transfer<'info>(ctx: Context<ExecuteTransfer>, _nonce_vault: u64, _nonce_delegate: u64, amount: u64)->Result<()>{

    let clock = Clock::get()?;

    // Permission check
    require!(ctx.accounts.delegate.has_permission(CAN_TRANSFER), ErrorCode::PermissionDenied);

    // Validate system program against program policy
    validate_program_policy(&ctx.accounts.vault, &ctx.accounts.system_program.key())?;

    validate_and_update_limits(
        &mut ctx.accounts.vault,
        &mut ctx.accounts.delegate,
        &clock,
        amount
    )?;

    let vault_info = ctx.accounts.vault.to_account_info();
    let destination_info = ctx.accounts.destination.to_account_info();

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **destination_info.try_borrow_mut_lamports()? += amount;

    msg!("Transfer executed: {} lamports", amount);
    Ok(())
}
