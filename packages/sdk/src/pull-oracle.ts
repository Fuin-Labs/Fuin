/**
 * Pyth Pull Oracle helpers for SPL token transfers.
 *
 * This file is intentionally NOT exported from the SDK barrel (index.ts)
 * because @pythnetwork/pyth-solana-receiver transitively pulls in jito-ts
 * and an old @solana/web3.js that breaks Next.js / Turbopack bundling.
 *
 * Import directly: import { transferSplPull } from "@fuin-labs/sdk/src/pull-oracle"
 */

import { HermesClient } from "@pythnetwork/hermes-client";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import {
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import type { Signer } from "@solana/web3.js";
import { BN } from "bn.js";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { FuinClient, HERMES_ENDPOINT, PYTH_SOL_FEED_ID } from "./client";
import { findVaultPda, findDelegatePda } from "./pda";

/**
 * SPL transfer using Pyth Pull Oracle. Fetches a fresh price update from
 * Hermes, posts it on-chain via PythSolanaReceiver, then executes the
 * SPL transfer referencing the ephemeral PriceUpdateV2 account.
 */
export async function transferSplPull(
  client: FuinClient,
  guardian: PublicKey,
  vaultNonce: number,
  delegateNonce: number,
  mint: PublicKey,
  destination: PublicKey,
  amountTokens: number,
  signer: Keypair,
  feedId: string = PYTH_SOL_FEED_ID,
): Promise<string> {
  // 1. Fetch latest price update VAA from Hermes
  const hermes = new HermesClient(HERMES_ENDPOINT);
  const priceUpdate = await hermes.getLatestPriceUpdates([feedId], { encoding: "base64" });
  const priceUpdateData = priceUpdate.binary.data;

  // 2. Build an inline wallet adapter from the Keypair
  const wallet = {
    publicKey: signer.publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      if (tx instanceof Transaction) {
        tx.partialSign(signer);
      } else {
        (tx as VersionedTransaction).sign([signer]);
      }
      return tx;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      for (const tx of txs) {
        if (tx instanceof Transaction) {
          tx.partialSign(signer);
        } else {
          (tx as VersionedTransaction).sign([signer]);
        }
      }
      return txs;
    },
  };

  const pythSolanaReceiver = new PythSolanaReceiver({
    connection: client.connection,
    wallet: wallet as any,
  });

  // 3. Build post + close instructions for the price update
  const { postInstructions, priceFeedIdToPriceUpdateAccount, closeInstructions } =
    await pythSolanaReceiver.buildPostPriceUpdateInstructions(priceUpdateData);

  // Resolve the ephemeral price account for this feed
  // PythSolanaReceiver stores keys with "0x" prefix
  const normalizedFeedId = feedId.startsWith("0x") ? feedId : `0x${feedId}`;
  const priceAccountPubkey = priceFeedIdToPriceUpdateAccount[normalizedFeedId];
  if (!priceAccountPubkey) {
    throw new Error(`No price update account returned for feed ${feedId}`);
  }

  // 4. Build the SPL transfer instruction (without sending)
  const bnVaultNonce = new BN(vaultNonce);
  const bnDelegateNonce = new BN(delegateNonce);
  const [vaultPda] = findVaultPda(guardian, bnVaultNonce, client.program.programId);
  const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, client.program.programId);

  // Detect whether the mint belongs to Token-2022 or standard SPL Token
  const mintAccountInfo = await client.connection.getAccountInfo(mint);
  if (!mintAccountInfo) {
    throw new Error(`Mint account ${mint.toBase58()} not found`);
  }
  const tokenProgramId = mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
    ? TOKEN_2022_PROGRAM_ID
    : TOKEN_PROGRAM_ID;

  const vaultAta = getAssociatedTokenAddressSync(mint, vaultPda, true, tokenProgramId);
  const destAta = getAssociatedTokenAddressSync(mint, destination, true, tokenProgramId);

  const createDestAtaIx = createAssociatedTokenAccountIdempotentInstruction(
    signer.publicKey,
    destAta,
    destination,
    mint,
    tokenProgramId,
  );

  const splTransferIx = await client.program.methods
    .executeSplTransfer!(bnVaultNonce, bnDelegateNonce, new BN(amountTokens), feedId)
    .accounts({
      relayer: signer.publicKey,
      delegateKey: signer.publicKey,
      guardian: guardian,
      vault: vaultPda,
      delegate: delegatePda,
      vaultTokenAccount: vaultAta,
      destinationTokenAccount: destAta,
      mint: mint,
      tokenProgram: tokenProgramId,
      priceUpdate: priceAccountPubkey,
    })
    .instruction();

  // 5. Combine: post price -> create ATA + SPL transfer -> close price account
  const consumerIxs = [
    { instruction: createDestAtaIx, signers: [] as Signer[] },
    { instruction: splTransferIx, signers: [] as Signer[] },
  ];

  const allInstructions = [...postInstructions, ...consumerIxs, ...closeInstructions];

  // 6. Batch into versioned transactions
  const txBatches = await pythSolanaReceiver.batchIntoVersionedTransactions(
    allInstructions,
    { computeUnitPriceMicroLamports: 50_000 },
  );

  // 7. Sign and send each transaction sequentially
  let lastSig = "";
  for (const { tx, signers: batchSigners } of txBatches) {
    tx.sign([signer, ...batchSigners]);
    const sig = await client.connection.sendTransaction(tx);
    await client.connection.confirmTransaction(sig, "confirmed");
    lastSig = sig;
  }

  return lastSig;
}
