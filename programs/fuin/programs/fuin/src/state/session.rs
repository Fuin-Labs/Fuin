pub use anchor_lang::prelude::*;

use crate::state::LimitTracker;

#[derive(InitSpace)]
#[account]
pub struct Session{
    pub vault: Pubkey, // associating a session with a vault,
    pub authority: Pubkey, // ephemeral key,
    pub daily_limit: Option<u64>, // specific limits for this session,
    pub session_spend: Option<u64>,
    pub expires_at: i64,
    pub is_active: bool,
    pub nonce: u64,
    pub bump:u8,
}

#[derive(AnchorSerialize,AnchorDeserialize)]
pub enum SessionStatus{
    Active,
    Paused,
    Revoked,
}

impl LimitTracker for Session{
    fn get_limit(&self) -> Option<u64> {
        self.daily_limit
    }

    fn get_spent(&self) -> u64 {
        self.session_spend.unwrap_or(0)
    }

    fn set_spent(&mut self, amount: u64) {
        self.session_spend = Some(amount);
    }
}