# @fuin-labs/mcp-server

MCP (Model Context Protocol) server for [Fuin](https://github.com/Fuin-Labs/Fuin) — a programmable authorization layer on Solana. Lets AI agents manage delegate keys, check vault balances, and execute SOL transfers within on-chain policy constraints.

## Quick Start

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fuin": {
      "command": "npx",
      "args": ["-y", "@fuin-labs/mcp-server"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>"
      }
    }
  }
}
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "fuin": {
      "command": "npx",
      "args": ["-y", "@fuin-labs/mcp-server"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>"
      }
    }
  }
}
```

### Smithery

```bash
npx @smithery/cli install @fuin-labs/mcp-server
```

## Tools

| Tool | Description | Hints |
|------|-------------|-------|
| `get-balance` | Get vault SOL balance, state, spending policy caps, and program allow/deny lists | Read-only |
| `get-delegate-info` | Get delegate permissions, spending limits, usage count, expiry, status, and vault program policies | Read-only |
| `list-delegates` | List all delegates issued to this agent's keypair, with vault info and program policies | Read-only |
| `transfer-sol` | Execute a SOL transfer from a Fuin vault using delegate permissions. On-chain policy enforcement applies. | Destructive |
| `transfer-spl` | Execute an SPL token transfer from a Fuin vault. Requires CAN_TRANSFER permission. Supports Pyth price feeds for USD valuation. | Destructive |
| `swap` | Execute a token swap on Meteora DLMM from a Fuin vault. Requires CAN_SWAP permission and DLMM program in vault allow-list. | Destructive |
| `request-program` | Request the guardian to add a program to the vault's allow-list. Creates a pending request for guardian review. | — |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DELEGATE_PRIVATE_KEY` | Yes | — | Base58-encoded secret key of the delegate keypair |
| `SOLANA_RPC_URL` | No | `https://api.devnet.solana.com` | Solana RPC endpoint |

## How It Works

Fuin guardians create on-chain vaults (PDAs) and issue delegate keys with bitmask permissions, spending caps, and policy constraints. This MCP server allows AI agents to operate within those constraints — checking balances, inspecting delegate permissions, and executing transfers that are validated on-chain by the Fuin program.

## License

MIT
