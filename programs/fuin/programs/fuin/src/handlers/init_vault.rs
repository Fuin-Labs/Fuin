use anchor_lang::prelude::*;

use crate::state::vault::{Vault, VaultState, RecoveryConfig};
use crate::state::policy::{PolicySet, SpendingPolicy, ProgramPolicy, TimePolicy, RiskPolicy};

#[derive(Accounts)]
#[instruction(nonce:u64)]
pub struct InitializeVault<'info>{
    #[account(mut)]
    pub guardian : Signer<'info>,

    #[account(
        init,
        payer = guardian,
        seeds = [
            b"vault",
            guardian.key().as_ref(),
            &nonce.to_le_bytes(),
        ],
        bump,
        space = Vault::DISCRIMINATOR.len() + Vault::INIT_SPACE,
    )]
    pub vault: Account<'info,Vault>,

    pub system_program : Program<'info,System>,
}

pub fn init_vault(ctx: Context<InitializeVault>, nonce:u64, daily_cap: u64, per_tx_cap: u64, allowed_programs: Vec<Pubkey>)->Result<()>{

    let clock = Clock::get()?;

    let vault = &mut ctx.accounts.vault;
    vault.set_inner(Vault {
        version: 1,
        state: VaultState::Active,
        guardian: ctx.accounts.guardian.key(),
        policies: PolicySet {
            spending: SpendingPolicy {
                daily_cap,
                per_tx_cap,
                daily_spent: 0,
                last_reset_epoch: clock.epoch,
            },
            programs: ProgramPolicy {
                allow_list: allowed_programs,
                deny_list: Vec::new(),
            },
            time: TimePolicy {
                allowed_after: 0,
                allowed_before: 0,
            },
            risk: RiskPolicy {
                max_slippage_bps: 0,
                require_cosign_above: 0,
            },
        },
        recovery: RecoveryConfig {
            timeout_seconds: 0,
            last_guardian_activity: clock.unix_timestamp,
            backup_guardian: None,
        },
        nonce,
        bump: ctx.bumps.vault,
    });

    Ok(())
}
