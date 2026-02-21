use anchor_lang::prelude::*;

use crate::state::Vault;

#[derive(Accounts)]
#[instruction(nonce:u64)]
pub struct UpdateVault<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", guardian.key().as_ref(), &nonce.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian
    )]
    pub vault : Account<'info, Vault>,
}

pub fn update_vault(ctx:Context<UpdateVault>, _nonce:u64, new_daily_cap: Option<u64>, new_per_tx_cap: Option<u64>)->Result<()>{
    let clock = Clock::get()?;
    let vault = &mut ctx.accounts.vault;
    vault.recovery.last_guardian_activity = clock.unix_timestamp;

    if let Some(cap) = new_daily_cap {
        vault.policies.spending.daily_cap = cap;
        msg!("Vault: Daily cap updated to {}", cap);
    }

    if let Some(cap) = new_per_tx_cap {
        vault.policies.spending.per_tx_cap = cap;
        msg!("Vault: Per-tx cap updated to {}", cap);
    }

    Ok(())
}
