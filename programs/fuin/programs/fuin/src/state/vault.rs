use anchor_lang::prelude::*;

use crate::state::{LimitTracker, PolicySet};

#[derive(InitSpace)]
#[account]
pub struct Vault{
    pub version: u8,
    pub state: VaultState,
    pub guardian: Pubkey,
    pub policies: PolicySet,
    pub recovery: RecoveryConfig,
    pub nonce:u64,
    pub bump:u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum VaultState{
    Active,
    Frozen,
    Draining,
}

impl LimitTracker for Vault{
    fn get_limit(&self)->Option<u64> {
        Some(self.policies.spending.daily_cap)
    }

    fn get_spent(&self)->u64 {
        self.policies.spending.daily_spent
    }

    fn set_spent(&mut self,amount:u64) {
        self.policies.spending.daily_spent = amount;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct RecoveryConfig {
    pub timeout_seconds: i64,
    pub last_guardian_activity: i64,
    pub backup_guardian: Option<Pubkey>,
}