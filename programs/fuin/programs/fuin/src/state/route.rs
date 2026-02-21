use anchor_lang::prelude::*;

use crate::state::delegate::{CAN_SWAP, CAN_STAKE, CAN_TRANSFER};

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum Route{
    Transfer {
        amount: u64,
        destination: Pubkey,
    },
    SimpleSwap {
        amount_in: u64,
        min_amount_out: u64,
        mint_in: Pubkey,
        mint_out: Pubkey,
    },
    StakeSOL {
        amount: u64,
        validator: Pubkey,
    },
}

impl Route{
    pub fn required_permission(&self) -> u16 {
        match self {
            Route::Transfer { .. } => CAN_TRANSFER,
            Route::SimpleSwap { .. } => CAN_SWAP,
            Route::StakeSOL { .. } => CAN_STAKE,
        }
    }

    pub fn amount(&self) -> u64 {
        match self {
            Route::Transfer { amount, .. } => *amount,
            Route::SimpleSwap { amount_in, .. } => *amount_in,
            Route::StakeSOL { amount, .. } => *amount,
        }
    }
}
