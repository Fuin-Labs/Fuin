use anchor_lang::prelude::*;

use crate::{state::{Session, Vault,LimitTracker},error::ErrorCode};

pub fn validate_and_update_limit(
    vault: &mut Account<Vault>,
    session: &mut Account<Session>,
    clock: &Clock,
    amount: u64,
)->Result<()>{
    // Check Session Expiry
    require!(session.is_active, ErrorCode::SessionInactive);
    require!(clock.unix_timestamp <= session.expires_at, ErrorCode::SessionExpired);

    // Epoch Reset (New Day Logic)
    if clock.epoch > vault.last_reset_epoch {
        vault.daily_spent = 0;
        vault.last_reset_epoch = clock.epoch;
    }

    // Limit Check & Update (Using the Trait)
    // TODO: In production, 'amount' should be USD value from Oracle, 
    vault.check_and_spend(amount)?;
    session.check_and_spend(amount)?;

    Ok(())
}