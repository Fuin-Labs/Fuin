use anchor_lang::prelude::*;

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