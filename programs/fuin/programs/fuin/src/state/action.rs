use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked;

use crate::error::ErrorCode;

pub const SPL_TOKEN_PROGRAM_ID: Pubkey =
    Pubkey::from_str_const("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
pub const SPL_TOKEN_2022_PROGRAM_ID: Pubkey =
    Pubkey::from_str_const("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
pub const JUPITER_V6_PROGRAM_ID: Pubkey =
    Pubkey::from_str_const("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

const SPL_TRANSFER_DISC: u8 = 3;
const SPL_TRANSFER_CHECKED_DISC: u8 = 12;
const JUPITER_SHARED_ACCOUNTS_ROUTE_DISC: [u8; 8] =
    [193, 32, 155, 51, 65, 214, 156, 129];

#[derive(Clone, Debug)]
pub enum ActionDescriptor {
    SplTransfer {
        program: Pubkey,
        source: Pubkey,
        dest: Pubkey,
        mint: Option<Pubkey>,
        amount: u64,
    },
    JupiterSwap {
        in_amount: u64,
        out_min: u64,
    },
    ReadOnly,
}

impl ActionDescriptor {
    pub fn is_read_only(&self) -> bool {
        matches!(self, ActionDescriptor::ReadOnly)
    }

    pub fn is_native_transfer(&self) -> bool {
        false
    }

    pub fn program_id(&self) -> Pubkey {
        match self {
            ActionDescriptor::SplTransfer { program, .. } => *program,
            ActionDescriptor::JupiterSwap { .. } => JUPITER_V6_PROGRAM_ID,
            ActionDescriptor::ReadOnly => Pubkey::default(),
        }
    }

    pub fn spend(&self) -> u64 {
        match self {
            ActionDescriptor::SplTransfer { amount, .. } => *amount,
            ActionDescriptor::JupiterSwap { in_amount, .. } => *in_amount,
            ActionDescriptor::ReadOnly => 0,
        }
    }

    pub fn parse(
        instructions_sysvar: &AccountInfo,
        index: u8,
    ) -> Result<ActionDescriptor> {
        let ix = load_instruction_at_checked(index as usize, instructions_sysvar)
            .map_err(|_| error!(ErrorCode::InvalidActionIndex))?;
        let prog = ix.program_id;

        if prog == SPL_TOKEN_PROGRAM_ID || prog == SPL_TOKEN_2022_PROGRAM_ID {
            let data = &ix.data;
            require!(!data.is_empty(), ErrorCode::ActionParseFailed);
            match data[0] {
                SPL_TRANSFER_DISC => {
                    require!(data.len() >= 9, ErrorCode::ActionParseFailed);
                    let mut amount_bytes = [0u8; 8];
                    amount_bytes.copy_from_slice(&data[1..9]);
                    let amount = u64::from_le_bytes(amount_bytes);
                    require!(ix.accounts.len() >= 3, ErrorCode::ActionParseFailed);
                    Ok(ActionDescriptor::SplTransfer {
                        program: prog,
                        source: ix.accounts[0].pubkey,
                        dest: ix.accounts[1].pubkey,
                        mint: None,
                        amount,
                    })
                }
                SPL_TRANSFER_CHECKED_DISC => {
                    require!(data.len() >= 9, ErrorCode::ActionParseFailed);
                    let mut amount_bytes = [0u8; 8];
                    amount_bytes.copy_from_slice(&data[1..9]);
                    let amount = u64::from_le_bytes(amount_bytes);
                    require!(ix.accounts.len() >= 4, ErrorCode::ActionParseFailed);
                    Ok(ActionDescriptor::SplTransfer {
                        program: prog,
                        source: ix.accounts[0].pubkey,
                        dest: ix.accounts[2].pubkey,
                        mint: Some(ix.accounts[1].pubkey),
                        amount,
                    })
                }
                _ => Err(error!(ErrorCode::ActionUnsupported)),
            }
        } else if prog == JUPITER_V6_PROGRAM_ID {
            let data = &ix.data;
            require!(data.len() >= 8, ErrorCode::ActionParseFailed);
            let disc = &data[..8];
            require!(
                disc == JUPITER_SHARED_ACCOUNTS_ROUTE_DISC,
                ErrorCode::ActionUnsupported
            );
            require!(data.len() >= 8 + 8 + 8, ErrorCode::ActionParseFailed);
            let mut in_bytes = [0u8; 8];
            let mut out_bytes = [0u8; 8];
            in_bytes.copy_from_slice(&data[8..16]);
            out_bytes.copy_from_slice(&data[16..24]);
            Ok(ActionDescriptor::JupiterSwap {
                in_amount: u64::from_le_bytes(in_bytes),
                out_min: u64::from_le_bytes(out_bytes),
            })
        } else {
            Err(error!(ErrorCode::ActionUnsupported))
        }
    }
}
