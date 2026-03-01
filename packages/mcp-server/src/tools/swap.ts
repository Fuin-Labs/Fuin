import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import type { Config } from "../config.js";

export const swapSchema = {
  guardian: z.string().describe("Guardian wallet public key (base58)"),
  vault_nonce: z.coerce.number().int().describe("Vault nonce"),
  delegate_nonce: z.coerce.number().int().describe("Delegate nonce"),
  pool_address: z
    .string()
    .describe("Meteora DLMM pool address (base58)"),
  input_mint: z
    .string()
    .describe("Mint address of the token to swap FROM (base58)"),
  amount_in: z.coerce
    .number()
    .positive()
    .describe("Amount of input tokens (in raw units / lamports)"),
  max_slippage_bps: z.coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .default(100)
    .describe("Maximum slippage in basis points (default 100 = 1%)"),
  feed_id: z
    .string()
    .describe(
      "Pyth price feed ID hex for the input token (e.g. SOL/USD feed)"
    ),
  feed_account: z
    .string()
    .describe("Pyth price feed account public key (base58)"),
};

const ANCHOR_ERROR_MAP: Record<number, string> = {
  6000: "Vault is frozen. The guardian must unfreeze it before swaps.",
  6001: "Delegate is inactive. The guardian has paused or revoked this delegate key.",
  6002: "Delegate has expired. The validity period has ended.",
  6003: "Permission denied. This delegate does not have swap permissions (CAN_SWAP).",
  6004: "Epoch spending limit exceeded. The delegate has reached its epoch cap.",
  6005: "Per-transaction cap exceeded. The swap amount exceeds the vault's per-tx limit.",
  6006: "Max uses exceeded. The delegate has used all its allowed transactions.",
  6009: "Program not allowed. Meteora DLMM is not in the vault's allow-list.",
};

function parseAnchorError(error: any): string {
  const msg = error?.message ?? String(error);

  const codeMatch = msg.match(/custom program error: 0x([0-9a-fA-F]+)/);
  if (codeMatch) {
    const code = parseInt(codeMatch[1]!, 16);
    if (ANCHOR_ERROR_MAP[code]) {
      return ANCHOR_ERROR_MAP[code]!;
    }
  }

  if (msg.includes("PermissionDenied")) return ANCHOR_ERROR_MAP[6003]!;
  if (msg.includes("ProgramNotAllowed")) return ANCHOR_ERROR_MAP[6009]!;
  if (msg.includes("VaultFrozen")) return ANCHOR_ERROR_MAP[6000]!;
  if (msg.includes("DelegateInactive")) return ANCHOR_ERROR_MAP[6001]!;
  if (msg.includes("DelegateExpired")) return ANCHOR_ERROR_MAP[6002]!;
  if (msg.includes("DailyLimitExceeded")) return ANCHOR_ERROR_MAP[6004]!;
  if (msg.includes("PerTxLimitExceeded")) return ANCHOR_ERROR_MAP[6005]!;
  if (msg.includes("MaxUsesExceeded")) return ANCHOR_ERROR_MAP[6006]!;

  return msg;
}

export async function swap(
  config: Config,
  args: {
    guardian: string;
    vault_nonce: number;
    delegate_nonce: number;
    pool_address: string;
    input_mint: string;
    amount_in: number;
    max_slippage_bps: number;
    feed_id: string;
    feed_account: string;
  }
) {
  const guardian = new PublicKey(args.guardian);
  const poolAddress = new PublicKey(args.pool_address);
  const inputMint = new PublicKey(args.input_mint);
  const feedAccount = new PublicKey(args.feed_account);

  try {
    const result = await config.client.swap(
      guardian,
      args.vault_nonce,
      args.delegate_nonce,
      poolAddress,
      inputMint,
      args.amount_in,
      args.max_slippage_bps,
      config.keypair,
      args.feed_id,
      feedAccount
    );

    const cluster = config.connection.rpcEndpoint.includes("devnet")
      ? "devnet"
      : config.connection.rpcEndpoint.includes("mainnet")
        ? "mainnet-beta"
        : "custom";

    const explorerUrl =
      cluster === "custom"
        ? `https://explorer.solana.com/tx/${result.signature}`
        : `https://explorer.solana.com/tx/${result.signature}?cluster=${cluster}`;

    const text = [
      `Swap successful!`,
      ``,
      `Input: ${args.amount_in} raw units of ${args.input_mint}`,
      `Min output: ${result.quote.minOutAmount.toString()}`,
      `Slippage: ${args.max_slippage_bps} bps`,
      `Pool: ${args.pool_address}`,
      `Transaction: ${result.signature}`,
      `Explorer: ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    const explanation = parseAnchorError(error);
    const text = [
      `Swap failed: ${explanation}`,
      ``,
      `Details:`,
      `  Guardian: ${args.guardian}`,
      `  Vault Nonce: ${args.vault_nonce}`,
      `  Delegate Nonce: ${args.delegate_nonce}`,
      `  Pool: ${args.pool_address}`,
      `  Input Mint: ${args.input_mint}`,
      `  Amount: ${args.amount_in}`,
      `  Slippage: ${args.max_slippage_bps} bps`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }], isError: true };
  }
}
