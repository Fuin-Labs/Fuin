#!/usr/bin/env npx tsx
/**
 * Sets up on-chain state for testing the MCP server on localnet.
 * Outputs the delegate private key and guardian pubkey needed for config.
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { FuinClient, CAN_TRANSFER } from "@fuin-labs/sdk";
import bs58 from "bs58";

const RPC = "http://127.0.0.1:8899";

async function main() {
  const connection = new Connection(RPC, "confirmed");

  // Create guardian
  const guardian = Keypair.generate();
  const airdropSig = await connection.requestAirdrop(guardian.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSig, "confirmed");

  const guardianWallet = new anchor.Wallet(guardian);
  const client = new FuinClient(connection, guardianWallet);

  // Create vault
  const { vault: vaultPda } = await client.createVault(1, 5, 2);

  // Fund vault with 3 SOL
  const fundTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: guardian.publicKey,
      toPubkey: vaultPda,
      lamports: 3 * LAMPORTS_PER_SOL,
    })
  );
  await sendAndConfirmTransaction(connection, fundTx, [guardian]);

  // Create agent keypair and airdrop for fees
  const agent = Keypair.generate();
  const agentAirdrop = await connection.requestAirdrop(agent.publicKey, 1 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(agentAirdrop, "confirmed");

  // Issue delegate
  await client.issueDelegate(1, 1, agent.publicKey, CAN_TRANSFER, 2, 100, 86400);

  // Output
  const agentKey = bs58.encode(agent.secretKey);

  console.log("=== Localnet Setup Complete ===\n");
  console.log(`Guardian:    ${guardian.publicKey.toBase58()}`);
  console.log(`Vault PDA:   ${vaultPda.toBase58()}`);
  console.log(`Vault Balance: 3 SOL`);
  console.log(`Agent:       ${agent.publicKey.toBase58()}`);
  console.log(`Delegate:    vault_nonce=1, delegate_nonce=1`);
  console.log(`Permissions: Transfer | Epoch Limit: 2 SOL | Per-Tx: 2 SOL | Max Uses: 100`);
  console.log(`\n--- Copy these for MCP config ---\n`);
  console.log(`DELEGATE_PRIVATE_KEY=${agentKey}`);
  console.log(`GUARDIAN_PUBKEY=${guardian.publicKey.toBase58()}`);
  console.log(`SOLANA_RPC_URL=http://127.0.0.1:8899`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
