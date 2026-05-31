# Fuin

### One signature. Infinite agents. Fixed downside.

**Fuin is a programmable authorization layer for AI agents on Solana** — a wallet you can hand to an autonomous agent (or a teammate, or a kid) that can spend *within rules enforced on-chain* but can **never** drain you.

A private key grants unlimited authority. Autonomous agents need *bounded* authority. Fuin splits the two apart: funds live in a keyless program-controlled vault, and agents get only a **scoped, on-chain-checked capability** — a budget, an allow-list, a time window, a kill-switch. If an agent is compromised or goes rogue, the blast radius is a number you chose up front.

---

## Links

- **Repository:** https://github.com/Fuin-Labs/Fuin
- **On-chain program (devnet):** [`E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy`](https://explorer.solana.com/address/E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy?cluster=devnet)
- **Live demo:** _add your hosted URL here_ <!-- TODO: replace with deployment link before submitting -->
- **Walkthrough video:** _add your Loom/video URL here_ <!-- TODO: replace with video link before submitting -->

Built with **Rust + Anchor**, a **TypeScript SDK**, an **MCP server** for agents, and a **Next.js** app — in a Turborepo monorepo.

---

## What's inside: two layers, one program

Fuin ships two generations of the same idea in a **single Anchor program**.

### v1 — Restrictive wallet / programmable IAM
A **guardian** creates an on-chain **vault** and issues **delegate keys** scoped with bitmask permissions, spending caps, program allow/deny lists, and expiry. This is the immediate, use-it-today surface: give an AI agent real money it physically cannot run off with.

```
Guardian ──▶ Vault (PDA — holds funds + policy)
                 │ issues
                 ▼
             Delegate key  ─ permissions · spending caps · allowed programs · expiry
                 │ signs execute_transfer / _spl / _swap
                 ▼
             On-chain policy engine validates every constraint ──▶ funds move, or the tx fails
```

### v2 — Proof-of-intent for agent swarms
A user signs **one** structured `Intent` on-chain (agent, predicate, budget, expiry). Any agent under it can derive a **strictly tighter** child intent for a sub-agent — it can only ever *shrink* authority, never widen it. At execution, an on-chain **ancestor walk** re-checks the action against the leaf intent **and every parent**. No layer can widen scope. Ever.

```
User ──signs──▶ Root Intent            agent A · predicate · budget · expiry
                    │ derive (only narrower)
                    ▼
                Child Intent           agent B · scope ⊆ A · budget ⊆ A
                    │ derive
                    ▼
                Grandchild Intent      agent C · scope ⊆ B
                    │
   action ──────────┤  verify_authorizes walks  C → B → Root
                    ▼  every ancestor's predicate must accept
              ✅ allowed   /   ❌ rejected on-chain
```

---

## Repository layout

This is a Turborepo + pnpm monorepo.

```
fuin/
├─ programs/fuin/          Anchor program (Rust) — v1 vaults + v2 intents, one program
├─ packages/
│  ├─ sdk/                 @fuin-labs/sdk        v1 client: vaults, delegates, transfers, DLMM swap
│  ├─ sdk-v2/              @fuin-labs/sdk-v2     v2 client: intents, GoalPredicate builder, ancestor walk
│  ├─ mcp-server/          @fuin-labs/mcp-server MCP tools so AI agents can use Fuin (stdio)
│  ├─ db/                  @fuin-labs/db         Prisma + PostgreSQL (off-chain labels & audit log)
│  └─ ui/                  @repo/ui              shared React components
└─ apps/
   ├─ vault/               Next.js app — landing site + dashboard + live swarm demo (port 3000)
   ├─ relayer/             Hono server — fee paymaster + v2 swarm endpoints (port 8788)
   ├─ swarm-demo/          CLI — end-to-end v2 intent-hierarchy demo (the headline proof)
   └─ agent/               CLI — reference delegate that executes sol/spl/swap actions
```

---

## Prerequisites

| Tool | Version | Needed for |
|------|---------|------------|
| **Node.js** | ≥ 18 (20 LTS recommended) | everything |
| **pnpm** | ≥ 9 | package manager (`npm i -g pnpm`) |
| **PostgreSQL** | any recent | dashboard labels + audit (a free [Neon](https://neon.tech) DB works) |
| **Rust + Solana CLI + Anchor** | Anchor 0.32.x | only if you build/deploy the program |

> You do **not** need Rust/Anchor just to run the web app or the SDK — the compiled program IDL is already committed.

---

## Quickstart (60 seconds)

See the product without any keys or database:

```bash
git clone https://github.com/Fuin-Labs/Fuin.git
cd Fuin
pnpm install
pnpm dev:vault          # starts the Next.js app
```

Open **http://localhost:3000** and explore:

- `/` — the landing page
- `/docs` — full product documentation
- `/swarm` — the live v2 intent-hierarchy demo
- `/audit/<intentPda>` — a public intent-tree explorer

The **dashboard** (`/dashboard`) and the **live swarm/audit** features need a database and/or the relayer — see *Full local setup* below.

---

## Full local setup

### 1. Configure environment variables

Each component reads its own `.env`. Copy the examples and fill them in (all `.env` files are gitignored — **never commit real keys**).

| Component | File | Variables |
|-----------|------|-----------|
| Database (`@fuin-labs/db`) | `.env` (repo root) | `DATABASE_URL` |
| Vault app | `apps/vault/.env` | `DATABASE_URL`, `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_SOLANA_NETWORK` (default `devnet`) |
| Relayer | `apps/relayer/.env` | `RELAYER_FUNDER_PRIVATE_KEY` (base58, **required**), `SOLANA_RPC_URL`, `RELAYER_PORT` (default `8788`) |
| MCP server | env / `.mcp.json` | `DELEGATE_PRIVATE_KEY` (base58, **required**), `SOLANA_RPC_URL`, `FUIN_RELAYER_URL`, `FUIN_API_URL` |
| Agent CLI | env | `DELEGATE_PRIVATE_KEY`, `GUARDIAN_PUBKEY`, `ACTION` (`sol`\|`spl`\|`swap`), `VAULT_NONCE`, `DELEGATE_NONCE`, `DESTINATION_PUBKEY`, … |

```bash
cp .env.example .env
cp apps/vault/.env.example apps/vault/.env
# then edit the files with your values
```

### 2. Set up the database

The schema is **push-based** (there are no migration files):

```bash
pnpm --filter @fuin-labs/db db:push      # apply prisma/schema.prisma to your database
pnpm --filter @fuin-labs/db db:studio    # (optional) browse the data
```

### 3. Build and run

```bash
pnpm build              # prisma generate, then turbo build (SDKs build before apps)
pnpm dev:vault          # vault app on http://localhost:3000

# In a second terminal — required for v2 swarm tools and the transfer-sol paymaster:
pnpm relayer:dev        # relayer on http://localhost:8788
```

> The DB only ever stores **off-chain metadata** (human-readable labels, an audit log, program-allow-list requests). All real state — funds, policies, intents — lives on-chain.

---

## Reproduce the v2 proof (the highlight)

The clearest demonstration of the core guarantee. It funds a swarm of agents, has a user sign one root intent, derives tighter child intents, then makes a **rogue agent attempt an action outside its parent's scope** — and the on-chain ancestor walk rejects it.

```bash
# Needs a funded devnet keypair at ~/.config/solana/id.json:
solana config set --url devnet
solana airdrop 2

pnpm --filter fuin-swarm-demo demo:devnet
```

Watch the output: the orchestrator carves budget to research/execute/audit children, then the rogue child's out-of-scope transfer is **REJECTED ✓** on-chain. (Use `demo:localnet` to run against a local validator instead.)

---

## Smart contract (Anchor)

All `anchor` commands run from the workspace at `programs/fuin/`:

```bash
cd programs/fuin

anchor build            # compile the Solana program
anchor test             # runs the v2 intent suite (tests/fuin-v2-intent.ts)
anchor deploy           # deploy to the configured cluster

# Run the v1 vault/delegate suite explicitly:
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/fuin.ts
```

The program contains both generations:

- **v1 instructions:** `init_vault`, `issue_delegate`, `execute_transfer`, `execute_spl_transfer`, `execute_swap`, `update_vault`, `delegate_control`, `freeze_vault`, `unfreeze_vault`, `withdraw`
- **v2 instructions:** `sign_root_intent`, `derive_child_intent`, `verify_authorizes`, `revoke_intent`

**After any contract change**, rebuild and sync the IDL into **both** SDKs (one IDL covers v1 + v2):

```bash
cp programs/fuin/target/idl/fuin.json packages/sdk/src/idl/fuin.json
cp programs/fuin/target/idl/fuin.json packages/sdk-v2/src/idl/fuin.json
```

---

## Connect an AI agent (MCP)

The MCP server (`@fuin-labs/mcp-server`) exposes Fuin to any MCP-compatible AI agent over stdio — **16 tools** in total: v1 vault operations (`get-balance`, `list-delegates`, `transfer-sol`, `transfer-spl`, `swap`, `request-program`, …) and v2 swarm tools (`sign-root-intent`, `derive-child-intent`, `verified-spl-transfer`, `attempt-rogue-action`, …).

Configure it in `.mcp.json` at the repo root:

```json
{
  "mcpServers": {
    "fuin": {
      "command": "npx",
      "args": ["tsx", "packages/mcp-server/src/index.ts"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-delegate-key>",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com",
        "FUIN_RELAYER_URL": "http://127.0.0.1:8788"
      }
    }
  }
}
```

The server auto-resolves the guardian, vault, and delegate from the delegate key's on-chain accounts. The v2 tools and `transfer-sol` require the relayer (`pnpm relayer:dev`) to be running.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | `prisma generate`, then build SDKs + apps via Turbo |
| `pnpm dev` | Start all dev servers |
| `pnpm dev:vault` | Vault app only (port 3000) |
| `pnpm relayer:dev` | Relayer (port 8788) — needed for v2 + `transfer-sol` |
| `pnpm lint` | Lint everything |
| `pnpm format` | Prettier format |
| `pnpm check-types` | TypeScript type-check |
| `pnpm build:program` | `anchor build` the Solana program |
| `pnpm --filter @fuin-labs/db db:push` | Apply the Prisma schema to your database |
| `pnpm --filter fuin-swarm-demo demo:devnet` | Run the v2 swarm demo on devnet |

---

## Tech stack

- **Solana** — L1 blockchain · **Anchor** — program framework (Rust)
- **Pyth Network** — on-chain oracle for USD price feeds
- **Meteora DLMM** — on-chain swaps (via `declare_program!`)
- **TypeScript SDKs** — `@fuin-labs/sdk` (v1) and `@fuin-labs/sdk-v2` (v2)
- **MCP** — Model Context Protocol, so AI agents can call Fuin as tools
- **Next.js 16** + Solana Wallet Adapter — landing site + dashboard
- **Hono** — the relayer / paymaster HTTP server
- **Prisma + PostgreSQL** — off-chain labels and audit log
- **Turborepo + pnpm workspaces** — monorepo orchestration

---

## License

MIT
