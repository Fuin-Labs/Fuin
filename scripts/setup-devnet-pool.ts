/**
 * Setup script for creating a Meteora DLMM pool on devnet with test tokens.
 *
 * Usage:
 *   npx tsx scripts/setup-devnet-pool.ts
 *
 * Prerequisites:
 *   - Solana CLI configured for devnet with a funded wallet
 *   - `solana config set --url devnet`
 *
 * This script:
 *   1. Creates two SPL token mints (TOKEN_A, TOKEN_B)
 *   2. Mints tokens to the payer
 *   3. Creates a Meteora DLMM pool
 *   4. Seeds liquidity into the pool
 *   5. Creates vault ATAs for both tokens and funds them
 *   6. Outputs all addresses as JSON
 */

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "bn.js";
import DLMM from "@meteora-ag/dlmm";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const METEORA_DLMM_PROGRAM = new PublicKey(
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
);

// Pool parameters
const BIN_STEP = 10; // 0.1% per bin
const TOKEN_DECIMALS = 9;
const INITIAL_MINT_AMOUNT = 1_000_000 * 10 ** TOKEN_DECIMALS; // 1M tokens each
const VAULT_FUND_AMOUNT = 100_000 * 10 ** TOKEN_DECIMALS; // 100K tokens to vault

async function loadKeypair(): Promise<Keypair> {
  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const raw = fs.readFileSync(keypairPath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  const connection = new Connection(DEVNET_URL, "confirmed");
  const payer = await loadKeypair();

  console.log("Payer:", payer.publicKey.toBase58());
  const balance = await connection.getBalance(payer.publicKey);
  console.log("Balance:", balance / 1e9, "SOL");

  if (balance < 2 * 1e9) {
    console.error("Need at least 2 SOL on devnet. Run: solana airdrop 2");
    process.exit(1);
  }

  // 1. Create two SPL token mints
  console.log("\n--- Creating token mints ---");

  const mintA = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    TOKEN_DECIMALS
  );
  console.log("Token A mint:", mintA.toBase58());

  const mintB = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    TOKEN_DECIMALS
  );
  console.log("Token B mint:", mintB.toBase58());

  // Sort mints — Meteora requires tokenX < tokenY by pubkey
  const [tokenX, tokenY] =
    mintA.toBuffer().compare(mintB.toBuffer()) < 0
      ? [mintA, mintB]
      : [mintB, mintA];
  console.log("Token X (lower):", tokenX.toBase58());
  console.log("Token Y (higher):", tokenY.toBase58());

  // 2. Create ATAs and mint tokens to payer
  console.log("\n--- Minting tokens to payer ---");

  const payerAtaX = await createAssociatedTokenAccount(
    connection,
    payer,
    tokenX,
    payer.publicKey
  );
  const payerAtaY = await createAssociatedTokenAccount(
    connection,
    payer,
    tokenY,
    payer.publicKey
  );

  await mintTo(
    connection,
    payer,
    tokenX,
    payerAtaX,
    payer,
    BigInt(INITIAL_MINT_AMOUNT)
  );
  await mintTo(
    connection,
    payer,
    tokenY,
    payerAtaY,
    payer,
    BigInt(INITIAL_MINT_AMOUNT)
  );
  console.log("Minted", INITIAL_MINT_AMOUNT / 10 ** TOKEN_DECIMALS, "of each token to payer");

  // 3. Create Meteora DLMM pool
  console.log("\n--- Creating DLMM pool ---");

  // Use DLMM SDK to create pool
  // The active bin price is set to 1:1 (activeId = 0)
  const createPoolTx = await DLMM.createPermissionlessLbPair(
    connection,
    BIN_STEP,
    tokenX,
    tokenY,
    new BN(0), // activeId — 1:1 price
    payer.publicKey,
    {
      cluster: "devnet",
    }
  );

  // The pool address is typically the first account in the first instruction
  // but let's derive it after sending
  const txSig = await sendAndConfirmTransaction(
    connection,
    createPoolTx,
    [payer],
    { commitment: "confirmed" }
  );
  console.log("Pool creation tx:", txSig);

  // Find the pool by looking up all DLMM pairs for our token pair
  const { lbPairs } = await DLMM.getLbPairs(connection, {
    tokenXMint: tokenX,
    tokenYMint: tokenY,
  });

  if (lbPairs.length === 0) {
    console.error("Failed to find created pool");
    process.exit(1);
  }

  const poolAddress = lbPairs[0]!.publicKey;
  console.log("Pool address:", poolAddress.toBase58());

  // 4. Add liquidity
  console.log("\n--- Adding liquidity ---");

  const dlmmPool = await DLMM.create(connection, poolAddress);
  const activeBin = await dlmmPool.getActiveBin();
  console.log("Active bin ID:", activeBin.binId);

  const TOTAL_RANGE_BIN_COUNT = 20; // 10 bins each side
  const liquidityAmount = new BN(500_000 * 10 ** TOKEN_DECIMALS);

  const addLiqTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
    positionPubKey: Keypair.generate().publicKey,
    user: payer.publicKey,
    totalXAmount: liquidityAmount,
    totalYAmount: liquidityAmount,
    strategy: {
      maxBinId: activeBin.binId + TOTAL_RANGE_BIN_COUNT / 2,
      minBinId: activeBin.binId - TOTAL_RANGE_BIN_COUNT / 2,
      strategyType: 0, // Spot — uniform distribution
    },
  });

  // addLiqTx may be a Transaction or array of Transactions
  const txs = Array.isArray(addLiqTx) ? addLiqTx : [addLiqTx];
  for (const t of txs) {
    const sig = await sendAndConfirmTransaction(connection, t, [payer], {
      commitment: "confirmed",
    });
    console.log("Liquidity tx:", sig);
  }

  // 5. Create vault ATAs and fund them
  console.log("\n--- Setting up vault ATAs ---");

  // Prompt: provide vault PDA or derive from known guardian + nonce
  // For this script, we just output the mint addresses.
  // The vault ATAs need to be created after the vault is created.
  const vaultAtaX = getAssociatedTokenAddressSync(tokenX, payer.publicKey, true);
  const vaultAtaY = getAssociatedTokenAddressSync(tokenY, payer.publicKey, true);

  // 6. Output
  const output = {
    tokenXMint: tokenX.toBase58(),
    tokenYMint: tokenY.toBase58(),
    poolAddress: poolAddress.toBase58(),
    binStep: BIN_STEP,
    payerAtaX: payerAtaX.toBase58(),
    payerAtaY: payerAtaY.toBase58(),
    meteoraDlmmProgram: METEORA_DLMM_PROGRAM.toBase58(),
  };

  console.log("\n--- Output ---");
  console.log(JSON.stringify(output, null, 2));

  // Save to file
  const outputPath = path.join(__dirname, "devnet-pool.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log("\nSaved to:", outputPath);

  console.log("\n--- Next steps ---");
  console.log("1. Create a vault with CAN_SWAP permission");
  console.log("2. Create vault ATAs for both tokens:");
  console.log(`   spl-token create-account ${tokenX.toBase58()} --owner <VAULT_PDA>`);
  console.log(`   spl-token create-account ${tokenY.toBase58()} --owner <VAULT_PDA>`);
  console.log("3. Fund the vault ATAs with test tokens");
  console.log("4. Add Meteora DLMM program to vault allow list");
  console.log("5. Execute swap via SDK");
}

main().catch(console.error);
