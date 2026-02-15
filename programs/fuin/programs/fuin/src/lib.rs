use anchor_lang::prelude::*;

declare_id!("6vHQB9y3UVUXPJgdJz4cUSxEQ9FMp7Zar6ey6LNnNsRm");

pub mod state;
pub mod handlers;
pub mod error;

#[program]
pub mod fuin {
    use super::*;

    pub fn init_vault(ctx: Context<InitializeVault>, nonce:u64, daily_limit: u64)->Result<()>{
        handlers::init_vault(ctx, nonce, daily_limit)
    }

    pub fn issue_session(ctx:Context<IssueSesson>, nonce: u64,session_key:Pubkey,validity_in_secs: i64,daily_limit: u64)->Result<()>{
        handlers::issue_session(ctx, nonce, session_key, validity_in_secs, daily_limit)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
