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
    #[msg("Oracle price is invalid or negative.")]
    InvalidPrice,
    #[msg("Math overflow during pricing.")]
    PricingOverflow,
    #[msg("Max length reached")]
    WhitelistFull,
    #[msg("Invalid Action for Session Control")]
    InvalidAction,
    #[msg("Vault is frozen, no operations allowed")]
    VaultFrozen,
    #[msg("Per-transaction limit exceeded")]
    PerTxLimitExceeded,
    #[msg("Program is not allowed by policy")]
    ProgramNotAllowed,
    #[msg("Operation is outside allowed time window")]
    OutsideAllowedTime,
    #[msg("Transaction requires guardian co-signature")]
    RequiresGuardianCosign,
    #[msg("Permission denied")]
    PermissionDenied,
    #[msg("Maximum uses exceeded")]
    MaxUsesExceeded,
    #[msg("Delegate has expired")]
    DelegateExpired,
    #[msg("Delegate is inactive")]
    DelegateInactive,
    #[msg("Swap execution failed")]
    SwapFailed,
    #[msg("Intent has been revoked")]
    IntentRevoked,
    #[msg("Intent has expired")]
    IntentExpired,
    #[msg("Intent budget exceeded")]
    IntentBudgetExceeded,
    #[msg("Child intent budget exceeds parent remaining budget")]
    ChildBudgetTooLarge,
    #[msg("Child intent expires after parent")]
    ChildExpiresAfterParent,
    #[msg("Child policy version mismatch with parent")]
    PolicyVersionMismatch,
    #[msg("Child predicate is not a subset of parent predicate")]
    PredicateNotSubset,
    #[msg("Wrong parent intent reference")]
    WrongParentReference,
    #[msg("Action exceeds intent scope")]
    ActionExceedsScope,
    #[msg("Action target index is invalid")]
    InvalidActionIndex,
    #[msg("Failed to parse action instruction")]
    ActionParseFailed,
    #[msg("Action target is not a supported program")]
    ActionUnsupported,
    #[msg("Intent depth limit exceeded")]
    DepthLimitExceeded,
    #[msg("Mismatched user across intent chain")]
    UserMismatch,
    #[msg("Agent does not match intent")]
    AgentMismatch,
    #[msg("Ancestor chain in remaining_accounts is malformed")]
    BrokenAncestorChain,
    #[msg("Read-only intent cannot spend")]
    ReadOnlyViolation,
    #[msg("Current policy version does not match intent")]
    StalePolicyVersion,
}
