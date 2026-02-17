use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

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

pub fn withdraw(ctx:Context<Withdraw>, nonce: u64, amount: u64)->Result<()>{

    let vault = &mut ctx.accounts.vault;
    let guardian = &mut ctx.accounts.guardian;

    let vault_info = vault.to_account_info();
    let recipient_info = guardian.to_account_info();

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **recipient_info.try_borrow_mut_lamports()? +=amount;
    msg!("Emergency Withdraw: {} lamports recovered", amount);

    Ok(())
}