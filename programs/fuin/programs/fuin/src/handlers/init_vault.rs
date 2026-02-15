use anchor_lang::prelude::*;
// use solana_program::{clock::Clock, sysvar::Sysvar};
use crate::{state::vault::Vault, error::ErrorCode}

#[derive(Accounts)]
#[instruction(nonce:u64)]
pub struct InitializeVault<'info>{
    #[account(mut)]
    pub guardian : Signer<'info>,

    #[account(
        init,
        payer = guardian,
        seeds = [
            b"vault",
            guardian.key().as_ref(),
            &nonce.to_le_bytes(),
        ],
        bump,
        space = Vault::DISCRIMINATOR.len() + Vault::INIT_SPACE,
    )]
    pub vault: Account<'info,Vault>,

    pub system_program : Program<'info,System>,
}

pub fn init_vault(ctx: Context<InitializeVault>, nonce:u64, daily_limit: u64,whitelisted_address:Vec<Pubkey>)->Result<()>{

    require!(!whitelisted_address.is_empty(), ErrorCode::WhitelistAccountsAreNotProvided);

    let clock = Clock::get()?;

    let epoch = clock.epoch;

    let vault = &mut ctx.accounts.vault;
    vault.set_inner(Vault { 
        guardian: ctx.accounts.guardian.key(), 
        daily_limit, 
        daily_spent : 0, 
        last_reset_epoch: epoch, 
        nonce, 
        whitelisted_address,
        bump: ctx.bumps.vault, 
    });

    Ok(())
}