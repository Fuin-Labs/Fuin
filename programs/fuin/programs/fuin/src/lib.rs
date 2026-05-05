use anchor_lang::prelude::*;

declare_id!("E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy");

declare_program!(dlmm);

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

    pub fn update_vault(ctx: Context<UpdateVault>, nonce: u64, new_daily_cap: Option<u64>, new_per_tx_cap: Option<u64>, new_allow_list: Option<Vec<Pubkey>>, new_deny_list: Option<Vec<Pubkey>>)->Result<()>{
        handlers::update_vault(ctx, nonce, new_daily_cap, new_per_tx_cap, new_allow_list, new_deny_list)
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

    pub fn execute_swap<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecuteSwap<'info>>,
        nonce_vault: u64,
        nonce_delegate: u64,
        amount_in: u64,
        min_amount_out: u64,
        feed_id: String,
    ) -> Result<()> {
        handlers::execute_swap(ctx, nonce_vault, nonce_delegate, amount_in, min_amount_out, feed_id)
    }

    // === Fuin v2 — Proof-of-Intent (swarm) ===

    pub fn sign_root_intent(
        ctx: Context<SignRootIntent>,
        nonce: u64,
        goal_predicate: crate::state::predicate::GoalPredicate,
        budget: u64,
        expires_at: i64,
    ) -> Result<()> {
        handlers::sign_root_intent(ctx, nonce, goal_predicate, budget, expires_at)
    }

    pub fn derive_child_intent(
        ctx: Context<DeriveChildIntent>,
        child_nonce: u64,
        child_predicate: crate::state::predicate::GoalPredicate,
        child_budget: u64,
        child_expires_at: i64,
    ) -> Result<()> {
        handlers::derive_child_intent(ctx, child_nonce, child_predicate, child_budget, child_expires_at)
    }

    pub fn verify_authorizes<'info>(
        ctx: Context<'_, '_, 'info, 'info, VerifyAuthorizes<'info>>,
        target_ix_index: u8,
    ) -> Result<()> {
        handlers::verify_authorizes(ctx, target_ix_index)
    }

    pub fn revoke_intent(ctx: Context<RevokeIntent>) -> Result<()> {
        handlers::revoke_intent(ctx)
    }
}
