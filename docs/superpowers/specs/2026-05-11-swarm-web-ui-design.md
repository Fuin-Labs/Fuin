# Swarm Web UI — Design Spec

**Date:** 2026-05-11
**Author:** Jayant
**Status:** Approved (design)
**Topic:** Make the `apps/swarm-demo` CLI flow invokable from the web at `/swarm` in `apps/vault`.

## Problem

Fuin v2's hierarchical proof-of-intent flow (root intent → derived children → verified action → rogue rejection) exists end-to-end only in `apps/swarm-demo/src/run.ts`. A demo viewer cannot run it without a terminal. The audit explorer at `/audit/[pda]` is read-only and assumes a root PDA already exists.

Closing this gap lets the demo narrative live entirely in the browser: kick off the swarm, watch each step land on devnet, then jump into the audit tree.

## Goal

A single page at `/swarm` (in `apps/vault`) that:

1. Connects a Solana wallet (Phantom on devnet).
2. With one click, runs the full swarm flow on devnet using ephemeral keypairs generated in-browser.
3. Renders each step as a card with PDA, signature, Solana Explorer link, and human-readable scope.
4. Demonstrates the rogue-Raydium / out-of-scope rejection visibly.
5. Links to `/audit/<rootPda>` when complete.

Non-goals: MCP wiring, agent CLI changes, persistence, mainnet support, auth, configurable predicates, parameterizable budgets. The flow is a fixed demo.

## Architecture

### Client-side only

No new API route, no server keypair, no DB writes.

| Role | Key source | Signs |
|---|---|---|
| Funder | Connected wallet (Phantom) via wallet adapter | One funding tx with 5 `SystemProgram.transfer` ixs |
| `user`, `orchestrator`, `research`, `executeAgent`, `audit`, `subUser`, `subOrch`, `rogue` | `Keypair.generate()` in browser memory (component state) | Their own intent + action instructions through `@fuin-labs/sdk-v2` |

Funding is a single transaction with eight `SystemProgram.transfer` instructions (0.06 SOL each) covering all ephemeral keypairs — the five main-flow signers plus `subUser`, `subOrch`, `rogue` for the boundary attempt. One wallet popup total. Eight transfers fit comfortably inside Solana's 1232-byte tx size limit.

### SDK usage

`@fuin-labs/sdk-v2` is the only Fuin entry point. The IDL is imported as JSON from `programs/fuin/target/idl/fuin.json` via a typed wrapper module (`_lib/idl.ts`) so the import path is owned in one place.

The `Fuin` client takes `{ provider, idl }`. The SDK's intent methods take an explicit `Signer` (e.g. `signRootIntent({ user, ... })`) and call `.signers([user])` internally — but `.rpc()` also auto-signs with the provider wallet, which becomes the fee payer. To avoid one wallet-adapter popup per step, the provider's wallet rotates between the ephemeral keypairs (the same ones that get funded 0.06 SOL each in step ①): a fresh `AnchorProvider` is constructed per step with the relevant ephemeral keypair wrapped in `anchor.Wallet`, then a new `Fuin` instance bound to that provider runs that step. Result: one wallet popup for funding, zero popups for the remaining six steps.

### File layout

```
apps/vault/
  app/
    _providers/
      WalletProviders.tsx     ← moved up from app/dashboard/_providers/
      FuinProvider.tsx        ← moved up from app/dashboard/_providers/
    swarm/
      layout.tsx              ← wraps WalletProviders
      page.tsx                ← thin server component, renders <SwarmRunner/>
      _components/
        SwarmRunner.tsx       ← client component, state machine + run button
        StepCard.tsx          ← per-step card UI
      _lib/
        flow.ts               ← async generator: orchestrates the flow, yields events
        idl.ts                ← imports fuin.json
        types.ts              ← StepEvent / StepStatus types
```

The dashboard imports of the two moved providers are updated to point at the new `app/_providers/` location.

## Data flow

```
SwarmRunner (client component)
  │
  ├── owns: { steps[], walletKeypairs, rootPda? }
  ├── on "Run" click → calls flow.ts async generator
  │      ↓ yields StepEvent { id, status, data }
  └── updates per-step card state on each yield
```

`flow.ts` exports:

```ts
export type StepStatus = "pending" | "running" | "ok" | "failed";

export type StepEvent =
  | { id: "fund";            status: StepStatus; sig?: string;   error?: string }
  | { id: "sign-root";       status: StepStatus; pda?: string;   sig?: string; scope?: string; error?: string }
  | { id: "derive-research"; status: StepStatus; pda?: string;   sig?: string; scope?: string; error?: string }
  | { id: "derive-execute";  status: StepStatus; pda?: string;   sig?: string; scope?: string; error?: string }
  | { id: "derive-audit";    status: StepStatus; pda?: string;   sig?: string; scope?: string; error?: string }
  | { id: "rogue-reject";    status: StepStatus; reason?: string; error?: string };

export async function* runSwarmDemo(args: {
  connection: Connection;
  funder: WalletContextState; // wallet adapter
  cluster: "devnet";
}): AsyncGenerator<StepEvent, { rootPda: PublicKey }>;
```

The generator yields events as it works. The component does not need to know how the flow runs — only how to render `StepEvent`s.

The terminal yield carries the root PDA; the component then renders the "Open audit view →" link to `/audit/<rootPda>`.

## UX

```
┌─ /swarm ───────────────────────────────────────────────┐
│ [Connect Wallet]   [▶ Run swarm demo]                  │
│                                                         │
│ ① Fund 5 keypairs              ✓ sig: 5xK…             │
│ ② User signs ROOT intent       ✓ pda: 8nM…  ↗explorer  │
│       Jupiter · 24h · 500 USDC                          │
│ ③ Spawn 3 sub-agents                                    │
│   ├ research  read-only  $50    ✓ pda: 2vQ…            │
│   ├ execute   Jupiter    $400   ✓ pda: 9xR…            │
│   └ audit     read-only  $50    ✓ pda: 4yT…            │
│ ④ Rogue Raydium attempt        ✗ REJECTED              │
│       reason: predicate violation: dex not allowed      │
│                                                         │
│ [Open audit view →] (links /audit/<rootPda>)            │
└────────────────────────────────────────────────────────┘
```

- Each step is a `<StepCard/>` with title, status badge, optional data rows (PDA, sig, scope), and an explorer link when a sig/PDA is present.
- Status colors: pending = muted, running = spinner, ok = green check, failed = red ✗.
- Step ④ "failure" is the happy path: when the verify_authorizes rejects the rogue ix, the card renders the rejection as a **success-coloured** ✓ with the rejection reason as the data row. Only an unexpected non-predicate error (RPC failure, etc.) renders red.
- Typography matches the existing v2 surfaces (`/`, `/audit/[pda]`): Vollkorn for headings, Schibsted for body, editorial dark theme. Reuses tokens already defined in `app/globals.css`.

## Error handling

| Condition | UI behavior |
|---|---|
| No wallet connected | "Run" button disabled, copy reads "Connect a devnet wallet to begin" |
| Wallet on non-devnet cluster | Toast (existing `ToastProvider`) + abort before generator starts |
| Funding tx fails | Step ① renders red, generator stops, "Run" re-enables for retry |
| Sign-root or derive-child failure | Step renders red with raw anchor error message, generator stops |
| Step ④ rejected by predicate (expected) | Step renders **green ✓ REJECTED** with reason — this is the demo's payoff |
| Step ④ fails for any other reason (RPC, network) | Step renders red, distinct from the expected-rejection case |

Distinguishing the expected rejection from an unexpected error: the catch in `flow.ts` inspects the anchor error message for the predicate-violation custom error code from the Fuin program. If matched → emit `{ status: "ok", reason }`. Otherwise → emit `{ status: "failed", error }`.

## Provider relocation

`apps/vault/app/dashboard/_providers/{WalletProviders,FuinProvider}.tsx` move to `apps/vault/app/_providers/`. The dashboard layout updates its imports. The new `/swarm` layout imports from the same location.

This is a small refactor justified by the new surface — `/swarm` and `/dashboard` both need wallet adapter, and the next v2 surface will likely need it too. Avoids two-deep relative imports and a duplicate-providers tree.

## Testing

No automated browser tests for this surface; the existing app has none. Verification is:

1. `pnpm check-types` clean across `apps/vault` and any touched package.
2. `pnpm lint` clean.
3. Manual: `pnpm dev` (the vault app — note the existing `dev:vault` script mismatch noted in `CLAUDE.md`; if needed, run `pnpm --filter web dev`), connect Phantom on devnet, click Run, watch all six events fire green (with ④ "green REJECTED"), confirm the audit link opens `/audit/<rootPda>` and the tree renders.

## Skipped per user instruction

- `superpowers:requesting-code-review` after implementation.
- `superpowers:security-review` (`security-review` command).

Standard `superpowers:verification-before-completion` still runs (typecheck + manual browser test).

## Out of scope

- Persistence of demo runs.
- Multi-user / auth.
- Mainnet support.
- Configurable predicates / budgets in the UI.
- MCP server v2 tools (Gap #1) and agent CLI v2 wrappers (Gap #2).
- Re-styling `/dashboard` to v2 editorial (Gap #3).
