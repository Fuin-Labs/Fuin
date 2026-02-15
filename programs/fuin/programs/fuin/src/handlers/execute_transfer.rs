use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use crate::{error::ErrorCode, state::{Session, Vault}};

#[derive(Accounts)]
#[instruction(nonce_vault:u64,nonce_session:u64)]
pub struct ExecuteTransfer<'info>{

    #[account(mut)]
    pub relayer:Signer<'info>,

    pub session_key: AccountInfo<'info>,

    pub guardian: AccountInfo<'info>,

    #[account(
        mut, 
        seeds = [
            b"vault",
            guardian.key.as_ref(),
            &nonce_vault.to_le_bytes(),
        ],
        bump = vault.bump,
    )]
    pub vault: Account<'info,Vault>,

    #[account(
        mut,
        seeds = [
            b"session",
            guardian.key.as_ref(),
            vault.key().as_ref(),
            nonce_session.to_le_bytes().as_ref(),
        ],
        bump = session.bump,
        constraint = session.vault == vault.key() @ErrorCode::InvalidSession,
        constraint = session.authority == session_key.key() @ErrorCode::InvalidSession, 
    )]
    pub session: Account<'info,Session>,

    #[account(mut)]
    pub destination: AccountInfo<'info>,

    pub system_program:Program<'info,System>,

}

pub fn execute_transfer<'info>(ctx:Context<ExecuteTransfer>, nonce_vault:u64, nonce_session: u64, amount:u64)->Result<()>{
    
    let vault = &mut ctx.accounts.vault;
    let session = &ctx.accounts.session;
    let clock = Clock::get()?;

    if !vault.whitelisted_address.is_empty() {
        require!(vault.whitelisted_address.contains(&ctx.accounts.destination.key()), ErrorCode::AddressNotWhitelisted);
    }
    require!(session.is_active,ErrorCode::SessionInactive);
    require!(clock.unix_timestamp <= session.expires_at, ErrorCode::SessionExpired);

    // Time-based reset
    if clock.epoch > vault.last_reset_epoch {
        vault.daily_spent = 0;
        vault.last_reset_epoch = clock.epoch;
    };

    // Policy Check 
    // 1) Global Vault Limit
    require!(vault.daily_spent.checked_add(amount).unwrap() <= vault.daily_limit, ErrorCode::DailyLimitExceeded);

    // 2) Session Specific Limit 
    match session.daily_limit{
        Some(val)=>{
            if let Some(total_spend) = session.session_spend {
                require!(total_spend.checked_add(amount).unwrap() <= val, ErrorCode::SessionLimitExceeded);
            }
        },
        None=>{
            msg!("Session spending limit is not set");
        }
    };

    vault.daily_spent = vault.daily_spent.checked_add(amount).unwrap();

    let seeds: &[&[&[u8]]] = &[&[
        b"vault",
        vault.guardian.as_ref(),
        &vault.nonce.to_le_bytes(),
        &[vault.bump]
    ]];

    let cpi_accounts = Transfer{
        from: vault.to_account_info(),
        to: ctx.accounts.destination.to_account_info()
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(), 
        cpi_accounts, 
        seeds
    );

    transfer(cpi_ctx, amount);

    msg!("Transfer executed: {} lamports. Daily Spent: {}", amount, vault.daily_spent);
    Ok(())
}