use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;

use crate::error::ErrorCode;
use crate::state::action::ActionDescriptor;
use crate::state::intent::{AuthorizeEvent, Intent, FUIN_POLICY_VERSION};

#[derive(Accounts)]
pub struct VerifyAuthorizes<'info> {
    pub agent: Signer<'info>,

    #[account(
        mut,
        constraint = intent.agent == agent.key() @ ErrorCode::AgentMismatch,
    )]
    pub intent: Account<'info, Intent>,

    /// CHECK: validated by address constraint to be the SysvarInstructions sysvar.
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,
}

pub fn verify_authorizes<'info>(
    ctx: Context<'_, '_, 'info, 'info, VerifyAuthorizes<'info>>,
    target_ix_index: u8,
) -> Result<()> {
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    let intent = &mut ctx.accounts.intent;
    intent.assert_active(now)?;
    require!(
        intent.policy_version == FUIN_POLICY_VERSION,
        ErrorCode::StalePolicyVersion
    );

    let action = ActionDescriptor::parse(
        &ctx.accounts.instructions_sysvar.to_account_info(),
        target_ix_index,
    )?;

    // Evaluate the leaf intent's predicate first, then walk ancestors. Each
    // ancestor's predicate must also accept this action — that's how cumulative
    // scope is enforced even when child predicates are more permissive.
    intent.goal_predicate.evaluate(&action, now)?;
    {
        let mut expected_parent = intent.parent_intent;
        let last_user = intent.user;
        for ancestor_ai in ctx.remaining_accounts.iter() {
            let expected_pk = expected_parent.ok_or(error!(ErrorCode::BrokenAncestorChain))?;
            require_keys_eq!(ancestor_ai.key(), expected_pk, ErrorCode::BrokenAncestorChain);
            let parent_acc: Account<Intent> = Account::try_from(ancestor_ai)
                .map_err(|_| error!(ErrorCode::BrokenAncestorChain))?;
            require!(!parent_acc.revoked, ErrorCode::IntentRevoked);
            require!(!parent_acc.is_expired(now), ErrorCode::IntentExpired);
            require_keys_eq!(parent_acc.user, last_user, ErrorCode::UserMismatch);
            parent_acc.goal_predicate.evaluate(&action, now)?;
            expected_parent = parent_acc.parent_intent;
        }
        require!(expected_parent.is_none(), ErrorCode::BrokenAncestorChain);
    }

    let spend = action.spend();
    if spend > 0 {
        require!(
            !intent
                .goal_predicate
                .has(crate::state::predicate::PRED_READ_ONLY),
            ErrorCode::ReadOnlyViolation
        );
        intent.debit(spend)?;
    }

    emit!(AuthorizeEvent {
        intent: intent.key(),
        agent: intent.agent,
        target_program: action.program_id(),
        spend,
        ts: now,
    });

    Ok(())
}

