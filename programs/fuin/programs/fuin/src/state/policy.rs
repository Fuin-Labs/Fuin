use anchor_lang::prelude::*;

#[derive(AnchorSerialize,AnchorDeserialize,Clone,InitSpace)]
pub struct SpendingPolicy{
    // per epoch
    pub daily_cap: u64, 
    pub per_tx_cap: u64,
    pub daily_spent: u64,
    pub last_reset_epoch: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct ProgramPolicy{
    #[max_len(16)]
    pub allow_list: Vec<Pubkey>,
    #[max_len(8)]
    pub deny_list: Vec<Pubkey>,
}

// This is the time window, if both are 0, delegate can act anytime.
#[derive(AnchorSerialize,AnchorDeserialize,Clone,InitSpace)]
pub struct TimePolicy{
    pub allowed_after: i64,
    pub allowed_before: i64,
}
#[derive(AnchorSerialize,AnchorDeserialize,Clone,InitSpace)]
pub struct RiskPolicy{
    // max slippage for swaps in basis points 
    pub max_slippage_bps: u16,
    // transaction above this amount needs guardian co-signature (0=disabled) 
    pub require_cosign_above: u64,

}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PolicySet{
    pub spending: SpendingPolicy,
    pub programs: ProgramPolicy,
    pub time: TimePolicy,
    pub risk: RiskPolicy,
}
