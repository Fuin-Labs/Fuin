use anchor_lang::prelude::*;

use crate::state::{Delegate, Vault};

#[derive(Accounts)]
#[instruction(vault_nonce: u64, delegate_nonce: u64)]
pub struct IssueDelegate<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"vault",
            guardian.key().as_ref(),
            &vault_nonce.to_le_bytes(),
        ],
        bump = vault.bump,
        has_one = guardian,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init,
        payer = guardian,
        seeds = [
            b"delegate",
            vault.key().as_ref(),
            &delegate_nonce.to_le_bytes(),
        ],
        bump,
        space = Delegate::DISCRIMINATOR.len() + Delegate::INIT_SPACE,
    )]
    pub delegate: Account<'info, Delegate>,

    pub system_program: Program<'info, System>,
}

pub fn issue_delegate(
    ctx: Context<IssueDelegate>,
    _vault_nonce: u64,
    delegate_nonce: u64,
    delegate_key: Pubkey,
    permissions: u16,
    daily_limit: u64,
    max_uses: u32,
    validity_in_secs: i64,
)->Result<()>{
    let clock = Clock::get()?;
    let expiry = clock.unix_timestamp + validity_in_secs;

    ctx.accounts.vault.recovery.last_guardian_activity = clock.unix_timestamp;

    let delegate = &mut ctx.accounts.delegate;
    delegate.set_inner(Delegate {
        vault: ctx.accounts.vault.key(),
        authority: delegate_key,
        permissions,
        daily_limit,
        daily_spent: 0,
        last_reset_epoch: clock.epoch,
        max_uses,
        uses: 0,
        expiry,
        is_active: true,
        nonce: delegate_nonce,
        bump: ctx.bumps.delegate,
    });

    msg!("Delegate issued for {:?}", delegate_key);
    Ok(())
}
