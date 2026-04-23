# Arcium Integration Safeguards

**Purpose**: design spec for the three safeguards Tesla's persona review flagged as critical for Fuin Confidential (see `frontier-hackathon.md` §11.3 "Tesla — three liveness safeguards"). Cerberus MPC tolerates N−1 malicious participants — a cryptographic triumph — but says **nothing about liveness**. One stalled operator kills every demo attempt during judging. These three safeguards turn liveness and replay problems from demo-killers into recoverable edge cases.

Each safeguard is scoped to be implementable alongside the `execute_confidential_transfer` handler (Apr 28–May 3 window per §11.4). No Arcium toolchain is required to design them.

---

## Safeguard 1 — Intent-nonce on Tx A (anti-double-queue)

### Problem

Fuin's confidential transfer splits into two transactions (§6.6):

- **Tx A** — agent submits `execute_confidential_transfer`; Fuin queues an Arcium computation via `queue_computation`. Returns "queued", funds not moved.
- **Tx B** — Arcium cluster submits `check_spending_policy_callback` (~1–3s later). Fuin executes or rejects the transfer.

If Tx A's receipt is slow to reach the agent (RPC hiccup, network delay, MCP adapter timeout at the wrong boundary), the agent retries with the same intent. **Two computations are now queued against the same delegate's `daily_spent_ct`.** When both callbacks arrive, both claim the same allowance. Homomorphic updates on the sealed spent field do not detect the duplicate — each sees an independent valid policy evaluation.

Arcis cannot detect this at the circuit level; it sees two independent invocations.

### Solution

The agent (or its MCP adapter) mints an **intent-nonce** — 32 random bytes — for every distinct transfer intent. The nonce is passed into `execute_confidential_transfer` and stored in a small ring buffer on the delegate account.

### Data model

Add one field to `Delegate`:

```rust
pub struct Delegate {
    // ... existing fields
    pub pending_intents: [[u8; 32]; MAX_PENDING_INTENTS],   // ring buffer
    pub pending_head: u8,                                    // next slot to write
}

pub const MAX_PENDING_INTENTS: usize = 4;
```

Cost: 4 × 32 + 1 = **129 bytes per delegate**. Negligible.

### Handler logic

In `execute_confidential_transfer`:

1. Receive `intent_nonce: [u8; 32]` as instruction data
2. Scan `delegate.pending_intents` — reject with `FuinError::DuplicateIntent` if already present
3. Write nonce into ring buffer at `pending_head`; advance head (mod `MAX_PENDING_INTENTS`)
4. Queue the Arcium computation, passing nonce as plaintext input so the callback can correlate

In `check_spending_policy_callback`:

1. Verify output signature as before
2. Read `intent_nonce` from the signed output's plaintext fields
3. Find and remove nonce from `delegate.pending_intents` (zero out the slot)
4. Proceed with policy evaluation + transfer

In `cancel_stalled_computation` (see Safeguard 2):

1. Remove nonce from ring buffer
2. Do not execute transfer

### Edge cases

- **Ring buffer full**: if all `MAX_PENDING_INTENTS` slots are occupied, reject Tx A with `FuinError::TooManyPendingIntents`. MCP adapter translates to `queue_saturated` — agent must wait for callbacks before submitting new intents.
- **Nonce collision by chance**: 2^256 space; cryptographically ignorable.
- **Agent loses the nonce**: the callback correlates by signed-output plaintext, not by client re-submission. Nothing to worry about.

### Client contract

MCP adapter generates `intent_nonce = randomBytes(32)` per call. The nonce is opaque to the LLM — it lives in the adapter's tool-call wrapper.

---

## Safeguard 2 — `cancel_stalled_computation` instruction

### Problem

Cerberus is a **dishonest-majority** MPC protocol — security requires only one honest participant, a mathematical triumph. But dishonest-majority security is a correctness claim, not a liveness claim. A single operator can refuse to participate in the final output signature (or go offline) and **no callback will ever fire**. The pending intent stays locked in the ring buffer. The user cannot retry without exhausting slots.

No Arcium-level cancellation primitive is documented publicly as of Apr 23; confirm by Apr 27. If Arcium provides this, defer to theirs. If not, we implement our own.

### Solution

A guardian-only instruction `cancel_stalled_computation(computation_offset, intent_nonce)` that:

1. Requires `ctx.accounts.guardian.key() == vault.guardian` (no delegate-level authority)
2. Requires a timeout to have elapsed — e.g. `Clock::get()?.unix_timestamp - queue_ts >= STALL_TIMEOUT_SECS`
3. Removes the nonce from `delegate.pending_intents`
4. Emits `ComputationCancelled { computation_offset, intent_nonce, reason: "stalled" }`
5. Does **not** execute the transfer

`STALL_TIMEOUT_SECS` default: **60 seconds**. Arcium's normal callback is ~3s; 60s is 20× the normal latency, which is the right shape for "something is genuinely wrong" without cancelling healthy-but-slow computations.

### Queue timestamp

Need to store `queue_ts: i64` per pending intent. Extend the ring buffer:

```rust
pub struct PendingIntent {
    pub nonce: [u8; 32],
    pub queue_ts: i64,
    pub computation_offset: u64,
}
pub pending_intents: [PendingIntent; MAX_PENDING_INTENTS],  // ~48 bytes × 4 = 192 bytes
```

### UI

Guardian dashboard lists pending intents with age. After 60s, a "Cancel" button appears on the row. One click → `cancel_stalled_computation`. Intent freed.

### Late callback

If the MXE does eventually callback **after** guardian-initiated cancellation:

- The callback handler looks up the nonce and doesn't find it
- Rejects with `FuinError::IntentCancelled`
- Logs an event for audit

This is safe: the transfer would have debited a slot that's already been reclaimed. Refusing is the correct behavior.

### Related open question

Does Arcium's program expose its own cancel/refund primitive? If yes, wire it in — don't reinvent. Check docs and `arcium-hq/examples` on Apr 27 before finalizing this safeguard's design.

---

## Safeguard 3 — Policy-version commitment matching

### Problem

Alice rotates her encrypted policy (new daily cap, new allowlist) at T=0. A computation is in flight — queued at T=-1, callback expected at T=+2. The callback decrypts against the **stale** `daily_spent_ct` and evaluates against the **stale** policy ciphertexts that were queued.

Two bad outcomes:

- The callback approves a transfer that would have been denied under the new policy
- The callback updates `daily_spent_ct` by an amount that is meaningless under the new policy's base

### Solution

Every `EncryptedSpendingPolicy` carries a monotonic `policy_version: u64`. Tx A snapshots the version at queue time and passes it as plaintext into the MXE. The callback checks that the delegate's current `policy_version` still matches the snapshot.

### Data model

```rust
pub struct EncryptedSpendingPolicy {
    pub daily_cap_ct: [u8; 32],
    pub per_tx_cap_ct: [u8; 32],
    pub daily_spent_ct: [u8; 32],
    pub last_reset_epoch_ct: [u8; 32],
    pub commitment: [u8; 32],
    pub mxe_cluster: Pubkey,
    pub policy_version: u64,   // NEW — increments on update_policy
}
```

### Handler logic

`execute_confidential_transfer`:

1. Read `policy_version = delegate.policy_ct.policy_version` at start
2. Pass as plaintext input to the MXE call
3. Store in the pending intent alongside nonce + queue_ts

`check_spending_policy_callback`:

1. Verify signature
2. Pull `expected_version` from the signed output's plaintext fields
3. Compare to `delegate.policy_ct.policy_version`
4. If mismatch → `FuinError::PolicyVersionMismatch`, remove intent nonce, emit `PolicyVersionRejected` event, do not execute transfer
5. If match → proceed

`update_policy` (new or existing handler):

- Increments `policy_version`
- The MXE re-encrypts caps under new owner key (if owner rotation) or simply under a new nonce
- Does NOT touch pending intents — pending computations will self-reject on their callback via the version check

### Alternative: commitment-hash matching

Instead of a version counter, pass a hash of the full encrypted policy blob as a commitment. The MXE circuit verifies input hash matches stored commitment. This is stronger (detects any policy change, not just explicit rotations) but adds circuit complexity and one extra field to sign.

**Recommendation**: ship `policy_version: u64` first (cheap, clear, Apr 28–May 3 viable), upgrade to commitment-hash matching post-hackathon if needed.

### Edge case — race during cancel

Alice rotates policy AND cancels a stalled computation in rapid succession. Both are guardian-authorized. The cancel's `intent_nonce` lookup is keyed on the nonce string, which is independent of version — safe.

---

## Summary table

| Safeguard | Root cause | Data model impact | Handler impact | Demo-criticality |
|---|---|---|---|---|
| 1 · Intent-nonce | Async double-queue on agent retry | +129 B per delegate | Tx A checks ring buffer; Tx B removes nonce | 🔴 High — silent double-spend otherwise |
| 2 · cancel_stalled | Cerberus liveness gap | +192 B per delegate | New guardian-only instruction | 🔴 High — demo dies if cluster stalls |
| 3 · Policy-version | Mid-flight policy rotation | +8 B per policy | Version passed through MXE, checked on callback | 🟡 Medium — rare in demo but correctness-critical |

Total storage impact: ~**330 bytes per delegate** extra. Rent-negligible at Solana's current fee schedule.

## Open questions for Apr 27 (before implementation)

- [ ] Does Arcium's program expose a `cancel_computation` or `refund_stalled` instruction? (Defer to theirs if yes.)
- [ ] Does Arcium's signed output support arbitrary plaintext fields, or only the circuit's return type? (Safeguard 3's version check depends on this.)
- [ ] What's the actual observed callback latency distribution on mainnet alpha — is 60s timeout right, or should it be 30s / 120s?
- [ ] Can `queue_computation`'s account list cleanly carry the intent nonce as instruction data without bloating the tx?

## Implementation order

1. **Policy-version (Safeguard 3)** — smallest change, no new instruction, lets us ship update_policy cleanly
2. **Intent-nonce (Safeguard 1)** — bolt onto `execute_confidential_transfer` alongside the basic flow
3. **cancel_stalled (Safeguard 2)** — new instruction, can be last; protect demo with manual guardian override until it lands
