import { z } from "zod";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import { findDelegatePda, findVaultPda } from "@fuin-labs/sdk";
import type { Config } from "../config.js";
import { resolveContext } from "../resolve.js";
import {
  relayerGet,
  relayerPost,
  formatRelayerError,
  RelayerHttpError,
} from "../relayer-client.js";

export const transferSolSchema = {
  guardian: z.string().optional().describe("Guardian wallet public key (base58). Auto-resolved if omitted."),
  vault_nonce: z.coerce.number().int().optional().describe("Vault nonce. Auto-resolved if omitted."),
  delegate_nonce: z.coerce.number().int().optional().describe("Delegate nonce. Auto-resolved if omitted."),
  destination: z.string().describe("Destination wallet public key (base58)"),
  amount_sol: z.coerce
    .number()
    .positive()
    .describe("Amount of SOL to transfer"),
};

const ANCHOR_ERROR_MAP: Record<number, string> = {
  6000: "Vault is frozen. The guardian must unfreeze it before transfers.",
  6001: "Delegate is inactive. The guardian has paused or revoked this delegate key.",
  6002: "Delegate has expired. The validity period has ended.",
  6003: "Permission denied. This delegate does not have transfer permissions (CAN_TRANSFER).",
  6004: "Epoch spending limit exceeded. The delegate has reached its epoch cap.",
  6005: "Per-transaction cap exceeded. The transfer amount exceeds the vault's per-tx limit.",
  6006: "Max uses exceeded. The delegate has used all its allowed transactions.",
  6007: "Vault epoch spending limit exceeded. The vault has reached its epoch cap.",
  6008: "Insufficient vault balance for this transfer.",
};

function parseAnchorError(error: any): string {
  const msg = error?.message ?? String(error);

  // Try to extract Anchor error code
  const codeMatch = msg.match(/custom program error: 0x([0-9a-fA-F]+)/);
  if (codeMatch) {
    const code = parseInt(codeMatch[1]!, 16);
    if (ANCHOR_ERROR_MAP[code]) {
      return ANCHOR_ERROR_MAP[code]!;
    }
  }

  // Check for named errors in the message
  for (const [, explanation] of Object.entries(ANCHOR_ERROR_MAP)) {
    const errorName = explanation.split(".")[0]!.replace(/ /g, "");
    if (msg.includes(errorName)) {
      return explanation;
    }
  }

  // Check common error patterns
  if (msg.includes("DelegateInactive")) return ANCHOR_ERROR_MAP[6001]!;
  if (msg.includes("DailyLimitExceeded") || msg.includes("EpochLimitExceeded")) return ANCHOR_ERROR_MAP[6004]!;
  if (msg.includes("PermissionDenied")) return ANCHOR_ERROR_MAP[6003]!;
  if (msg.includes("VaultFrozen")) return ANCHOR_ERROR_MAP[6000]!;
  if (msg.includes("DelegateExpired")) return ANCHOR_ERROR_MAP[6002]!;
  if (msg.includes("MaxUsesExceeded")) return ANCHOR_ERROR_MAP[6006]!;
  if (msg.includes("PerTxCapExceeded")) return ANCHOR_ERROR_MAP[6005]!;
  if (msg.includes("InsufficientBalance")) return ANCHOR_ERROR_MAP[6008]!;

  return msg;
}

interface PaymasterInfo {
  feePayer: string;
  programId: string;
  cluster: "devnet" | "mainnet-beta" | "custom";
}

// Module-level cache: the paymaster pubkey is fixed for the relayer's lifetime,
// so we fetch it once on first use.
let cachedPaymaster: PublicKey | null = null;

async function getPaymaster(config: Config): Promise<PublicKey> {
  if (cachedPaymaster) return cachedPaymaster;
  const info = await relayerGet<PaymasterInfo>(config.relayerUrl, "/paymaster/info");
  cachedPaymaster = new PublicKey(info.feePayer);
  return cachedPaymaster;
}

export async function transferSol(
  config: Config,
  args: {
    guardian?: string;
    vault_nonce?: number;
    delegate_nonce?: number;
    destination: string;
    amount_sol: number;
  }
) {
  const destination = new PublicKey(args.destination);

  let ctx;
  try {
    ctx = await resolveContext(config, args);
  } catch (error: any) {
    return { content: [{ type: "text" as const, text: error.message }], isError: true };
  }

  let paymaster: PublicKey;
  try {
    paymaster = await getPaymaster(config);
  } catch (error: any) {
    const text = `Failed to fetch paymaster info from relayer: ${formatRelayerError(error)}`;
    return { content: [{ type: "text" as const, text }], isError: true };
  }

  try {
    const bnVaultNonce = new BN(ctx.vaultNonce);
    const bnDelegateNonce = new BN(ctx.delegateNonce);
    const [vaultPda] = findVaultPda(
      ctx.guardian,
      bnVaultNonce,
      config.client.program.programId
    );
    const [delegatePda] = findDelegatePda(
      vaultPda,
      bnDelegateNonce,
      config.client.program.programId
    );

    const amountLamports = new BN(Math.round(args.amount_sol * 1_000_000_000));

    const ix = await config.client.program.methods
      .executeTransfer!(bnVaultNonce, bnDelegateNonce, amountLamports)
      .accounts({
        relayer: paymaster,
        delegateKey: config.keypair.publicKey,
        guardian: ctx.guardian,
        vault: vaultPda,
        delegate: delegatePda,
        destination,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = paymaster;
    const { blockhash } = await config.connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;

    // Session key partial-signs; relayer will add the paymaster signature.
    tx.partialSign(config.keypair);

    const serializedTx = tx
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    const { sig: txSig } = await relayerPost<{ sig: string }>(
      config.relayerUrl,
      "/paymaster/sign-and-submit",
      { serializedTx }
    );

    const cluster = config.connection.rpcEndpoint.includes("devnet")
      ? "devnet"
      : config.connection.rpcEndpoint.includes("mainnet")
        ? "mainnet-beta"
        : "custom";

    const explorerUrl =
      cluster === "custom"
        ? `https://explorer.solana.com/tx/${txSig}`
        : `https://explorer.solana.com/tx/${txSig}?cluster=${cluster}`;

    const text = [
      `Transfer successful!`,
      ``,
      `Amount: ${args.amount_sol} SOL`,
      `Destination: ${args.destination}`,
      `Fee payer (paymaster): ${paymaster.toBase58()}`,
      `Session key: ${config.keypair.publicKey.toBase58()}`,
      `Transaction: ${txSig}`,
      `Explorer: ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    // Surface relayer-side rejections distinctly from anchor errors.
    const explanation =
      error instanceof RelayerHttpError
        ? formatRelayerError(error)
        : parseAnchorError(error);

    const text = [
      `Transfer failed: ${explanation}`,
      ``,
      `Details:`,
      `  Guardian: ${ctx.guardian.toBase58()}`,
      `  Vault Nonce: ${ctx.vaultNonce}`,
      `  Delegate Nonce: ${ctx.delegateNonce}`,
      `  Destination: ${args.destination}`,
      `  Amount: ${args.amount_sol} SOL`,
      `  Fee payer (paymaster): ${paymaster.toBase58()}`,
      `  Session key: ${config.keypair.publicKey.toBase58()}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }], isError: true };
  }
}
