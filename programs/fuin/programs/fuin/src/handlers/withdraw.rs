use anchor_lang::prelude::*;

use crate::state::Vault;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct Withdraw<'info>{
    #[account(mut)]
    pub guardian: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", guardian.key().as_ref(), &nonce.to_le_bytes()],
        bump = vault.bump,
        has_one = guardian,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn withdraw(ctx:Context<Withdraw>, _nonce: u64, amount: u64)->Result<()>{
    let clock = Clock::get()?;

    let vault = &mut ctx.accounts.vault;
    vault.recovery.last_guardian_activity = clock.unix_timestamp;

    let vault_info = vault.to_account_info();
    let recipient_info = ctx.accounts.guardian.to_account_info();

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **recipient_info.try_borrow_mut_lamports()? += amount;
    msg!("Emergency Withdraw: {} lamports recovered", amount);

    Ok(())
}