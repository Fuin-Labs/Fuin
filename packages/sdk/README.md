# @fuin/sdk

TypeScript SDK for [Fuin](https://github.com/jayanth-kumar-morem/fuin) — a programmable authorization layer (IAM) on Solana. Create vaults, issue delegate keys with scoped permissions, and execute policy-constrained transfers.

## Install

```bash
npm install @fuin/sdk
```

## Usage

```typescript
import { FuinClient, findVaultPda, findDelegatePda, CAN_TRANSFER, CAN_SWAP } from "@fuin/sdk";
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const client = new FuinClient(connection, wallet);

// Create a vault
const { vault } = await client.createVault(1, 10, 1); // nonce, dailyCapSOL, perTxCapSOL

// Issue a delegate key with transfer permission
const { delegate } = await client.issueDelegate(
  1,            // vault nonce
  1,            // delegate nonce
  agentPubkey,  // delegate's public key
  CAN_TRANSFER, // permissions bitmask
  5,            // daily limit in SOL
  100,          // max uses
  86400         // validity in seconds
);

// Execute a transfer as delegate
const sig = await client.transferSol(guardian, 1, 1, destination, 0.5, delegateKeypair);
```

## API

### PDA Helpers

- `findVaultPda(guardian, nonce, programId?)` — derive vault PDA
- `findDelegatePda(vault, nonce, programId?)` — derive delegate PDA

### Permission Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `CAN_SWAP` | 1 | Allow token swaps |
| `CAN_TRANSFER` | 2 | Allow SOL/SPL transfers |
| `CAN_STAKE` | 4 | Allow staking |
| `CAN_LP` | 8 | Allow LP operations |

### FuinClient Methods

| Method | Role | Description |
|--------|------|-------------|
| `createVault` | Guardian | Initialize a new vault PDA |
| `issueDelegate` | Guardian | Issue a delegate key with permissions |
| `transferSol` | Agent | Execute SOL transfer (keypair signer) |
| `transferSolWallet` | Agent | Execute SOL transfer (wallet adapter) |
| `transferSpl` | Agent | Execute SPL token transfer |
| `freezeVault` | Guardian | Freeze vault (block all delegate actions) |
| `unfreezeVault` | Guardian | Unfreeze vault |
| `delegateControl` | Guardian | Revoke (0), Pause (1), or Resume (2) a delegate |
| `updateVault` | Guardian | Update vault spending caps |
| `withdraw` | Guardian | Withdraw SOL from vault |

## License

MIT
