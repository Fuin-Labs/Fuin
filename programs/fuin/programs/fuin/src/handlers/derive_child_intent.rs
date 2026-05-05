use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::intent::{Intent, IntentSigned, INTENT_MAX_DEPTH};
use crate::state::predicate::GoalPredicate;

#[derive(Accounts)]
#[instruction(child_nonce: u64)]
pub struct DeriveChildIntent<'info> {
    /// Parent agent attests by signing this transaction. Spec §3.4 hackathon shortcut:
    /// tx-level signature on the derive_child_intent ix == parent attestation that
    /// the proposed child predicate is a valid subset of the parent's authority.
    #[account(mut)]
    pub parent_agent: Signer<'info>,

    #[account(
        mut,
        constraint = parent_intent.agent == parent_agent.key() @ ErrorCode::AgentMismatch,
    )]
    pub parent_intent: Account<'info, Intent>,

    /// CHECK: child agent pubkey is recorded into the new intent
    pub child_agent: UncheckedAccount<'info>,

    #[account(
        init,
        payer = parent_agent,
        seeds = [
            b"intent",
            parent_intent.user.as_ref(),
            child_agent.key().as_ref(),
            &child_nonce.to_le_bytes(),
        ],
        bump,
        space = Intent::DISCRIMINATOR.len() + Intent::INIT_SPACE,
    )]
    pub child_intent: Account<'info, Intent>,

    pub system_program: Program<'info, System>,
}

pub fn derive_child_intent(
    ctx: Context<DeriveChildIntent>,
    child_nonce: u64,
    child_predicate: GoalPredicate,
    child_budget: u64,
    child_expires_at: i64,
) -> Result<()> {
    let clock = Clock::get()?;
    let parent = &mut ctx.accounts.parent_intent;
    parent.assert_active(clock.unix_timestamp)?;

    require!(
        child_expires_at <= parent.expires_at,
        ErrorCode::ChildExpiresAfterParent
    );
    require!(child_expires_at > clock.unix_timestamp, ErrorCode::IntentExpired);
    require!(
        child_budget <= parent.remaining_budget,
        ErrorCode::ChildBudgetTooLarge
    );
    // Predicate subset is NOT formally checked here. Per architecture spec §3.4:
    // parent agent's signature on this tx is the trust anchor — abuse is bounded
    // by root scope because verify_authorizes walks the full ancestor chain and
    // evaluates EVERY ancestor's predicate against the action at execution time.

    let new_depth = parent
        .depth
        .checked_add(1)
        .ok_or(ErrorCode::DepthLimitExceeded)?;
    require!(new_depth <= INTENT_MAX_DEPTH, ErrorCode::DepthLimitExceeded);

    parent.remaining_budget -= child_budget;

    let child = &mut ctx.accounts.child_intent;
    child.set_inner(Intent {
        user: parent.user,
        agent: ctx.accounts.child_agent.key(),
        parent_intent: Some(parent.key()),
        goal_predicate: child_predicate,
        budget: child_budget,
        remaining_budget: child_budget,
        expires_at: child_expires_at,
        nonce: child_nonce,
        policy_version: parent.policy_version,
        created_at: clock.unix_timestamp,
        revoked: false,
        depth: new_depth,
        bump: ctx.bumps.child_intent,
    });

    emit!(IntentSigned {
        intent: child.key(),
        user: child.user,
        agent: child.agent,
        parent: Some(parent.key()),
        budget: child_budget,
        expires_at: child_expires_at,
        depth: new_depth,
    });

    msg!(
        "Child intent derived: {} parent: {} depth: {}",
        child.key(),
        parent.key(),
        new_depth
    );
    Ok(())
}
