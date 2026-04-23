# Apr 24 Runbook

**Read first thing in the morning.** You have two parallel tracks today — neither depends on the other. Pick whichever matches your energy at 9am (heads-down code vs sending messages).

By EOD you need: (1) stopwatch latency number, (2) all 5 DMs sent. That's it. Everything else is tomorrow.

---

## Track A — Arcium stopwatch spike (code track)

**Goal**: measure cold-start Arcium MXE callback latency on devnet. If ≥4s, Musk's fallback activates same day. See `frontier-hackathon.md` §11.4.

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

### Step 4 — Gate check

| Observed cold callback latency | Action |
|---|---|
| ≤ 3s | Green — proceed with Fuin Confidential as planned |
| 3-4s | Yellow — proceed but harden Safeguard 2 (`cancel_stalled_computation`) early |
| ≥ 4s, or no callback in 60s | Red — activate Musk's fallback. Branch to `feature/agent-swarm-os`, start Agent Swarm OS + Agent Registry integration. See §11.6. |

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

If `arcium test` passes end-to-end with our circuit logic, Apr 25 morning starts on `execute_confidential_transfer` handler work. If it fails, debug before calling it a day.

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

- [ ] Arcium stopwatch number recorded (cold callback latency)
- [ ] Gate check decision: green / yellow / red
- [ ] 5 DMs sent, timestamped, logged
- [ ] `apr24-validation-log.md` created (even if empty)
- [ ] Narrative choice locked (Variant A or B)
- [ ] If green: `TODO(verify)` markers in `fuin-mxe` crate resolved via `arcium init`
- [ ] If red: `feature/agent-swarm-os` branch created, fallback scope noted in an issue or log

Post a one-line status to Superteam India Telegram at EOD — the "working in public" signal helps both the Frontier judges and potential compliance-officer replies.

---

## Files you'll touch today

- `dm-drafts.md` (repo root) — fill target list, hit send
- `~/.config/superpowers/worktrees/fuin/feature-fuin-mxe-scaffold/programs/fuin/programs/fuin-mxe/` — resolve TODO markers after `arcium init`
- `apr24-validation-log.md` (new, repo root) — log DM replies verbatim
- `/tmp/arcium-examples/` — scratch, throw away after stopwatch

## Files you will not touch today

- `frontier-hackathon.md` — locked. The plan doesn't change until EOD reveals new info.
- `apps/guardian/`, `apps/vault/` — May 4-8 work.
- `programs/fuin/programs/fuin/src/handlers/` — Apr 28+ work. Don't start the handler today even if the spike was green.

## If something goes wrong

- **Arcium install fails**: skip to Track B, send the DMs. Revisit Arcium install at night. One bad install day doesn't kill the hackathon.
- **Zero DM replies by EOD**: fine. Variant A (Jobs) is the default. Don't panic-send follow-ups — that's tomorrow's decision, not tonight's.
- **`arcium deploy` burns through devnet SOL faster than expected**: request from the Solana Foundation faucet via your grantee channel — you have standing.
- **Gate goes red (Arcium too slow)**: the fallback is intact. Agent Swarm OS is a perfectly respectable Frontier submission. Don't treat it as a loss.
