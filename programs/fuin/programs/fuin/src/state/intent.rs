use anchor_lang::prelude::*;

use crate::state::predicate::GoalPredicate;

pub const FUIN_POLICY_VERSION: u32 = 1;
pub const INTENT_MAX_DEPTH: u8 = 8;

#[derive(InitSpace)]
#[account]
pub struct Intent {
    pub user: Pubkey,
    pub agent: Pubkey,
    pub parent_intent: Option<Pubkey>,
    pub goal_predicate: GoalPredicate,
    pub budget: u64,
    pub remaining_budget: u64,
    pub expires_at: i64,
    pub nonce: u64,
    pub policy_version: u32,
    pub created_at: i64,
    pub revoked: bool,
    pub depth: u8,
    pub bump: u8,
}

impl Intent {
    pub fn is_expired(&self, now_ts: i64) -> bool {
        now_ts > self.expires_at
    }

    pub fn assert_active(&self, now_ts: i64) -> Result<()> {
        require!(!self.revoked, crate::error::ErrorCode::IntentRevoked);
        require!(!self.is_expired(now_ts), crate::error::ErrorCode::IntentExpired);
        Ok(())
    }

    pub fn debit(&mut self, amount: u64) -> Result<()> {
        require!(
            self.remaining_budget >= amount,
            crate::error::ErrorCode::IntentBudgetExceeded
        );
        self.remaining_budget -= amount;
        Ok(())
    }
}

#[event]
pub struct IntentSigned {
    pub intent: Pubkey,
    pub user: Pubkey,
    pub agent: Pubkey,
    pub parent: Option<Pubkey>,
    pub budget: u64,
    pub expires_at: i64,
    pub depth: u8,
}

#[event]
pub struct AuthorizeEvent {
    pub intent: Pubkey,
    pub agent: Pubkey,
    pub target_program: Pubkey,
    pub spend: u64,
    pub ts: i64,
}

#[event]
pub struct IntentRevoked {
    pub intent: Pubkey,
    pub by: Pubkey,
    pub ts: i64,
}
