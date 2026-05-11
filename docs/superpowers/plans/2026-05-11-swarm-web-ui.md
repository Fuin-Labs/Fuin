# Swarm Web UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the v2 swarm flow (currently CLI-only in `apps/swarm-demo`) runnable from the browser at `/swarm` in `apps/vault`, with results flowing into the existing `/audit/[pda]` explorer.

**Architecture:** Client-side only — connected wallet funds eight ephemeral keypairs in one tx, then ephemeral keypairs sign their own intent ixs through `@fuin-labs/sdk-v2` with the `AnchorProvider`'s wallet rotated per step. A `flow.ts` async generator orchestrates and yields `StepEvent`s; `SwarmRunner` is a dumb consumer that renders each event into a `StepCard`. Mirrors the CLI in `apps/swarm-demo/src/run.ts` step-for-step.

**Tech Stack:** Next.js 16 (App Router), React, `@solana/wallet-adapter-react` (Phantom), `@coral-xyz/anchor` 0.32.1, `@fuin-labs/sdk-v2`, devnet RPC.

**Spec:** `docs/superpowers/specs/2026-05-11-swarm-web-ui-design.md`

**No automated tests for this surface** — the vault app has no test infrastructure and the spec accepts manual verification. TDD steps below are dropped in favor of manual browser checks at the end. Skipping `requesting-code-review` and `security-review` per user instruction.

---

### Task 1: Relocate wallet + Fuin providers to a shared app-level folder

Moves `WalletProviders` and `FuinProvider` out of `dashboard/_providers/` so `/swarm` (and any future v2 surface) can use them without reaching into a sibling route's private folder.

**Files:**
- Create: `apps/vault/app/_providers/WalletProviders.tsx` (copied from dashboard)
- Create: `apps/vault/app/_providers/FuinProvider.tsx` (copied from dashboard)
- Delete: `apps/vault/app/dashboard/_providers/WalletProviders.tsx`
- Delete: `apps/vault/app/dashboard/_providers/FuinProvider.tsx`
- Modify: `apps/vault/app/dashboard/layout.tsx` (update two import paths)

- [ ] **Step 1: Copy providers up**

```bash
cd /home/jayant/Desktop/fuin
mkdir -p apps/vault/app/_providers
git mv apps/vault/app/dashboard/_providers/WalletProviders.tsx apps/vault/app/_providers/WalletProviders.tsx
git mv apps/vault/app/dashboard/_providers/FuinProvider.tsx apps/vault/app/_providers/FuinProvider.tsx
```

- [ ] **Step 2: Update dashboard layout imports**

Edit `apps/vault/app/dashboard/layout.tsx`, replace these two lines near the top:

```tsx
import { WalletProviders } from "./_providers/WalletProviders";
import { FuinProvider } from "./_providers/FuinProvider";
```

with:

```tsx
import { WalletProviders } from "../_providers/WalletProviders";
import { FuinProvider } from "../_providers/FuinProvider";
```

Leave the other dashboard `_providers/` imports (`ToastProvider`, `HeaderProvider`) untouched — they stay private to `/dashboard`.

- [ ] **Step 3: Typecheck**

Run from repo root:
```bash
pnpm --filter web check-types
```
Expected: clean exit, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add apps/vault/app/_providers apps/vault/app/dashboard/_providers apps/vault/app/dashboard/layout.tsx
git commit -m "refactor: hoist Wallet/Fuin providers to app/_providers for /swarm reuse"
```

---

### Task 2: Scaffold the /swarm route + copy IDL locally

Creates the route skeleton with a placeholder runner. IDL is copied into the app so we don't depend on a runtime path traversal into `programs/fuin/target/`.

**Files:**
- Create: `apps/vault/app/swarm/layout.tsx`
- Create: `apps/vault/app/swarm/page.tsx`
- Create: `apps/vault/app/swarm/_components/SwarmRunner.tsx` (stub)
- Create: `apps/vault/app/swarm/_lib/fuin-idl.json` (copied from programs/fuin/target/idl/fuin.json)
- Create: `apps/vault/app/swarm/_lib/idl.ts`

- [ ] **Step 1: Copy IDL into the app tree**

```bash
cd /home/jayant/Desktop/fuin
mkdir -p apps/vault/app/swarm/_lib apps/vault/app/swarm/_components
cp programs/fuin/target/idl/fuin.json apps/vault/app/swarm/_lib/fuin-idl.json
```

If `programs/fuin/target/idl/fuin.json` is missing, run `cd programs/fuin && anchor build` first to generate it.

- [ ] **Step 2: Create the IDL wrapper module**

Create `apps/vault/app/swarm/_lib/idl.ts`:

```ts
import type { Idl } from "@coral-xyz/anchor";
import idlJson from "./fuin-idl.json";

export const FUIN_IDL = idlJson as unknown as Idl;
```

- [ ] **Step 3: Create the route layout that wraps the wallet providers**

Create `apps/vault/app/swarm/layout.tsx`:

```tsx
import React from "react";
import { WalletProviders } from "../_providers/WalletProviders";

export default function SwarmLayout({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
```

- [ ] **Step 4: Create the page (thin server component)**

Create `apps/vault/app/swarm/page.tsx`:

```tsx
import React from "react";
import { SwarmRunner } from "./_components/SwarmRunner";

export default function SwarmPage() {
  return <SwarmRunner />;
}

export const dynamic = "force-dynamic";
```

- [ ] **Step 5: Create the SwarmRunner stub**

Create `apps/vault/app/swarm/_components/SwarmRunner.tsx`:

```tsx
"use client";

import React, { useEffect } from "react";

export function SwarmRunner() {
  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <h1 className="t-display">Fuin v2 — swarm demo</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--cream-soft)" }}>
        Connect a devnet wallet, click Run, watch each step land on-chain.
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Verify the route renders**

```bash
pnpm --filter web dev
```

Open `http://localhost:3000/swarm`. Expected: the stub heading renders with v2 dark editorial styling (same look as `/`). No console errors.

Stop the dev server before committing.

- [ ] **Step 7: Commit**

```bash
git add apps/vault/app/swarm
git commit -m "feat(swarm-web): scaffold /swarm route with IDL bundled locally"
```

---

### Task 3: Define StepEvent types

Lock in the contract between `flow.ts` (producer) and `SwarmRunner` / `StepCard` (consumers).

**Files:**
- Create: `apps/vault/app/swarm/_lib/types.ts`

- [ ] **Step 1: Write the types module**

Create `apps/vault/app/swarm/_lib/types.ts`:

```ts
export type StepStatus = "pending" | "running" | "ok" | "failed";

export type StepId =
  | "fund"
  | "sign-root"
  | "derive-research"
  | "derive-execute"
  | "derive-audit"
  | "rogue-reject";

export interface StepBase {
  id: StepId;
  status: StepStatus;
  error?: string;
}

export interface FundEvent extends StepBase {
  id: "fund";
  sig?: string;
}

export interface SignRootEvent extends StepBase {
  id: "sign-root";
  pda?: string;
  sig?: string;
  scope?: string;
}

export interface DeriveChildEvent extends StepBase {
  id: "derive-research" | "derive-execute" | "derive-audit";
  pda?: string;
  sig?: string;
  scope?: string;
}

export interface RogueRejectEvent extends StepBase {
  id: "rogue-reject";
  reason?: string;
}

export type StepEvent =
  | FundEvent
  | SignRootEvent
  | DeriveChildEvent
  | RogueRejectEvent;

export interface SwarmRunResult {
  rootPda: string;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/vault/app/swarm/_lib/types.ts
git commit -m "feat(swarm-web): StepEvent type definitions"
```

---

### Task 4: Build the StepCard component

Pure presentational card. Renders one `StepEvent` into a row with title, status badge, optional data (PDA / sig / scope / reason), and an explorer link.

**Files:**
- Create: `apps/vault/app/swarm/_components/StepCard.tsx`

- [ ] **Step 1: Write StepCard**

Create `apps/vault/app/swarm/_components/StepCard.tsx`:

```tsx
"use client";

import React from "react";
import Link from "next/link";
import type { StepEvent, StepId } from "../_lib/types";

const EXPLORER_ADDR = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;
const EXPLORER_TX = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const TITLES: Record<StepId, string> = {
  "fund": "① Fund 8 keypairs",
  "sign-root": "② User signs ROOT intent",
  "derive-research": "③a Spawn sub-agent: research (read-only)",
  "derive-execute": "③b Spawn sub-agent: execute (Jupiter only)",
  "derive-audit": "③c Spawn sub-agent: audit (read-only)",
  "rogue-reject": "④ Rogue Raydium / out-of-scope attempt",
};

function shortAddr(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function StatusBadge({ event }: { event: StepEvent }) {
  // Rogue rejection: status="ok" means the boundary held → demo payoff
  if (event.id === "rogue-reject" && event.status === "ok") {
    return <span style={{ color: "var(--accent-success, #5bd17a)" }}>✓ REJECTED (boundary held)</span>;
  }
  if (event.status === "ok") return <span style={{ color: "var(--accent-success, #5bd17a)" }}>✓ ok</span>;
  if (event.status === "failed") return <span style={{ color: "var(--accent-danger, #e07a7a)" }}>✗ failed</span>;
  if (event.status === "running") return <span style={{ color: "var(--cream-soft)" }}>…running</span>;
  return <span style={{ color: "var(--cream-soft, #999)", opacity: 0.6 }}>pending</span>;
}

export function StepCard({ event }: { event: StepEvent }) {
  const title = TITLES[event.id];
  const pda = "pda" in event ? event.pda : undefined;
  const sig = "sig" in event ? event.sig : undefined;
  const scope = "scope" in event ? event.scope : undefined;
  const reason = "reason" in event ? event.reason : undefined;

  return (
    <div
      className="border rounded-md p-4 my-2"
      style={{ borderColor: "color-mix(in oklch, var(--cream) 12%, transparent)" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <StatusBadge event={event} />
      </div>

      {scope && (
        <div className="text-xs mt-1" style={{ color: "var(--cream-soft)" }}>
          {scope}
        </div>
      )}

      {pda && (
        <div className="text-xs mt-1 font-mono">
          pda:{" "}
          <Link href={EXPLORER_ADDR(pda)} target="_blank" rel="noreferrer" className="underline">
            {shortAddr(pda)}
          </Link>
        </div>
      )}

      {sig && (
        <div className="text-xs mt-1 font-mono">
          sig:{" "}
          <Link href={EXPLORER_TX(sig)} target="_blank" rel="noreferrer" className="underline">
            {shortAddr(sig)}
          </Link>
        </div>
      )}

      {reason && (
        <div className="text-xs mt-1" style={{ color: "var(--cream-soft)" }}>
          reason: {reason}
        </div>
      )}

      {event.error && (
        <div className="text-xs mt-1" style={{ color: "var(--accent-danger, #e07a7a)" }}>
          error: {event.error}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/vault/app/swarm/_components/StepCard.tsx
git commit -m "feat(swarm-web): StepCard presentational component"
```

---

### Task 5: Implement flow.ts — funding step

Builds the async generator's scaffolding and the first step: a single transaction funding all eight ephemeral keypairs from the connected wallet.

**Files:**
- Create: `apps/vault/app/swarm/_lib/flow.ts`

- [ ] **Step 1: Write the funding step + generator scaffolding**

Create `apps/vault/app/swarm/_lib/flow.ts`:

```ts
import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Fuin } from "@fuin-labs/sdk-v2";
import { FUIN_IDL } from "./idl";
import type { StepEvent, SwarmRunResult } from "./types";

const FUND_SOL_PER_KEY = 0.06;

interface Roles {
  user: Keypair;
  orchestrator: Keypair;
  research: Keypair;
  executeAgent: Keypair;
  audit: Keypair;
  subUser: Keypair;
  subOrch: Keypair;
  rogue: Keypair;
}

function buildRoles(): Roles {
  return {
    user: Keypair.generate(),
    orchestrator: Keypair.generate(),
    research: Keypair.generate(),
    executeAgent: Keypair.generate(),
    audit: Keypair.generate(),
    subUser: Keypair.generate(),
    subOrch: Keypair.generate(),
    rogue: Keypair.generate(),
  };
}

function makeProvider(connection: Connection, payer: Keypair): anchor.AnchorProvider {
  const wallet = new anchor.Wallet(payer);
  return new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

function makeFuin(connection: Connection, payer: Keypair): Fuin {
  return new Fuin({ provider: makeProvider(connection, payer), idl: FUIN_IDL });
}

async function fundAllInOneTx(
  connection: Connection,
  funder: WalletContextState,
  roles: Roles
): Promise<string> {
  if (!funder.publicKey || !funder.signTransaction) {
    throw new Error("wallet not connected");
  }
  const lamports = Math.floor(FUND_SOL_PER_KEY * LAMPORTS_PER_SOL);
  const targets = [
    roles.user, roles.orchestrator,
    roles.research, roles.executeAgent, roles.audit,
    roles.subUser, roles.subOrch, roles.rogue,
  ].map((kp) => kp.publicKey);

  const tx = new Transaction();
  for (const to of targets) {
    tx.add(SystemProgram.transfer({
      fromPubkey: funder.publicKey,
      toPubkey: to,
      lamports,
    }));
  }
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = funder.publicKey;

  const signed = await funder.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
  return sig;
}

export async function* runSwarmDemo(args: {
  connection: Connection;
  funder: WalletContextState;
}): AsyncGenerator<StepEvent, SwarmRunResult> {
  const roles = buildRoles();

  // ── Step 1: fund ────────────────────────────────────────────────────────
  yield { id: "fund", status: "running" };
  let fundSig: string;
  try {
    fundSig = await fundAllInOneTx(args.connection, args.funder, roles);
  } catch (e: any) {
    yield { id: "fund", status: "failed", error: e?.message ?? String(e) };
    throw e;
  }
  yield { id: "fund", status: "ok", sig: fundSig };

  // ── Steps 2–4 are added in subsequent tasks ─────────────────────────────
  throw new Error("flow not yet implemented past funding");
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/vault/app/swarm/_lib/flow.ts
git commit -m "feat(swarm-web): flow.ts scaffolding + funding step"
```

---

### Task 6: Extend flow.ts — sign root intent

Adds the second step: `user` signs the root intent (Jupiter DEX, 24h window, 500 USDC budget).

**Files:**
- Modify: `apps/vault/app/swarm/_lib/flow.ts`

- [ ] **Step 1: Import sdk-v2 helpers**

In `apps/vault/app/swarm/_lib/flow.ts`, replace the existing sdk-v2 import line:

```ts
import { Fuin } from "@fuin-labs/sdk-v2";
```

with:

```ts
import { Fuin, GoalPredicate } from "@fuin-labs/sdk-v2";

const JUPITER = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
```

- [ ] **Step 2: Replace the placeholder throw with the sign-root step**

Replace the line:

```ts
throw new Error("flow not yet implemented past funding");
```

with:

```ts
const now = Math.floor(Date.now() / 1000);

// ── Step 2: user signs root intent ──────────────────────────────────────
yield { id: "sign-root", status: "running" };
let rootPda: PublicKey;
let rootSig: string;
try {
  const fuinAsUser = makeFuin(args.connection, roles.user);
  const rootPredicate = GoalPredicate.composite()
    .onlyOnDexes([JUPITER])
    .withinTimeWindow(now - 3600, now + 24 * 3600)
    .build();
  const rootNonce = Date.now();
  const out = await fuinAsUser.signRootIntent({
    user: roles.user,
    agent: roles.orchestrator.publicKey,
    predicate: rootPredicate,
    budget: 500_000_000n,
    expiresAt: BigInt(now + 24 * 3600),
    nonce: rootNonce,
  });
  rootPda = out.pda;
  rootSig = out.sig;
} catch (e: any) {
  yield { id: "sign-root", status: "failed", error: e?.message ?? String(e) };
  throw e;
}
yield {
  id: "sign-root",
  status: "ok",
  pda: rootPda.toBase58(),
  sig: rootSig,
  scope: "Jupiter · 24h · 500 USDC",
};

// ── Step 3 (children) added in next task ────────────────────────────────
throw new Error("flow not yet implemented past sign-root");
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/vault/app/swarm/_lib/flow.ts
git commit -m "feat(swarm-web): flow.ts — sign root intent step"
```

---

### Task 7: Extend flow.ts — derive 3 child intents

Adds the third step: orchestrator derives research (read-only $50), execute (Jupiter $400), audit (read-only $50) child intents.

**Files:**
- Modify: `apps/vault/app/swarm/_lib/flow.ts`

- [ ] **Step 1: Add a helper to derive a single child**

In `apps/vault/app/swarm/_lib/flow.ts`, just above the `runSwarmDemo` export, add:

```ts
async function deriveChild(args: {
  connection: Connection;
  parentAgent: Keypair;
  parent: PublicKey;
  childAgent: PublicKey;
  predicate: ReturnType<typeof GoalPredicate.empty>;
  budgetMicros: bigint;
  expiresAt: bigint;
  nonce: number;
}): Promise<{ pda: PublicKey; sig: string }> {
  const fuin = makeFuin(args.connection, args.parentAgent);
  return fuin.deriveChildIntent({
    parentAgent: args.parentAgent,
    parent: args.parent,
    childAgent: args.childAgent,
    predicate: args.predicate,
    budget: args.budgetMicros,
    expiresAt: args.expiresAt,
    nonce: args.nonce,
  });
}
```

If the TypeScript inference on `predicate` rejects the return-type alias above, replace `ReturnType<...>` with `any` — this is a demo path, not a public API.

- [ ] **Step 2: Replace the second placeholder throw with the three derive steps**

Replace the line:

```ts
throw new Error("flow not yet implemented past sign-root");
```

with:

```ts
const childExp = BigInt(now + 23 * 3600);

// ── Step 3a: research (read-only, $50) ──────────────────────────────────
yield { id: "derive-research", status: "running" };
try {
  const r = await deriveChild({
    connection: args.connection,
    parentAgent: roles.orchestrator,
    parent: rootPda,
    childAgent: roles.research.publicKey,
    predicate: GoalPredicate.readOnly(),
    budgetMicros: 50_000_000n,
    expiresAt: childExp,
    nonce: 1,
  });
  yield {
    id: "derive-research",
    status: "ok",
    pda: r.pda.toBase58(),
    sig: r.sig,
    scope: "read-only · $50",
  };
} catch (e: any) {
  yield { id: "derive-research", status: "failed", error: e?.message ?? String(e) };
  throw e;
}

// ── Step 3b: execute (Jupiter, $400) ────────────────────────────────────
yield { id: "derive-execute", status: "running" };
try {
  const r = await deriveChild({
    connection: args.connection,
    parentAgent: roles.orchestrator,
    parent: rootPda,
    childAgent: roles.executeAgent.publicKey,
    predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
    budgetMicros: 400_000_000n,
    expiresAt: childExp,
    nonce: 2,
  });
  yield {
    id: "derive-execute",
    status: "ok",
    pda: r.pda.toBase58(),
    sig: r.sig,
    scope: "Jupiter only · $400",
  };
} catch (e: any) {
  yield { id: "derive-execute", status: "failed", error: e?.message ?? String(e) };
  throw e;
}

// ── Step 3c: audit (read-only, $50) ─────────────────────────────────────
yield { id: "derive-audit", status: "running" };
try {
  const r = await deriveChild({
    connection: args.connection,
    parentAgent: roles.orchestrator,
    parent: rootPda,
    childAgent: roles.audit.publicKey,
    predicate: GoalPredicate.readOnly(),
    budgetMicros: 50_000_000n,
    expiresAt: childExp,
    nonce: 3,
  });
  yield {
    id: "derive-audit",
    status: "ok",
    pda: r.pda.toBase58(),
    sig: r.sig,
    scope: "read-only · $50",
  };
} catch (e: any) {
  yield { id: "derive-audit", status: "failed", error: e?.message ?? String(e) };
  throw e;
}

// ── Step 4 (rogue attempt) added in next task ───────────────────────────
throw new Error("flow not yet implemented past derive-children");
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/vault/app/swarm/_lib/flow.ts
git commit -m "feat(swarm-web): flow.ts — derive three child intents"
```

---

### Task 8: Extend flow.ts — rogue boundary attempt + expected-rejection detector

Adds the fourth step: spawn a rogue child under a separate root, attempt an SPL transfer that the parent's `OnlyOnDexes=Jupiter` predicate should reject. Distinguish the expected predicate rejection (demo success — yield `status: "ok"`) from an unexpected error (yield `status: "failed"`).

**Files:**
- Modify: `apps/vault/app/swarm/_lib/flow.ts`

- [ ] **Step 1: Add SPL token program id constant**

Near the JUPITER constant in `flow.ts`, add:

```ts
const SPL_TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
```

Also import `TransactionInstruction` from `@solana/web3.js` (add to the existing import). After the change the web3.js import line should be:

```ts
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
```

And add the `BN` import below the anchor import:

```ts
import BN from "bn.js";
```

- [ ] **Step 2: Add the expected-rejection detector helper**

Just above `runSwarmDemo`, add:

```ts
// Anchor error messages from the Fuin program for predicate failures include
// keywords like "predicate", "dex", or the Anchor custom-error name. We treat
// any thrown error containing one of these markers as the expected rejection.
const EXPECTED_REJECTION_MARKERS = [
  "predicate",
  "Predicate",
  "DexNotAllowed",
  "OutOfBounds",
  "ScopeViolation",
];

function isExpectedRejection(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? String(e);
  return EXPECTED_REJECTION_MARKERS.some((m) => msg.includes(m));
}

function firstLineOf(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  return msg.split("\n")[0].slice(0, 120);
}
```

- [ ] **Step 3: Replace the third placeholder throw with the rogue step + final yield**

Replace the line:

```ts
throw new Error("flow not yet implemented past derive-children");
```

with:

```ts
// ── Step 4: rogue boundary attempt ──────────────────────────────────────
yield { id: "rogue-reject", status: "running" };
try {
  // Sub-root: subUser signs an intent restricted to Jupiter.
  const fuinAsSubUser = makeFuin(args.connection, roles.subUser);
  const subRoot = await fuinAsSubUser.signRootIntent({
    user: roles.subUser,
    agent: roles.subOrch.publicKey,
    predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
    budget: 100_000_000n,
    expiresAt: BigInt(now + 3600),
    nonce: Date.now() + 1,
  });

  // subOrch derives a child with an empty predicate — locally permissive,
  // but parent's DEX=Jupiter restriction still applies via verify_authorizes.
  const rogueChild = await deriveChild({
    connection: args.connection,
    parentAgent: roles.subOrch,
    parent: subRoot.pda,
    childAgent: roles.rogue.publicKey,
    predicate: GoalPredicate.empty(),
    budgetMicros: 50_000_000n,
    expiresAt: BigInt(now + 1800),
    nonce: 1,
  });

  // Rogue tries an SPL transfer — SPL_TOKEN_PROGRAM_ID is not Jupiter →
  // verify_authorizes should reject.
  const fakeSrc = Keypair.generate().publicKey;
  const fakeDst = Keypair.generate().publicKey;
  const splIx = new TransactionInstruction({
    programId: SPL_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: fakeSrc, isSigner: false, isWritable: true },
      { pubkey: fakeDst, isSigner: false, isWritable: true },
      { pubkey: roles.rogue.publicKey, isSigner: true, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([3]), new BN(1).toArrayLike(Buffer, "le", 8)]),
  });

  const fuinAsRogue = makeFuin(args.connection, roles.rogue);
  try {
    await fuinAsRogue.sendVerifiedAction({
      agent: roles.rogue,
      intent: rogueChild.pda,
      ancestors: [subRoot.pda],
      actionIx: splIx,
    });
    // If we get here, the boundary did NOT hold — that is a failure for the demo.
    yield {
      id: "rogue-reject",
      status: "failed",
      error: "unexpected success — verify_authorizes did not reject the out-of-scope ix",
    };
  } catch (inner) {
    if (isExpectedRejection(inner)) {
      yield { id: "rogue-reject", status: "ok", reason: firstLineOf(inner) };
    } else {
      yield {
        id: "rogue-reject",
        status: "failed",
        error: firstLineOf(inner),
      };
    }
  }
} catch (e: any) {
  // Setup error (sub-root sign or rogue derive itself failed) — not the
  // demo payoff, surface as failure.
  yield { id: "rogue-reject", status: "failed", error: firstLineOf(e) };
}

return { rootPda: rootPda.toBase58() };
```

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add apps/vault/app/swarm/_lib/flow.ts
git commit -m "feat(swarm-web): flow.ts — rogue boundary attempt + rejection detection"
```

---

### Task 9: Build the SwarmRunner UI

Replace the stub. Owns the connect-wallet check, the Run button, the per-step event list, and the post-run audit CTA.

**Files:**
- Modify: `apps/vault/app/swarm/_components/SwarmRunner.tsx`

- [ ] **Step 1: Replace the stub with the real runner**

Overwrite `apps/vault/app/swarm/_components/SwarmRunner.tsx`:

```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { runSwarmDemo } from "../_lib/flow";
import { StepCard } from "./StepCard";
import type { StepEvent, StepId } from "../_lib/types";

const STEP_ORDER: StepId[] = [
  "fund",
  "sign-root",
  "derive-research",
  "derive-execute",
  "derive-audit",
  "rogue-reject",
];

function initialEvents(): Record<StepId, StepEvent> {
  return {
    "fund": { id: "fund", status: "pending" },
    "sign-root": { id: "sign-root", status: "pending" },
    "derive-research": { id: "derive-research", status: "pending" },
    "derive-execute": { id: "derive-execute", status: "pending" },
    "derive-audit": { id: "derive-audit", status: "pending" },
    "rogue-reject": { id: "rogue-reject", status: "pending" },
  };
}

export function SwarmRunner() {
  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);

  const { connection } = useConnection();
  const wallet = useWallet();
  const [events, setEvents] = useState<Record<StepId, StepEvent>>(initialEvents);
  const [running, setRunning] = useState(false);
  const [rootPda, setRootPda] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const canRun = wallet.connected && !running;

  async function onRun() {
    setEvents(initialEvents());
    setRootPda(null);
    setFatal(null);
    setRunning(true);
    try {
      const gen = runSwarmDemo({ connection, funder: wallet });
      let result: { rootPda: string } | undefined;
      while (true) {
        const next = await gen.next();
        if (next.done) {
          result = next.value;
          break;
        }
        const ev = next.value;
        setEvents((prev) => ({ ...prev, [ev.id]: ev }));
      }
      if (result) setRootPda(result.rootPda);
    } catch (e: any) {
      setFatal(e?.message ?? String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="t-display">Fuin v2 — swarm demo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--cream-soft)" }}>
          Connect a devnet wallet. One funding tx, eight ephemeral keypairs,
          then watch the proof-of-intent flow land on-chain — ending with the
          rogue ix bouncing off <code>verify_authorizes</code>.
        </p>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <WalletMultiButton />
        <button
          onClick={onRun}
          disabled={!canRun}
          className="px-4 py-2 border rounded-md disabled:opacity-40"
          style={{ borderColor: "var(--cream)" }}
        >
          {running ? "Running…" : "▶ Run swarm demo"}
        </button>
      </div>

      {!wallet.connected && (
        <p className="text-xs mb-4" style={{ color: "var(--cream-soft)" }}>
          Connect a devnet wallet to begin.
        </p>
      )}

      <section>
        {STEP_ORDER.map((id) => (
          <StepCard key={id} event={events[id]} />
        ))}
      </section>

      {fatal && (
        <div
          className="mt-4 text-xs"
          style={{ color: "var(--accent-danger, #e07a7a)" }}
        >
          fatal: {fatal}
        </div>
      )}

      {rootPda && (
        <div className="mt-8">
          <Link
            href={`/audit/${rootPda}`}
            className="underline"
            style={{ color: "var(--cream)" }}
          >
            Open audit view →
          </Link>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/vault/app/swarm/_components/SwarmRunner.tsx
git commit -m "feat(swarm-web): SwarmRunner consumes flow.ts generator and renders steps"
```

---

### Task 10: Add /swarm to the landing-page nav

Discoverability — the landing page nav at `apps/vault/app/page.tsx` already links `#shape`, `#boundary`, `#sdk`, `#evidence`, and the demo audit. Add a `/swarm` link so visitors can run the live demo.

**Files:**
- Modify: `apps/vault/app/page.tsx` (one nav block)

- [ ] **Step 1: Inspect the nav block**

Open `apps/vault/app/page.tsx`. The nav links are around lines 60–95. Locate the `<Link href={...DEMO_ROOT_PDA}>` link in the header nav (around line 88).

- [ ] **Step 2: Add a "Run demo" link immediately before the existing audit link**

Just before the audit link (the one with `href={`/audit/${DEMO_ROOT_PDA}`}`), insert:

```tsx
<Link
  href="/swarm"
  className="t-nav-link"
>
  Run demo
</Link>
```

Match the existing nav link's wrapping element exactly — if the surrounding `<Link>` uses a different className or wrapper, copy that pattern instead of the snippet above.

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter web check-types
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/vault/app/page.tsx
git commit -m "feat(landing): add 'Run demo' nav link to /swarm"
```

---

### Task 11: Verification — typecheck, lint, and manual browser run

No automated browser tests for this surface. Final verification is a real end-to-end run on devnet.

- [ ] **Step 1: Repo-wide typecheck**

```bash
cd /home/jayant/Desktop/fuin
pnpm check-types
```
Expected: clean across the monorepo.

- [ ] **Step 2: Lint the vault app**

```bash
pnpm --filter web lint
```
Expected: clean (or only warnings that already exist on `main` — don't introduce new errors).

- [ ] **Step 3: Start the dev server**

```bash
pnpm --filter web dev
```
Wait until "Ready on http://localhost:3000".

- [ ] **Step 4: Manual run — happy path**

In a browser:

1. Open `http://localhost:3000/swarm`.
2. Confirm the page renders with v2 dark editorial styling, six step cards in `pending` state.
3. Click **Connect Wallet** → choose Phantom (must be on devnet, must hold ≥ 0.5 SOL devnet).
4. Click **▶ Run swarm demo**.
5. Approve the single funding-tx popup.
6. Watch each step transition `pending → running → ok` in order:
   - ① fund → ✓ ok (tx sig link works)
   - ② sign-root → ✓ ok (pda link works, scope reads "Jupiter · 24h · 500 USDC")
   - ③a/b/c → all ✓ ok with their respective scopes
   - ④ rogue-reject → **✓ REJECTED (boundary held)** with a reason line
7. Confirm the "Open audit view →" link appears at the bottom.
8. Click it → `/audit/<rootPda>` loads and shows a 4-node tree (root + 3 children).

- [ ] **Step 5: Manual run — verify wallet-disconnected state**

1. Disconnect the wallet from the modal.
2. Confirm the Run button is disabled and the "Connect a devnet wallet to begin." copy is visible.

- [ ] **Step 6: Stop dev server, summarize**

`Ctrl+C` the dev server. Confirm working tree has no uncommitted changes:

```bash
git status --short
```
Expected: empty (or only the pre-existing modified files that were dirty before this work).

- [ ] **Step 7: Tag the work**

No commit needed — verification is observational. If everything passed, the feature is done.

---

## Self-review notes

Cross-checked against the spec:

- ✅ Route `/swarm` in `apps/vault` — Tasks 2, 9
- ✅ Client-side only, no API route — confirmed in flow.ts (Tasks 5–8)
- ✅ One wallet popup (funding tx with 8 transfers) — Task 5
- ✅ Per-step provider rotation via `makeFuin(connection, payer)` — Tasks 5–8
- ✅ Fixed predicates / budgets mirroring CLI — Tasks 6, 7
- ✅ Rogue rejection rendered as success — Task 4 (StatusBadge special-case) + Task 8 (`isExpectedRejection`)
- ✅ Audit CTA links `/audit/<rootPda>` — Task 9
- ✅ Providers hoisted to `app/_providers/` — Task 1
- ✅ Out of scope (MCP v2, agent CLI, dashboard restyle, persistence, mainnet) — none of these tasks
- ✅ Skipping code-review / security-review per user — none scheduled

No placeholder steps; every step has explicit code or commands. Type names consistent: `StepEvent`, `StepId`, `StepStatus`, `SwarmRunResult`, `Roles`. Function names consistent: `runSwarmDemo`, `makeFuin`, `makeProvider`, `fundAllInOneTx`, `deriveChild`, `isExpectedRejection`, `firstLineOf`.
