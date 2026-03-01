# Fuin

Fuin is a programmable Identity Access Management (IAM) layer and restrictive wallet protocol on Solana. Guardians create on-chain vaults and issue scoped delegate keys — with bitmask permissions, spending caps, and policy constraints — to AI agents or human users. Delegates can transact within strict boundaries without ever gaining custody of the vault.

## How It Works

1. **Guardian** deploys a vault (PDA) on Solana, deposits funds, and defines a policy set
2. **Vault** issues delegate keys with granular permissions (`CAN_SWAP`, `CAN_TRANSFER`, `CAN_STAKE`, `CAN_LP`)
3. **Delegate** (AI agent or human) signs off-chain intents to transact
4. **Policy Engine** validates every constraint on-chain — permissions, spending caps, program allowlists, time windows, risk thresholds
5. **Relayer** submits the verified meta-transaction; gas is auto-sponsored from the guardian's GasTank PDA

## Architecture

```
programs/fuin/          Anchor/Rust smart contract (Solana program)
packages/sdk/           TypeScript SDK (@fuin/sdk)
packages/mcp-server/    MCP server for AI agent integration
packages/db/            Prisma + PostgreSQL database layer
apps/vault/             Next.js landing page + dashboard (port 3000)
apps/agent/             Node.js agent CLI
```

### On-Chain Program

**Program ID:** `E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy`

Two core accounts:
- **Vault** — holds funds and policies. PDA seeds: `["vault", guardian, nonce]`
- **Delegate** — scoped access key. PDA seeds: `["delegate", vault, nonce]`

Instructions: `init_vault`, `issue_delegate`, `execute_transfer`, `execute_spl_transfer`, `execute_swap`, `freeze_vault`, `unfreeze_vault`, `delegate_control`, `update_vault`, `withdraw`

### SDK

The TypeScript SDK (`@fuin/sdk`) wraps all program instructions via the `FuinClient` class. It ships TypeScript source directly — consumers import `.ts` files via bundler resolution.

### MCP Server

The MCP server exposes Fuin operations as tools for AI agents — get balances, list delegates, transfer SOL/SPL tokens, swap via Meteora, and request program allowlist changes.

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0.0
- **Rust** + **Anchor CLI** (for smart contract development)
- **Solana CLI** (for deployment and local validator)

## Setup

```bash
# Clone the repo
git clone https://github.com/FuinLabs/fuin.git
cd fuin

# Install dependencies
pnpm install

# Build everything (SDK first, then apps)
pnpm build

# Start all dev servers
pnpm dev

# Or start the vault app only (port 3000)
pnpm dev:vault
```

### Smart Contract

```bash
# Build the Solana program
cd programs/fuin
anchor build

# Run tests (starts local validator automatically)
anchor test

# Deploy to configured cluster
anchor deploy

# After contract changes, sync IDL to SDK:
cp target/idl/fuin.json ../../packages/sdk/src/idl/fuin.json
```

### Environment Variables

Create a `.env` file in the repo root for the MCP server and agent:

```
SOLANA_RPC_URL=https://api.devnet.solana.com
DELEGATE_PRIVATE_KEY=<base58-encoded-private-key>
DATABASE_URL=<postgresql-connection-string>
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build SDK + all apps via Turbo |
| `pnpm dev` | Start all dev servers |
| `pnpm dev:vault` | Vault app only (port 3000) |
| `pnpm lint` | Lint everything |
| `pnpm format` | Prettier format |
| `pnpm check-types` | TypeScript type check |
| `pnpm build:program` | Build the Anchor program |

## Tech Stack

- **Solana** — L1 blockchain
- **Anchor** — Solana program framework
- **Pyth Network** — on-chain oracle for USD price feeds
- **Next.js 16** — frontend framework
- **Solana Wallet Adapter** — wallet connection
- **Prisma** — database ORM
- **Turborepo** — monorepo build orchestration
- **MCP** — Model Context Protocol for AI agent tooling

## License

MIT
