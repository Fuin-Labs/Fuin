//! Fuin MXE circuits.
//!
//! This crate holds the Arcium (Arcis) MPC circuits used by Fuin for
//! confidential spending-policy evaluation. The circuits run on the Arcium
//! MPC network — caps and spent-so-far are stored encrypted on-chain
//! (`Enc<Shared, PolicyState>`), the network evaluates the policy, and the
//! Fuin Anchor program consumes the result.
//!
//! The Anchor handler that drives this circuit lives at:
//!     programs/fuin/src/handlers/  (to be added ~Apr 28 — see
//!     frontier-hackathon.md §6.5).
//!
//! NOTE on imports: Arcium's public docs sometimes show `use arcis::*;` and
//! sometimes `use arcis_imports::*;`. Once `arcium init` is run and the
//! canonical manifest is pulled in, align the `use` statements with whichever
//! crate actually ships the prelude.
//
// TODO(verify): Confirm outer-module import once arcium init is run.
// The hackathon brief (§6.4) uses `arcis_imports`; the docs show `arcis`.
use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis::*;

    /// On-chain encrypted policy state.
    ///
    /// In the integrated design this struct is stored as `Enc<Shared, _>`
    /// inside the Fuin vault account. Caps and spend-so-far never leave the
    /// MPC in the clear.
    pub struct PolicyState {
        daily_cap: u64,
        per_tx_cap: u64,
        daily_spent: u64,
        last_reset_epoch: u64,
    }

    /// Per-transaction input supplied by the delegate (also encrypted to
    /// Shared so the MXE can read it during evaluation).
    pub struct CheckInput {
        amount: u64,
        current_epoch: u64,
    }

    /// Circuit output.
    ///
    /// Mixed visibility: `allowed` should be revealed plaintext to the
    /// on-chain caller (the Fuin handler branches on it), while
    /// `new_daily_spent` should stay encrypted and be written back into the
    /// encrypted policy state without the guardian/delegate seeing the
    /// running total.
    ///
    /// TODO(verify): the exact Arcis syntax for per-field visibility is not
    /// documented at docs.arcium.com/developers/arcis/* as of the scaffold
    /// date. The docs only show homogeneous returns (fully `Enc<...>` or
    /// fully `.reveal()`). Options to explore on Apr 25:
    ///   1. Split return into two values: `(bool_plain, Enc<Shared, u64>)`
    ///      if tuple returns are supported.
    ///   2. A per-field attribute like `#[visibility(plain)]` on `allowed`.
    ///   3. Separate circuits: one that reveals `allowed`, one that updates
    ///      the encrypted counter.
    /// Check docs.arcium.com/developers/arcis/input-output and the
    /// `hello-world` example before committing to an approach.
    pub struct CheckOutput {
        // TODO(verify): mark `allowed` as plaintext/revealed once syntax is known.
        allowed: bool,
        new_daily_spent: u64,
    }

    /// Confidential spending-policy check.
    ///
    /// Given the encrypted current policy state and an encrypted per-tx
    /// input, decide whether the transfer is allowed and return the new
    /// running daily-spent counter (still encrypted).
    ///
    /// Mirrors the plaintext policy check in
    /// `programs/fuin/src/handlers/shared.rs::validate_and_update_limits`
    /// so behavior stays consistent between the public and confidential
    /// code paths.
    #[instruction]
    pub fn check_spending_policy(
        policy_ctxt: Enc<Shared, PolicyState>,
        input_ctxt: Enc<Shared, CheckInput>,
    ) -> Enc<Shared, CheckOutput> {
        let policy = policy_ctxt.to_arcis();
        let input = input_ctxt.to_arcis();

        // Epoch rollover: if we crossed an epoch boundary since the last
        // reset, the effective spent-so-far is 0. (Matches the existing
        // Solana-epoch-based reset in shared.rs — the field is called
        // `daily_*` for historical reasons but actually resets per epoch.)
        let current_spent = if input.current_epoch > policy.last_reset_epoch {
            0u64
        } else {
            policy.daily_spent
        };

        let within_per_tx = input.amount <= policy.per_tx_cap;
        let within_daily = current_spent + input.amount <= policy.daily_cap;
        let allowed = within_per_tx && within_daily;
        let new_daily_spent = if allowed {
            current_spent + input.amount
        } else {
            current_spent
        };

        policy_ctxt
            .owner
            .from_arcis(CheckOutput { allowed, new_daily_spent })
    }
}
