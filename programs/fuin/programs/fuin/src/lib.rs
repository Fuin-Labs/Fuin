use anchor_lang::prelude::*;

declare_id!("E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy");

pub mod state;
pub mod handlers;
pub mod error;
pub mod pricing;

pub use handlers::*;

#[program]
pub mod fuin {
    use super::*;

    pub fn init_vault(ctx: Context<InitializeVault>, nonce: u64, daily_cap: u64, per_tx_cap: u64, allowed_programs: Vec<Pubkey>)->Result<()>{
        handlers::init_vault(ctx, nonce, daily_cap, per_tx_cap, allowed_programs)
    }

    pub fn issue_delegate(
        ctx: Context<IssueDelegate>,
        vault_nonce: u64,
        delegate_nonce: u64,
        delegate_key: Pubkey,
        permissions: u16,
        daily_limit: u64,
        max_uses: u32,
        validity_in_secs: i64,
    )->Result<()>{
        handlers::issue_delegate(ctx, vault_nonce, delegate_nonce, delegate_key, permissions, daily_limit, max_uses, validity_in_secs)
    }

    pub fn execute_transfer<'info>(ctx: Context<ExecuteTransfer>, nonce_vault: u64, nonce_delegate: u64, amount: u64)->Result<()>{
        handlers::execute_transfer(ctx, nonce_vault, nonce_delegate, amount)
    }

    pub fn execute_spl_transfer(ctx: Context<ExecuteSplTransfer>, nonce_vault: u64, nonce_delegate: u64, amount: u64, feed_id: String)->Result<()>{
        handlers::execute_spl_transfer(ctx, nonce_vault, nonce_delegate, amount, feed_id)
    }

    pub fn update_vault(ctx: Context<UpdateVault>, nonce: u64, new_daily_cap: Option<u64>, new_per_tx_cap: Option<u64>)->Result<()>{
        handlers::update_vault(ctx, nonce, new_daily_cap, new_per_tx_cap)
    }

    pub fn delegate_control(ctx: Context<DelegateControl>, nonce_vault: u64, nonce_delegate: u64, status: u8)->Result<()>{
        handlers::delegate_control(ctx, nonce_vault, nonce_delegate, status)
    }

    pub fn withdraw(ctx: Context<Withdraw>, nonce: u64, amount: u64)->Result<()>{
        handlers::withdraw(ctx, nonce, amount)
    }

    pub fn freeze_vault(ctx: Context<FreezeVault>, nonce: u64) -> Result<()> {
        handlers::freeze_vault(ctx, nonce)
    }

    pub fn unfreeze_vault(ctx: Context<FreezeVault>, nonce: u64) -> Result<()> {
        handlers::unfreeze_vault(ctx, nonce)
    }
}
