use anchor_lang::prelude::*;

use crate::state::{Vault, VaultState};

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct FreezeVault<'info> {
    pub guardian: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", guardian.key().as_ref(), &nonce.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian,
    )]
    pub vault: Account<'info, Vault>,
}

pub fn freeze_vault(ctx: Context<FreezeVault>, _nonce: u64) -> Result<()> {
    let clock = Clock::get()?;
    let vault = &mut ctx.accounts.vault;
    vault.state = VaultState::Frozen;
    vault.recovery.last_guardian_activity = clock.unix_timestamp;
    msg!("Vault frozen");
    Ok(())
}

pub fn unfreeze_vault(ctx: Context<FreezeVault>, _nonce: u64) -> Result<()> {
    let clock = Clock::get()?;
    let vault = &mut ctx.accounts.vault;
    vault.state = VaultState::Active;
    vault.recovery.last_guardian_activity = clock.unix_timestamp;
    msg!("Vault unfrozen");
    Ok(())
}
