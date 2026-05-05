use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::intent::{Intent, IntentRevoked};

#[derive(Accounts)]
pub struct RevokeIntent<'info> {
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = intent.user == user.key() @ ErrorCode::UserMismatch,
    )]
    pub intent: Account<'info, Intent>,
}

pub fn revoke_intent(ctx: Context<RevokeIntent>) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    require!(!intent.revoked, ErrorCode::IntentRevoked);
    intent.revoked = true;

    let clock = Clock::get()?;
    emit!(IntentRevoked {
        intent: intent.key(),
        by: ctx.accounts.user.key(),
        ts: clock.unix_timestamp,
    });

    msg!("Intent revoked: {}", intent.key());
    Ok(())
}
