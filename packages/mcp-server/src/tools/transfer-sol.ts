import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import type { Config } from "../config.js";

export const transferSolSchema = {
  guardian: z.string().describe("Guardian wallet public key (base58)"),
  vault_nonce: z.number().int().describe("Vault nonce"),
  delegate_nonce: z.number().int().describe("Delegate nonce"),
  destination: z.string().describe("Destination wallet public key (base58)"),
  amount_sol: z
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

export async function transferSol(
  config: Config,
  args: {
    guardian: string;
    vault_nonce: number;
    delegate_nonce: number;
    destination: string;
    amount_sol: number;
  }
) {
  const guardian = new PublicKey(args.guardian);
  const destination = new PublicKey(args.destination);

  try {
    const txSig = await config.client.transferSol(
      guardian,
      args.vault_nonce,
      args.delegate_nonce,
      destination,
      args.amount_sol,
      config.keypair
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
      `Transaction: ${txSig}`,
      `Explorer: ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    const explanation = parseAnchorError(error);
    const text = [
      `Transfer failed: ${explanation}`,
      ``,
      `Details:`,
      `  Guardian: ${args.guardian}`,
      `  Vault Nonce: ${args.vault_nonce}`,
      `  Delegate Nonce: ${args.delegate_nonce}`,
      `  Destination: ${args.destination}`,
      `  Amount: ${args.amount_sol} SOL`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }], isError: true };
  }
}
