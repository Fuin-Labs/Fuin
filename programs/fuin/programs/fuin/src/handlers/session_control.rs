use anchor_lang::prelude::*;

use crate::{state::{Session, Vault}, error::ErrorCode};

#[derive(Accounts)]
#[instruction(nonce_vault: u64, nonce_session: u64)]
pub struct SessionControl<'info>{
    #[account(mut)]
    pub gaurdian: Signer<'info>,

    #[account(
        seeds = [b"vault", guardian.key().as_ref(), &nonce_vault.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian,
    )]
    pub vault: Account<'info,Vault>,

    #[account(
        mut,
        seeds = [
            b"session",
            guardian.key().as_ref(),
            vault.key().as_ref(),
            nonce_session.to_le_bytes().as_ref(),
        ],
        bump = session.bump,
        has_one = vault, 
    )]
    pub session: Account<'info, Session>,
}

pub enum SessionAction{
    Revoke,
    Pause,
    Unpause
}

pub fn session_control(
    ctx:Context<SessionControl>,
    _nv: u64, 
    _ns: u64,
    status: u8, // 0 = Revoke , 1 = Pause , 2 = Active
)->Result<()>{

    let session = &mut ctx.accounts.session;

    match status{
        0 =>{
            // revoked
            session.is_active = false;
            session.expires_at = 0;
            msg!("Session Revoked");
        },
        1 => {
            // pause
            session.is_active = false;
            msg!("Session Paused");
        },
        2 =>{
            // Unpause
            let clock = Clock::get()?;
            require!(session.expires_at > clock.unix_timestamp , ErrorCode::SessionExpired);
            session.is_active = true;
            msg!("Session Resumed");
        },
        _=>{
            return err!(ErrorCode::InvalidAction)
        }
    }

    Ok(())   
}