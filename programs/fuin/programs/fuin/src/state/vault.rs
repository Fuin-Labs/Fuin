use anchor_lang::prelude::*;

use crate::state::LimitTracker;

#[derive(InitSpace)]
#[account]
pub struct Vault{
    pub guardian: Pubkey,
    pub daily_limit:u64,
    pub daily_spent: u64,
    pub last_reset_epoch:u64,
    #[max_len(32)]
    pub whitelisted_address: Vec<Pubkey>,
    pub nonce:u64,
    pub bump:u8,
}

impl LimitTracker for Vault{
    fn get_limit(&self)->Option<u64> {
        Some(self.daily_limit)
    }

    fn get_spent(&self)->u64 {
        self.daily_spent
    }

    fn set_spent(&mut self,amount:u64) {
        self.daily_spent = amount;
    }
}