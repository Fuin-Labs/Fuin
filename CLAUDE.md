# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fuin is a programmable authorization layer (IAM) on Solana. Guardians create on-chain vaults (PDAs) and issue delegate keys with bitmask permissions, spending caps, and policy constraints to AI agents or teenagers.

## Build & Dev Commands

```bash
# Monorepo
pnpm install                     # Install all dependencies (pnpm required, v9.0.0+)
pnpm build                      # Build SDK + all apps via Turbo
pnpm dev                         # Start all dev servers
pnpm dev:guardian                # Guardian app only (port 3001)
pnpm dev:vault                   # Vault/landing app only (port 3000)
pnpm lint                        # Lint everything
pnpm format                      # Prettier format
pnpm check-types                 # TypeScript check

# Anchor program (must cd first)
cd programs/fuin
anchor build                     # Compile Solana program
anchor test                      # Build + start validator + run tests
anchor deploy                    # Deploy to configured cluster

# After contract changes, sync IDL to SDK:
cp programs/fuin/target/idl/fuin.json packages/sdk/src/idl/fuin.json
```

**Build order matters**: `anchor build` → copy IDL → `pnpm build` (SDK builds first via Turbo `^build`, then apps). Turbo does NOT know about the Anchor build step — run `pnpm build:program` or `anchor build` manually first.

## Architecture

### Monorepo Layout

```
programs/fuin/programs/fuin/src/  -- Anchor/Rust smart contract
packages/sdk/src/                 -- TypeScript SDK (@fuin/sdk)
apps/guardian/                    -- Next.js guardian dashboard (port 3001)
apps/vault/                       -- Next.js landing page (port 3000)
apps/agent/src/                   -- Node.js agent CLI
```

### On-Chain Program (Rust/Anchor)

**Program ID**: `E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy`

Two core accounts:
- **Vault** — holds funds + policies. PDA seeds: `["vault", guardian, nonce]`
- **Delegate** — scoped access key. PDA seeds: `["delegate", vault, nonce]`

Instructions: `init_vault`, `issue_delegate`, `execute_transfer`, `execute_spl_transfer`, `freeze_vault`, `unfreeze_vault`, `delegate_control`, `update_vault`, `withdraw`

Key source paths:
- Entry: `programs/fuin/programs/fuin/src/lib.rs`
- Handlers: `src/handlers/` (one file per instruction)
- State: `src/state/vault.rs`, `src/state/delegate.rs`, `src/state/policy.rs`
- Shared validation: `src/handlers/shared.rs` — `validate_and_update_limits()` is the core policy enforcement function
- Errors: `src/error.rs`
- Pricing: `src/pricing.rs` — `calculate_usd_value()` using Pyth oracle

Policy engine validates per-tx: vault state, delegate active/expired, permissions bitmask, spending limits, program allow/deny lists, time windows, risk thresholds.

**SOL transfers use direct lamport manipulation** (`try_borrow_mut_lamports`), not CPI to SystemProgram, because vault PDAs carry account data. Same applies to `withdraw`.

**Spending limits reset per Solana epoch**, not per calendar day. The field names (`daily_cap`, `daily_spent`) are misleading — the code in `shared.rs` checks `clock.epoch > last_reset_epoch`. Solana epochs are ~2–3 days on mainnet/devnet.

### SDK (`packages/sdk/`)

- `pda.ts` — `findVaultPda()`, `findDelegatePda()`, permission constants (`CAN_SWAP=1, CAN_TRANSFER=2, CAN_STAKE=4, CAN_LP=8`)
- `client.ts` — `FuinClient` class wrapping all program instructions
- `idl/fuin.json` — copied from `target/idl/` after `anchor build`

The SDK **ships TypeScript source directly** (`"main": "./src/index.ts"`) — consumers import `.ts` files via bundler resolution (Next.js handles this). The compiled `dist/` output exists after build but apps don't reference it.

The SDK uses untyped `Program<Idl>`, so method calls need `!` non-null assertion (e.g. `.initVault!(...)`) and account access needs `as any` cast (e.g. `(sdk.program.account as any).vault.fetch(pda)`).

PDA nonces are `BN` serialized as 8-byte little-endian: `nonce.toArrayLike(Buffer, "le", 8)`.

### Frontend Apps

Both use Next.js 16 + Solana Wallet Adapter. The guardian app (`apps/guardian/`) is the main management UI using Tailwind CSS. The vault app (`apps/vault/`) is the landing page using inline styles + react-three-fiber for the 3D hero.

Guardian is hardcoded to **Devnet** in `apps/guardian/app/providers.tsx`. Switch to `http://127.0.0.1:8899` for local validator testing.

Guardian currently **hardcodes vault nonce to 1** everywhere — a guardian can only manage one vault from the UI.

`delegateControl` status codes: `0` = Revoke (permanent), `1` = Pause (reversible), `2` = Resume.

### Anchor Workspace

The Anchor workspace is at `programs/fuin/` (not repo root). All `anchor` commands must run from there. Tests are in `programs/fuin/tests/fuin.ts` using ts-mocha + chai. The `Anchor.toml` uses `pnpm exec ts-mocha` as the test runner.

Tests verify vault state with `assert.deepEqual(vault.state, { active: {} })` — Anchor serializes Rust enum variants as objects with empty-object values.

### Known Quirks

**`delegate_control` IDL mismatch**: The Rust handler uses `_nv`/`_nd` as function params but `nonce_vault`/`nonce_delegate` in the `#[instruction()]` attribute. This causes IDL seed path names to mismatch arg names, so Anchor cannot auto-resolve PDAs for this instruction. Always provide `vault` and `delegate` accounts explicitly.

**`pnpm dev:vault` filter mismatch**: `apps/vault/package.json` has `"name": "web"` but the root script uses `--filter=vault`. Turbo filters match on package `name`, not directory. This filter may silently fail to start the vault app.

**`Anchor.toml` says `package_manager = "yarn"`** but the repo uses pnpm. Anchor may attempt to invoke yarn for some internal operations.

**`apps/agent/` has stale import**: `src/index.ts` imports from `@fuinlabs/sdk` — the actual package name is `@fuin/sdk`.

**`execute_spl_transfer` Pyth value unused**: The handler computes `_usd_spend_amount` via Pyth price feed but doesn't enforce it against spending limits yet — only token unit amount is checked.

**Scaffolded but unimplemented**: `Route` enum (swap/stake routing), `RecoveryConfig` (social recovery), `RiskPolicy.max_slippage_bps`.
