#!/usr/bin/env npx tsx
/**
 * End-to-end test for the MCP server tools against localnet.
 *
 * Steps:
 * 1. Create a guardian wallet + fund it
 * 2. Create a vault (nonce=1)
 * 3. Fund the vault
 * 4. Issue a delegate to an agent keypair
 * 5. Test each MCP tool function directly
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { FuinClient, findVaultPda, findDelegatePda, CAN_TRANSFER } from "@fuin/sdk";
import bs58 from "bs58";

// MCP tool functions
import { getBalance } from "./src/tools/get-balance.js";
import { getDelegateInfo } from "./src/tools/get-delegate-info.js";
import { listDelegates } from "./src/tools/list-delegates.js";
import { transferSol } from "./src/tools/transfer-sol.js";
import type { Config } from "./src/config.js";

const RPC = "http://127.0.0.1:8899";

async function airdrop(connection: Connection, pubkey: PublicKey, sol: number) {
  const sig = await connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, "confirmed");
}

async function main() {
  const connection = new Connection(RPC, "confirmed");

  // --- Setup: Guardian ---
  const guardian = Keypair.generate();
  console.log(`Guardian: ${guardian.publicKey.toBase58()}`);
  await airdrop(connection, guardian.publicKey, 10);
  console.log("  Airdropped 10 SOL to guardian");

  const guardianWallet = new anchor.Wallet(guardian);
  const guardianClient = new FuinClient(connection, guardianWallet);

  // --- Setup: Create Vault ---
  const vaultNonce = 1;
  const { vault: vaultPda } = await guardianClient.createVault(vaultNonce, 5, 2);
  console.log(`Vault PDA: ${vaultPda.toBase58()}`);

  // --- Setup: Fund Vault ---
  const fundTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: guardian.publicKey,
      toPubkey: vaultPda,
      lamports: 3 * LAMPORTS_PER_SOL,
    })
  );
  await sendAndConfirmTransaction(connection, fundTx, [guardian]);
  console.log("  Funded vault with 3 SOL");

  // --- Setup: Agent Keypair ---
  const agent = Keypair.generate();
  console.log(`Agent: ${agent.publicKey.toBase58()}`);
  await airdrop(connection, agent.publicKey, 1); // for tx fees
  console.log("  Airdropped 1 SOL to agent (for fees)");

  // --- Setup: Issue Delegate ---
  const delegateNonce = 1;
  const { delegate: delegatePda } = await guardianClient.issueDelegate(
    vaultNonce,
    delegateNonce,
    agent.publicKey,
    CAN_TRANSFER, // permission bitmask
    2,            // daily limit SOL
    100,          // max uses
    86400         // validity 1 day
  );
  console.log(`Delegate PDA: ${delegatePda.toBase58()}`);

  // --- Build MCP Config (as agent) ---
  const agentWallet = new anchor.Wallet(agent);
  const agentClient = new FuinClient(connection, agentWallet);
  const config: Config = {
    keypair: agent,
    connection,
    client: agentClient,
  };

  console.log("\n=== Testing MCP Tools ===\n");

  // --- Test 1: list-delegates ---
  console.log("--- list-delegates ---");
  const listResult = await listDelegates(config);
  console.log(listResult.content[0]!.text);

  // --- Test 2: get-balance ---
  console.log("\n--- get-balance ---");
  const balanceResult = await getBalance(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
  });
  console.log(balanceResult.content[0]!.text);

  // --- Test 3: get-delegate-info ---
  console.log("\n--- get-delegate-info ---");
  const infoResult = await getDelegateInfo(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
    delegate_nonce: delegateNonce,
  });
  console.log(infoResult.content[0]!.text);

  // --- Test 4: transfer-sol ---
  const destination = Keypair.generate().publicKey;
  console.log(`\n--- transfer-sol (0.5 SOL → ${destination.toBase58()}) ---`);
  const txResult = await transferSol(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
    delegate_nonce: delegateNonce,
    destination: destination.toBase58(),
    amount_sol: 0.5,
  });
  console.log(txResult.content[0]!.text);

  // --- Test 5: get-balance after transfer ---
  console.log("\n--- get-balance (after transfer) ---");
  const balanceAfter = await getBalance(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
  });
  console.log(balanceAfter.content[0]!.text);

  // --- Test 6: get-delegate-info after transfer (should show spent) ---
  console.log("\n--- get-delegate-info (after transfer) ---");
  const infoAfter = await getDelegateInfo(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
    delegate_nonce: delegateNonce,
  });
  console.log(infoAfter.content[0]!.text);

  // --- Test 7: transfer exceeding per-tx cap (should fail) ---
  console.log("\n--- transfer-sol (3 SOL, should fail per-tx cap) ---");
  const failResult = await transferSol(config, {
    guardian: guardian.publicKey.toBase58(),
    vault_nonce: vaultNonce,
    delegate_nonce: delegateNonce,
    destination: destination.toBase58(),
    amount_sol: 3,
  });
  console.log(failResult.content[0]!.text);

  // Verify destination got funds
  const destBalance = await connection.getBalance(destination);
  console.log(`\nDestination balance: ${destBalance / LAMPORTS_PER_SOL} SOL`);

  console.log("\n=== All tests complete ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
