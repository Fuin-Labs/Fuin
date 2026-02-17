use anchor_lang::prelude::*;

declare_id!("6vHQB9y3UVUXPJgdJz4cUSxEQ9FMp7Zar6ey6LNnNsRm");

pub mod state;
pub mod handlers;
pub mod error;
pub mod pricing;

#[program]
pub mod fuin {
    use super::*;

    pub fn init_vault(ctx: Context<InitializeVault>, nonce:u64, daily_limit: u64,whitelisted_address:Vec<Pubkey>)->Result<()>{
        handlers::init_vault(ctx, nonce, daily_limit,whitelisted_address)
    }

    /// Issues a Session key for a bot or Teenager
    pub fn issue_session(ctx:Context<IssueSesson>, nonce: u64,session_key:Pubkey,validity_in_secs: i64,daily_limit: Option<u64>,session_spend:Option<u64>)->Result<()>{
        handlers::issue_session(ctx, nonce, session_key, validity_in_secs, daily_limit,session_spend)
    }

    pub fn execute_transfer<'info>(ctx:Context<ExecuteTransfer>, nonce_vault:u64, nonce_session: u64, amount:u64)->Result<()>{
        handlers::execute_transfer(ctx, nonce_vault, nonce_session, amount)
    }

    pub fn execute_spl_transfer(ctx: Context<ExecuteSplTransfer>,nonce_vault:u64, nonce_session: u64,amount: u64)->Result<()>{
        handlers::execute_spl_transfer(ctx, nonce_vault, nonce_session, amount, feed_id)
    }

    pub fn update_vault(ctx:Context<UpdateVault>,_nonce:u64, new_daily_limit: Option<u64>, new_whitelist: Option<Vec<Pubkey>>)->Result<()>{
        handlers::update_vault(ctx, nonce, new_daily_limit, new_whitelist)
    }

    pub fn session_control(
        ctx:Context<SessionControl>,
        _nv: u64, 
        _ns: u64,
        status: u8, // 0 = Revoke , 1 = Pause , 2 = Active
    )->Result<()>{
        handlers::session_control(ctx, nv, ns, status)
    }

    pub fn withdraw(ctx:Context<Withdraw>, nonce: u64, amount: u64)->Result<()>{
        handlers::withdraw(ctx, nonce, amount)
    }


}
