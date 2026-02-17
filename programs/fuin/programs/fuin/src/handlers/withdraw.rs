use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use crate::state::Vault;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct Withdraw<'info>{
    #[account(mut)]
    pub gaurdian: Signer<'info>,

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
    let guardian_key = ctx.accounts.gaurdian.key();

    let nonce_bytes = vault.nonce.to_le_bytes();

    let seeds : &[&[&[u8]]] = &[&[
        b"vault",
        guardian_key.as_ref(),
        nonce_bytes.as_ref(),
        &[vault.bump]
    ]];

    let cpi_transfer_accounts = Transfer{
        from: vault.to_account_info(),
        to: ctx.accounts.gaurdian.to_account_info()
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(), 
        cpi_transfer_accounts, 
        seeds
    );

    transfer(cpi_context, amount);

    msg!("Emergency Withdraw: {} lamports recovered", amount);

    Ok(())
}