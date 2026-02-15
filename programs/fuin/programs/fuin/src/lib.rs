use anchor_lang::prelude::*;

declare_id!("6vHQB9y3UVUXPJgdJz4cUSxEQ9FMp7Zar6ey6LNnNsRm");

#[program]
pub mod fuin {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
