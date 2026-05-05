use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::action::ActionDescriptor;

pub const PRED_PRICE: u8 = 0b0000_0001;
pub const PRED_DEX: u8 = 0b0000_0010;
pub const PRED_TIME: u8 = 0b0000_0100;
pub const PRED_READ_ONLY: u8 = 0b0000_1000;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Eq, Debug)]
pub struct GoalPredicate {
    pub flags: u8,
    pub price_token: Pubkey,
    pub price_threshold_usd_micros: u64,
    pub price_oracle: Pubkey,
    #[max_len(4)]
    pub allowed_dexes: Vec<Pubkey>,
    pub time_start_ts: i64,
    pub time_end_ts: i64,
}

impl GoalPredicate {
    pub fn read_only() -> Self {
        Self {
            flags: PRED_READ_ONLY,
            price_token: Pubkey::default(),
            price_threshold_usd_micros: 0,
            price_oracle: Pubkey::default(),
            allowed_dexes: Vec::new(),
            time_start_ts: 0,
            time_end_ts: 0,
        }
    }

    pub fn has(&self, flag: u8) -> bool {
        self.flags & flag != 0
    }

    pub fn evaluate(&self, action: &ActionDescriptor, now_ts: i64) -> Result<()> {
        if self.has(PRED_READ_ONLY) {
            require!(action.is_read_only(), ErrorCode::ActionExceedsScope);
            return Ok(());
        }
        if self.has(PRED_TIME) {
            require!(
                now_ts >= self.time_start_ts && now_ts <= self.time_end_ts,
                ErrorCode::OutsideAllowedTime
            );
        }
        if self.has(PRED_DEX) {
            let prog = action.program_id();
            require!(
                self.allowed_dexes.contains(&prog) || action.is_native_transfer(),
                ErrorCode::ProgramNotAllowed
            );
        }
        Ok(())
    }
}
