use anchor_lang::prelude::*;
use crate::error::ErrorCode;

pub trait LimitTracker {
    /// Return Spending Cap
    fn get_limit(&self)->Option<u64>;

    /// Return how much get spent
    fn get_spent(&self)->u64;

    /// Updates the spent count
    fn set_spent(&mut self,amount:u64);

    fn check_and_spend(&mut self,amount:u64)->Result<()>{
        if let Some(limit) = self.get_limit() {
            let current_spent = self.get_spent();
            
            // Safety: Check for integer overflow
            let new_spent = current_spent
                .checked_add(amount)
                .ok_or(ErrorCode::Overflow)?;

            // Logic: Enforce Limit
            require!(new_spent <= limit, ErrorCode::DailyLimitExceeded);

            // State: Update
            self.set_spent(new_spent);
        }
        Ok(())
    }
}