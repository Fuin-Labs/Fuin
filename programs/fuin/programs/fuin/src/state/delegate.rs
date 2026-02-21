use anchor_lang::prelude::*;

use crate::state::LimitTracker;

pub const CAN_SWAP: u16 = 1;      // binary: 0001
pub const CAN_TRANSFER: u16 = 2;  // binary: 0010
pub const CAN_STAKE: u16 = 4;     // binary: 0100
pub const CAN_LP: u16 = 8;        // binary: 1000

#[derive(InitSpace)]
#[account]
pub struct Delegate{
    pub vault: Pubkey,
    pub authority: Pubkey,
    pub permissions: u16,
    pub daily_limit: u64,
    pub daily_spent: u64,
    pub last_reset_epoch: u64,
    pub max_uses: u32,
    pub uses: u32,
    pub expiry: i64,
    pub is_active: bool,
    pub nonce: u64,
    pub bump: u8,
}

impl Delegate{
    pub fn has_permission(&self, perm: u16) -> bool {
        self.permissions & perm != 0
    }
}

impl LimitTracker for Delegate{
    fn get_limit(&self) -> Option<u64> {
        if self.daily_limit > 0 {
            Some(self.daily_limit)
        } else {
            None
        }
    }

    fn get_spent(&self) -> u64 {
        self.daily_spent
    }

    fn set_spent(&mut self, amount: u64) {
        self.daily_spent = amount;
    }
}
