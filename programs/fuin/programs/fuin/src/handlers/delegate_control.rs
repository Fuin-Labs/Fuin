use anchor_lang::prelude::*;

use crate::{state::{Delegate, Vault}, error::ErrorCode};

#[derive(Accounts)]
#[instruction(nonce_vault: u64, nonce_delegate: u64)]
pub struct DelegateControl<'info>{
    pub guardian: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", guardian.key().as_ref(), &nonce_vault.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian,
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
        has_one = vault,
    )]
    pub delegate: Account<'info, Delegate>,
}

pub fn delegate_control(
    ctx: Context<DelegateControl>,
    _nv: u64,
    _nd: u64,
    status: u8, // 0 = Revoke, 1 = Pause, 2 = Resume
)->Result<()>{
    let clock_now = Clock::get()?;
    ctx.accounts.vault.recovery.last_guardian_activity = clock_now.unix_timestamp;

    let delegate = &mut ctx.accounts.delegate;

    match status {
        0 => {
            // Revoke
            delegate.is_active = false;
            delegate.expiry = 0;
            msg!("Delegate revoked");
        },
        1 => {
            // Pause
            delegate.is_active = false;
            msg!("Delegate paused");
        },
        2 => {
            // Resume
            require!(delegate.expiry > clock_now.unix_timestamp, ErrorCode::DelegateExpired);
            delegate.is_active = true;
            msg!("Delegate resumed");
        },
        _ => {
            return err!(ErrorCode::InvalidAction);
        }
    }

    Ok(())
}
