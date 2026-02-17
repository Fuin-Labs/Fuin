use anchor_lang::prelude::*;

use crate::{state::Vault, error::ErrorCode};

#[derive(Accounts)]
#[instruction(nonce:u64)]
pub struct UpdateVault<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        seeds = [b"vault", guardian.key().as_ref(), &nonce.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian
    )]
    pub vault : Account<'info, Vault>,
}

pub fn update_vault(ctx:Context<UpdateVault>,_nonce:u64, new_daily_limit: Option<u64>, new_whitelist: Option<Vec<Pubkey>>)->Result<()>{
    let vault = &mut ctx.accounts.vault;

    if let Some(limit) = new_daily_limit{
        vault.daily_limit = limit;
        msg!("Vault: Daily limit updated to {}", limit);
    }

    if let Some(whitelist_program) = new_whitelist{
        require!(whitelist_program.len() >32 , ErrorCode::WhitelistFull);
        vault.whitelisted_address = whitelist;
        msg!("Vault: Whitelist updated");
    }

    Ok(())
}