# Apr 24 Runbook

**Read first thing in the morning.** You have two parallel tracks today — neither depends on the other. Pick whichever matches your energy at 9am (heads-down code vs sending messages).

By EOD you need: (1) stopwatch latency number, (2) all 5 DMs sent. That's it. Everything else is tomorrow.

---

## ⚠️ Apr 23 EOD update — product redesigned to "Fuin Cloak"

The plan in `frontier-hackathon.md` was expanded with §12 (Fuin Cloak — Tier 1: Fuin × Privacy Cash). The product is now **a private payment rail for AI-agent commerce** — recipient unlinkability via Privacy Cash, not encrypted spending caps via Arcium.

What this changes for today:
- **Track A splits into A1 (Arcium, secondary) and A2 (Privacy Cash, primary)**. Privacy Cash SDK readiness is now the gating question.
- **Track B unchanged** in target list, but the *core question* in `dm-drafts.md` has been revised to ask about private-payments-with-selective-disclosure, not encrypted-spending-caps.

If Privacy Cash SDK is unusable by EOD, fallback ladder per §12.9: stub pool → §6 encrypted-policy → Agent Swarm OS.

## Track A1 — Arcium stopwatch spike (now secondary)

**Goal**: measure cold-start Arcium MXE callback latency on devnet. Encrypted-policy is now a *stretch goal* on top of Cloak — useful but no longer plan-critical. If ≥4s callback, the Cloak v1 ships without it; Arcium becomes a v2 enhancement. See `frontier-hackathon.md` §12.6.

### Step 1 — Enter the worktree (not the main checkout)

```bash
cd ~/.config/superpowers/worktrees/fuin/feature-fuin-mxe-scaffold
git log --oneline | head -6
# You should see the 5 commits from yesterday, most recent first.
```

### Step 2 — Install the Arcium toolchain

Per `programs/fuin/programs/fuin-mxe/README.md` (canonical source). Rough commands:

```bash
# 1. Install arcup (Arcium version manager)
curl -sSfL https://install.arcium.com | bash

# 2. Install latest Arcium CLI + toolchain
arcup install

# 3. Verify
arcium --version
```

If install fails: check Docker is running (`docker ps`) and that Solana CLI is on PATH (`solana --version`). Arcium's toolchain depends on both.

### Step 3 — Run the canonical `add_together` example

This is the stopwatch measurement. Don't use `fuin-mxe` — use Arcium's own example so the numbers are clean (no TODO-verify noise).

```bash
cd /tmp && rm -rf arcium-examples
git clone https://github.com/arcium-hq/examples arcium-examples
cd arcium-examples/add_together

# Edit cluster config to devnet if needed; check README.

# Build
time arcium build

# Deploy to devnet
time arcium deploy --cluster devnet

# Run the end-to-end test — this is the measurement
time arcium test --cluster devnet
```

Record the **wall-clock time from `arcium test` submitting Tx A to callback-received Tx B**, cold start. That's your number.

### Step 4 — Gate check (now stretch-goal gate, not plan-critical gate)

| Observed cold callback latency | Action |
|---|---|
| ≤ 3s | Green — Cloak v1 (§12) plus encrypted-cap stretch goal both shippable |
| 3-4s | Yellow — Cloak v1 ships; encrypted-cap deferred to v2 |
| ≥ 4s, or no callback in 60s | Red — Cloak v1 only. Encrypted-cap stretch dropped. **Not** the primary fallback trigger anymore — Privacy Cash readiness is. |

### Step 5 — Resolve the scaffold TODOs

If gate was green/yellow, come back to the worktree and run `arcium init` inside the `fuin-mxe` crate to resolve the 5 `TODO(verify):` markers:

```bash
cd ~/.config/superpowers/worktrees/fuin/feature-fuin-mxe-scaffold/programs/fuin/programs/fuin-mxe
# Back up our scaffold first
cp Cargo.toml Cargo.toml.scaffold
cp src/lib.rs src/lib.rs.scaffold

# Generate canonical Arcium scaffold
arcium init --name fuin-mxe
```

Then **diff our scaffold against `arcium init`'s output** and merge:

```bash
diff Cargo.toml.scaffold Cargo.toml
diff src/lib.rs.scaffold src/lib.rs
```

Take what `arcium init` emits for crate deps + macro imports + visibility annotations. Keep our `check_spending_policy` logic. Resolve each of the 5 TODOs by deleting the marker once the question is answered. Commit:

```bash
git add programs/fuin/programs/fuin-mxe/
git commit -m "resolve Arcium TODO(verify) markers from arcium init"
```

### Step 6 — Sanity check

```bash
cd ~/.config/superpowers/worktrees/fuin/feature-fuin-mxe-scaffold/programs/fuin
arcium build  # should succeed now
arcium test --cluster devnet  # should hit the check_spending_policy circuit
```

If `arcium test` passes end-to-end with our circuit logic, encrypted-cap remains a v2 stretch goal. If it fails, drop the stretch and focus everything on Track A2.

---

## Track A2 — Privacy Cash SDK probe (NEW · primary gating probe)

**Goal**: confirm Privacy Cash is usable as Cloak's privacy primitive. **This is now the plan-critical question** — if Privacy Cash isn't workable by EOD Apr 27, Cloak v1 cannot ship and we descend the §12.9 fallback ladder.

### Step 1 — Get the code and read the surface

```bash
cd /tmp && rm -rf privacy-cash
# Find the canonical repo. Likely candidates:
#  - github.com/privacy-cash/privacy-cash-solana
#  - github.com/privacy-cash/sdk
# If only the official site (privacycash.io or similar) is the source of truth, find their repo link in the footer or docs.
git clone <CANONICAL_REPO_URL> privacy-cash
cd privacy-cash
ls
cat README.md | head -80
```

Skim the README + any `examples/` or `docs/` folder. Identify:
- Public TypeScript / Rust SDK entry points
- Whether the SDK is for end-user wallets only, or supports custom signers / programmatic flows
- Pool program ID(s) on devnet and mainnet

### Step 2 — Answer the seven critical Apr 24 questions

From `frontier-hackathon.md` §12.8 — log answers in a new file `apr24-privacycash-probe.md` at the repo root:

```markdown
# Privacy Cash probe — Apr 24 findings

## 1. SDK surface
- Public entry point: ...
- Accepts custom signer? Yes/No — evidence: file:line
- Accepts custom credential attachment? Yes/No — evidence: file:line

## 2. Anonymity set on mainnet
- Active recently-deposited notes (last 7 days): N
- Active note count by amount bucket ($1, $10, $100, $1000): ...
- Source: on-chain query / Privacy Cash explorer / their analytics

## 3. Per-withdraw cost
- Rent (lamports): ...
- ZK proof verification CU: ...
- Total $ cost at current SOL price for one withdraw: ...
- Verdict: viable for $2 micro-payments? Yes/No

## 4. Compliance disclosure path
- Existing scheme: ...
- Reusable for guardian-viewing-key model? Yes/No — how

## 5. Fuin credential verification cost
- Groth16 verifier on Solana, cost per verification: ...
- Need to batch? Yes/No

## 6. Withdraw destination flexibility
- Arbitrary addresses? Yes/No
- If restricted: how

## 7. Anonymity set churn under our load
- Pool's avg deposits/withdraws per hour: ...
- Our projected outflow (50 withdraws/hour): would dominate? Yes/No
```

### Step 3 — Smoke-run a single shielded withdrawal

```bash
# Use Privacy Cash's example/test script with a fresh devnet keypair.
# Get devnet USDC from the faucet.
# Deposit ~$5 worth of USDC. Wait for the deposit to settle in the pool.
# From a DIFFERENT keypair (or the SDK's test fixture), withdraw to an arbitrary address.
# Time the full deposit → withdraw → recipient-confirm cycle.
```

Record:
- Deposit confirmation time
- Wait-period before withdraw is unlinkable (some pools require N other deposits or M minutes)
- Withdrawal confirmation time
- Cost in SOL/USDC
- Whether the withdrawal succeeded with a custom recipient

### Step 4 — Privacy Cash gate check

| Result | Action |
|---|---|
| All 7 questions answered favorably; smoke-run succeeded; cost < $0.10/withdraw; anonymity set ≥ 50 active notes | **GREEN — Cloak v1 ships as planned (§12.6)** |
| Most answers favorable; cost or anonymity-set marginal | **YELLOW — Cloak v1 ships, but with an honest caveat in the demo about anonymity-set size and we batch withdraws to control cost** |
| SDK doesn't expose programmatic withdraw, OR cost > $0.50/withdraw, OR anonymity set < 10 | **RED — drop to fallback A (stub pool) — see §12.9; demo is honest "interfaces with Privacy Cash on mainnet (M1)"** |
| Repo doesn't exist / SDK is undocumented / mainnet pool doesn't reachable | **DARK RED — drop to fallback B (§6 encrypted policies via Arcium) or fallback C (Agent Swarm OS)** |

### Step 5 — DM Privacy Cash if useful

If anything in Step 2 is genuinely unanswerable from public docs, send a 6th DM to Privacy Cash team asking the specific blocker. Their response window may be hours not days. Frame as Solana-builder-to-Solana-builder, not "I have a question."

---

## Track B — The 5 validation DMs (people track)

**Goal**: one on-record reply from a compliance officer / prop-desk / family-office CTO. Even a "no" is gold. Decides Jobs vs Thiel narrative on Apr 24 evening.

### Step 1 — Fill target list

Open `dm-drafts.md` at the repo root. Fill the five `{placeholders}` at the bottom of the file. Sourcing suggestions:

- **Compliance officer #1 & #2** — Superteam India Telegram (`#compliance-ask` or main channel), Solana Foundation grantee slack if you have access, LinkedIn Sales Navigator filter "Compliance · Crypto Fund"
- **Prop-desk risk lead** — warm intro from Superteam network; Breakpoint 2025 attendee list if you have it
- **Prop-desk CTO** — X / GitHub — look for anyone posting about "agent execution architecture on Solana"
- **Family-office CTO** — LinkedIn, narrower filter: "CTO · Family Office · Digital Assets"

Aim for **real people at real firms**, not crypto influencers. Influencers give you a like; compliance officers give you a product.

### Step 2 — Send all 5 by 11am IST (9:30am GMT / evening Apr 23 PT)

This catches the US business day in session for Western recipients and matches Mumbai/Bangalore office hours. Batch-send — don't space them out. Parallel sending signals confidence, not spam (5 DMs to 5 different people on 5 different channels are not spam).

### Step 3 — Log every reply verbatim

Create `apr24-validation-log.md` at repo root when the first reply lands:

```markdown
# Apr 24 Validation Log

## Reply 1 — {Name}, {Title}, {Firm}
Received: {time}
Channel: {LinkedIn / Telegram / X DM / email}

> {verbatim reply}

Parse: {one-line summary of their signal}
Use-on-record? {yes / off-record-only / no}
```

The log feeds the landing-page quote, the pitch deck, and the submission README.

### Step 4 — Narrative decision by EOD

By 11pm local time:

| Reply pattern | Ship |
|---|---|
| ≥1 on-record compliance-officer reply | **Variant B (Thiel)** from `mockups/landing-copy.md` — with their quote |
| ≥1 positive but off-record | **Variant B** without quote |
| Only retail / builder replies | **Variant A (Jobs)** — the Reveal framing |
| Zero replies | **Variant A** — easier to pivot to B in May than reverse |

---

## End-of-day self-check

Before you close the laptop:

- [ ] **A1** Arcium stopwatch number recorded (cold callback latency)
- [ ] **A2** Privacy Cash gate check decision: GREEN / YELLOW / RED / DARK RED
- [ ] **A2** `apr24-privacycash-probe.md` filled in — answers to all 7 §12.8 questions
- [ ] **A2** Smoke-run of one full deposit → withdraw → recipient cycle attempted (success or failure logged)
- [ ] **B**  5 DMs sent, timestamped, logged in `apr24-validation-log.md`
- [ ] **B**  6th DM sent to Privacy Cash team if there's a blocker question
- [ ] Narrative choice locked (Variant A Jobs or Variant B Thiel — note: Variant B is *strictly stronger* under Cloak framing; revisit decision)
- [ ] If A1 green: encrypted-cap stretch goal scoped for v2; TODO(verify) markers in `fuin-mxe` crate resolved via `arcium init`
- [ ] If A2 RED: fallback chosen (stub pool / §6 encrypted-policy / Agent Swarm OS)

Post a one-line status to Superteam India Telegram at EOD — the "working in public" signal helps both the Frontier judges and potential compliance-officer replies.

---

## Files you'll touch today

- `dm-drafts.md` (repo root) — fill target list, hit send (revised question)
- `apr24-privacycash-probe.md` (NEW, repo root) — log all 7 Privacy Cash question answers
- `apr24-validation-log.md` (NEW, repo root) — log DM replies verbatim
- `~/.config/superpowers/worktrees/fuin/feature-fuin-mxe-scaffold/programs/fuin/programs/fuin-mxe/` — only if A1 is green; resolve TODO markers via `arcium init`
- `/tmp/arcium-examples/` — scratch
- `/tmp/privacy-cash/` — scratch

## Files you will not touch today

- `frontier-hackathon.md` — already updated with §12 last night; locked until tonight's EOD findings
- `apps/guardian/`, `apps/vault/` — May 4-8 work
- `programs/fuin/programs/fuin/src/handlers/` — Apr 28+ work
- `mockups/reveal.html` — already supports Cloak's Guardian/Public toggle; payment-ledger fields added in May 4-8

## If something goes wrong

- **Arcium install fails**: skip A1, focus on A2 + B. Encrypted-cap is a stretch, not a blocker.
- **Privacy Cash repo not findable / SDK doesn't exist**: this is a real concern. Spend up to 2h searching (their site footer, X/Twitter, Solana grantee directory, docs.privacycash.* variants). If still nothing, immediately DM the Privacy Cash team on X/Telegram and pivot to the §6 fallback while waiting for their reply.
- **Privacy Cash SDK exists but doesn't support delegated signers**: this is the most likely failure mode. Document exact API gap in `apr24-privacycash-probe.md`. Then DM Privacy Cash team — there may be a private/unreleased extension. If no, drop to stub pool fallback (§12.9 Fallback A).
- **Anonymity set < 10**: privacy claim is invalid. Either build with the assumption that our deposits will *grow* the set (and demo with a deferred-privacy framing), or fall back.
- **Zero DM replies by EOD**: Variant B (Thiel) is *still* the right call under Cloak framing — Privacy Cash is compliance-first by design, the institutional story writes itself. Don't default to Variant A unless there's positive Variant-A signal.
- **`arcium deploy` burns through devnet SOL**: request from the Solana Foundation faucet via your grantee channel — you have standing.
