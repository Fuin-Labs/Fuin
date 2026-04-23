# fuin-mxe

Arcium MXE (multi-party execution) circuits for Fuin. This crate holds the
Arcis-DSL circuits that run on the Arcium MPC network so Fuin can evaluate
spending policies **without revealing the caps or running totals on-chain**.
The circuits are consumed by the Fuin Anchor program in
[`../fuin/src/handlers/`](../fuin/src/handlers/) (integration handler lands
~Apr 28 — see `frontier-hackathon.md` §6.5).

Today this crate contains exactly one circuit: `check_spending_policy`
(scaffold skeleton only; body to be fleshed out Apr 25).

## Prerequisites

Install the Arcium toolchain via `arcup`:

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://install.arcium.com/ | bash
```

You also need (matches what the rest of the Fuin repo expects):

- Rust (stable)
- Solana CLI 2.3.0 (`solana-keygen new` run at least once)
- Anchor 0.32.1
- Docker + Docker Compose (Arcium's local cluster runs in containers)
- Yarn (Arcium's CLI shells out to yarn for some tasks; separate from the
  pnpm workspace the rest of the Fuin repo uses)

Full install guide: <https://docs.arcium.com/developers/installation>

## Build

From inside this crate:

```bash
cd programs/fuin/programs/fuin-mxe
arcium build
```

`arcium build` compiles the Arcis circuits into MXE artifacts. It does not
go through `anchor build` — Arcium has its own toolchain.

## Test locally

```bash
arcium test
```

This spins up a local Arcium cluster (Docker) and runs the circuit against
a simulated MPC network.

## Deploy to devnet

```bash
arcium test --cluster devnet     # dry run against Arcium devnet
arcium deploy                    # full deploy (confirm command in docs)
```

Deploy requires:

- A funded Solana devnet keypair at `~/.config/solana/id.json`
  (or whatever `Anchor.toml`'s `[provider].wallet` points at)
- Arcium devnet access / cluster URL configured via `arcium config` (see
  docs)

> TODO(verify): the exact devnet deploy subcommand. Public docs clearly
> document `arcium build` and `arcium test --cluster devnet`, but the
> authoritative deploy command wasn't confirmable from public pages at
> scaffold time. Check <https://docs.arcium.com/developers/hello-world>
> once you reach the integration step.

## Known issues / open questions

### Mixed-visibility return (BLOCKER for Apr 25)

The `check_spending_policy` circuit currently returns
`Enc<Shared, CheckOutput>`, where `CheckOutput` carries both:

- `allowed: bool` — conceptually **plaintext** (the on-chain Fuin handler
  needs to branch on it to decide whether to proceed with the transfer).
- `new_daily_spent: u64` — must stay **encrypted** (the whole point of the
  confidential path is that the running total isn't readable).

Arcium's public docs (as of Apr 23, 2026) document only homogeneous
returns — either fully `Enc<Owner, T>` or fully `.reveal()`d plaintext.
Per-field visibility (`#[visibility(plain)]` or similar) is not in the
reference at `docs.arcium.com/developers/arcis/*`.

Three plausible approaches, to be resolved Apr 25:

1. **Tuple return** `(bool, Enc<Shared, u64>)` if the DSL supports it.
2. **Per-field attribute** such as `#[visibility(plain)]` on `allowed`.
3. **Two circuits** — one that reveals `allowed`, one that updates the
   encrypted counter. Coordinating them is more work on-chain but sidesteps
   the mixed-visibility question entirely.

Relevant doc pages:
- <https://docs.arcium.com/developers/arcis/input-output>
- <https://docs.arcium.com/developers/arcis/types>
- <https://docs.arcium.com/developers/arcis/quick-reference>

### Uncommitted Cargo dependencies

`Cargo.toml` currently lists Arcium crates as commented-out placeholders
with `TODO(verify)` markers. Before hacking on Apr 25, run
`arcium init <scratch-name>` in a throwaway directory and copy the exact
dependency block it generates into this crate's `Cargo.toml`.

### Anchor.toml integration

Arcium programs are registered differently from Anchor programs — they
live in the Arcium cluster, not `[programs.devnet]`. The repo's
`programs/fuin/Anchor.toml` is **intentionally untouched** by this scaffold.
Confirm the correct registration path (likely `Arcium.toml` at the workspace
root rather than `Anchor.toml`) before wiring the integration handler.

## Where this plugs in

Once the integration lands, the flow looks like:

1. Guardian stores an `Enc<Shared, PolicyState>` ciphertext inside the
   Fuin vault account.
2. On each transfer, the Fuin handler at `../fuin/src/handlers/` issues an
   Arcium computation request pointing at `check_spending_policy` with the
   vault's encrypted state + the tx input.
3. The MXE returns `allowed` (plaintext) and the new encrypted counter.
4. The handler rejects the transfer if `!allowed`, otherwise updates the
   vault's ciphertext and proceeds with the SPL/SOL transfer.
