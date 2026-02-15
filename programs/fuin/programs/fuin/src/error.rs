use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Session is inactive or revoked.")]
    SessionInactive,

    #[msg("Session does not belong to this vault.")]
    InvalidSession,

    #[msg("Session has expired.")]
    SessionExpired,
}
