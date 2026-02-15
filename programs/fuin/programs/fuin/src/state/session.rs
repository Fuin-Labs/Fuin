pub use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Session{
    pub vault: Pubkey, // associating a session with a vault,
    pub authority: Pubkey, // ephemeral key,
    pub daily_limit: u64, // specific limits for this session,
    pub expires_at: i64,
    pub is_active: bool,
    pub nonce: u64,
    pub bump:u8,
}