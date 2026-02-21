use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::{LimitTracker, Delegate, Vault, VaultState}};

pub fn validate_and_update_limits(
    vault: &mut Account<Vault>,
    delegate: &mut Account<Delegate>,
    clock: &Clock,
    amount: u64,
)->Result<()>{
    // Check vault is active
    require!(vault.state == VaultState::Active, ErrorCode::VaultFrozen);

    // Check delegate is active
    require!(delegate.is_active, ErrorCode::DelegateInactive);

    // Check delegate hasn't expired
    require!(clock.unix_timestamp <= delegate.expiry, ErrorCode::DelegateExpired);

    // Check max uses
    if delegate.max_uses > 0 {
        require!(delegate.uses < delegate.max_uses, ErrorCode::MaxUsesExceeded);
    }

    // Per-transaction cap check
    if vault.policies.spending.per_tx_cap > 0 {
        require!(amount <= vault.policies.spending.per_tx_cap, ErrorCode::PerTxLimitExceeded);
    }

    // Time policy check
    let time = &vault.policies.time;
    if time.allowed_after > 0 {
        require!(clock.unix_timestamp >= time.allowed_after, ErrorCode::OutsideAllowedTime);
    }
    if time.allowed_before > 0 {
        require!(clock.unix_timestamp <= time.allowed_before, ErrorCode::OutsideAllowedTime);
    }

    // Risk policy check — cosign
    if vault.policies.risk.require_cosign_above > 0 && amount > vault.policies.risk.require_cosign_above {
        return err!(ErrorCode::RequiresGuardianCosign);
    }

    // Vault epoch reset
    if clock.epoch > vault.policies.spending.last_reset_epoch {
        vault.policies.spending.daily_spent = 0;
        vault.policies.spending.last_reset_epoch = clock.epoch;
    }

    // Delegate epoch reset
    if clock.epoch > delegate.last_reset_epoch {
        delegate.daily_spent = 0;
        delegate.last_reset_epoch = clock.epoch;
    }

    // Limit Check & Update (Using the Trait)
    vault.check_and_spend(amount)?;
    delegate.check_and_spend(amount)?;

    // Increment uses
    delegate.uses += 1;

    Ok(())
}

pub fn validate_program_policy(vault: &Account<Vault>, target_program: &Pubkey) -> Result<()> {
    let programs = &vault.policies.programs;

    // Deny list always wins
    if programs.deny_list.contains(target_program) {
        return err!(ErrorCode::ProgramNotAllowed);
    }

    // If allow list is non-empty, target must be in it
    if !programs.allow_list.is_empty() && !programs.allow_list.contains(target_program) {
        return err!(ErrorCode::ProgramNotAllowed);
    }

    Ok(())
}
