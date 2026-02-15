use anchor_lang::prelude::*;

use crate::state::{Session, Vault};

#[derive(Accounts)]
#[instruction(nonce:u64)]
pub struct IssueSesson<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        seeds = [
            b"vault",
            guardian.key.as_ref(),
            &nonce.to_le_bytes(),
        ],
        bump = Vault.bump,
    )]
    pub vault: Account<'info,Vault>,

    #[account(
        init,
        payer = guardian,
        seeds = [
            b"session",
            guardian.key.as_ref(),
            vault.key().as_ref(),
            nonce.to_le_bytes().as_ref(),
        ],
        bump,
        space = Session::DISCRIMINATOR.len() + Session::INIT_SPACE,
    )]
    pub session: Account<'info,Session>,

    pub system_program: Program<'info,System>,
}

pub fn issue_session(ctx:Context<IssueSesson>, nonce: u64,session_key:Pubkey,validity_in_secs: i64,daily_limit: u64)->Result<()>{
    
    let session = &mut ctx.accounts.session;

    let expiry_time = Clock::get()?.unix_timestamp + validity_in_secs;

    session.set_inner(Session { 
        vault: ctx.accounts.vault.key(), 
        authority: ctx.accounts.guardian.key(), 
        daily_limit, 
        expires_at: expiry_time, 
        is_active: true, 
        nonce, 
        bump: ctx.bumps.session,
    });

    msg!("Session issued {:?}",session_key);
    
    Ok(())
}