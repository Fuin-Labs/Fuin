use anchor_lang::prelude::*;

use crate::state::{Session, Vault};

#[derive(Accounts)]
#[instruction(vault_nonce:u64, session_nonce: u64)]
pub struct IssueSesson<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        seeds = [
            b"vault",
            guardian.key.as_ref(),
            &vault_nonce.to_le_bytes(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info,Vault>,

    #[account(
        init,
        payer = guardian,
        seeds = [
            b"session",
            guardian.key.as_ref(),
            vault.key().as_ref(),
            session_nonce.to_le_bytes().as_ref(),
        ],
        bump,
        space = Session::DISCRIMINATOR.len() + Session::INIT_SPACE,
    )]
    pub session: Account<'info,Session>,

    pub system_program: Program<'info,System>,
}

pub fn issue_session(ctx:Context<IssueSesson>,vault_nonce:u64, session_nonce: u64,session_key:Pubkey,validity_in_secs: i64,daily_limit: Option<u64>,session_spend:Option<u64> )->Result<()>{
    
    let session = &mut ctx.accounts.session;

    let expiry_time = Clock::get()?.unix_timestamp + validity_in_secs;

    session.set_inner(Session { 
        vault: ctx.accounts.vault.key(), 
        authority: session_key,
        daily_limit,
        session_spend, 
        expires_at: expiry_time, 
        is_active: true, 
        nonce:session_nonce, 
        bump: ctx.bumps.session,
    });

    msg!("Session issued {:?}",session_key);
    
    Ok(())
}