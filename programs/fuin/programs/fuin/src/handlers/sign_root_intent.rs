use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::intent::{Intent, IntentSigned, FUIN_POLICY_VERSION};
use crate::state::predicate::GoalPredicate;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct SignRootIntent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: agent pubkey is recorded into intent, no signing required at root creation
    pub agent: UncheckedAccount<'info>,

    #[account(
        init,
        payer = user,
        seeds = [
            b"intent",
            user.key().as_ref(),
            agent.key().as_ref(),
            &nonce.to_le_bytes(),
        ],
        bump,
        space = Intent::DISCRIMINATOR.len() + Intent::INIT_SPACE,
    )]
    pub intent: Account<'info, Intent>,

    pub system_program: Program<'info, System>,
}

pub fn sign_root_intent(
    ctx: Context<SignRootIntent>,
    nonce: u64,
    goal_predicate: GoalPredicate,
    budget: u64,
    expires_at: i64,
) -> Result<()> {
    let clock = Clock::get()?;
    require!(expires_at > clock.unix_timestamp, ErrorCode::IntentExpired);

    let intent = &mut ctx.accounts.intent;
    intent.set_inner(Intent {
        user: ctx.accounts.user.key(),
        agent: ctx.accounts.agent.key(),
        parent_intent: None,
        goal_predicate,
        budget,
        remaining_budget: budget,
        expires_at,
        nonce,
        policy_version: FUIN_POLICY_VERSION,
        created_at: clock.unix_timestamp,
        revoked: false,
        depth: 0,
        bump: ctx.bumps.intent,
    });

    emit!(IntentSigned {
        intent: intent.key(),
        user: intent.user,
        agent: intent.agent,
        parent: None,
        budget,
        expires_at,
        depth: 0,
    });

    msg!("Root intent signed: {}", intent.key());
    Ok(())
}
