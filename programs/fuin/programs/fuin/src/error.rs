use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Session is inactive or revoked.")]
    SessionInactive,
    #[msg("Session does not belong to this vault.")]
    InvalidSession,
    #[msg("Session has expired.")]
    SessionExpired,
    #[msg("Destination address is not in the whitelist.")]
    AddressNotWhitelisted,
    #[msg("Daily spending limit exceeded.")]
    DailyLimitExceeded,
    #[msg("Session Spending limit exceeded.")]
    SessionLimitExceeded,
    #[msg("Transaction limit exceeded.")]
    TxLimitExceeded,
    #[msg("Math Overflow.")]
    Overflow,   
    #[msg("Whitelist Account are not provided")]
    WhitelistAccountsAreNotProvided,
    #[msg("MintMismatch")]
    MintMismatch,
    #[msg("Vault Owner Mismatch")]
    VaultOwnerMismatch,
}
