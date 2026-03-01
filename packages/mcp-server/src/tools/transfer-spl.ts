import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { PYTH_FEED_IDS } from "@fuin-labs/sdk";
import { transferSplPull } from "@fuin-labs/sdk/src/pull-oracle";
import type { Config } from "../config.js";

const feedNames = Object.keys(PYTH_FEED_IDS);

export const transferSplSchema = {
  guardian: z.string().describe("Guardian wallet public key (base58)"),
  vault_nonce: z.coerce.number().int().describe("Vault nonce"),
  delegate_nonce: z.coerce.number().int().describe("Delegate nonce"),
  mint: z.string().describe("SPL token mint address (base58)"),
  destination: z.string().describe("Destination wallet public key (base58)"),
  amount: z.coerce
    .number()
    .positive()
    .describe("Amount of tokens to transfer (in smallest unit, e.g. lamports for wrapped SOL)"),
  price_feed: z
    .string()
    .optional()
    .describe(
      `Pyth price feed name for USD valuation. Available: ${feedNames.join(", ")}. Defaults to SOL/USD.`
    ),
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
  6008: "Insufficient vault token balance for this transfer.",
  6009: "Mint mismatch between vault token account and provided mint.",
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

  if (msg.includes("DelegateInactive")) return ANCHOR_ERROR_MAP[6001]!;
  if (msg.includes("DailyLimitExceeded") || msg.includes("EpochLimitExceeded")) return ANCHOR_ERROR_MAP[6004]!;
  if (msg.includes("PermissionDenied")) return ANCHOR_ERROR_MAP[6003]!;
  if (msg.includes("VaultFrozen")) return ANCHOR_ERROR_MAP[6000]!;
  if (msg.includes("DelegateExpired")) return ANCHOR_ERROR_MAP[6002]!;
  if (msg.includes("MaxUsesExceeded")) return ANCHOR_ERROR_MAP[6006]!;
  if (msg.includes("PerTxCapExceeded") || msg.includes("PerTxLimitExceeded")) return ANCHOR_ERROR_MAP[6005]!;
  if (msg.includes("MintMismatch")) return ANCHOR_ERROR_MAP[6009]!;

  return msg;
}

export async function transferSpl(
  config: Config,
  args: {
    guardian: string;
    vault_nonce: number;
    delegate_nonce: number;
    mint: string;
    destination: string;
    amount: number;
    price_feed?: string;
  }
) {
  const guardian = new PublicKey(args.guardian);
  const mint = new PublicKey(args.mint);
  const destination = new PublicKey(args.destination);

  const feedName = args.price_feed || "SOL/USD";
  const feedId = PYTH_FEED_IDS[feedName];
  if (!feedId) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Unknown price feed "${feedName}". Available: ${feedNames.join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const txSig = await transferSplPull(
      config.client,
      guardian,
      args.vault_nonce,
      args.delegate_nonce,
      mint,
      destination,
      args.amount,
      config.keypair,
      feedId,
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
      `SPL transfer successful!`,
      ``,
      `Mint: ${args.mint}`,
      `Amount: ${args.amount}`,
      `Destination: ${args.destination}`,
      `Price Feed: ${feedName}`,
      `Transaction: ${txSig}`,
      `Explorer: ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    const explanation = parseAnchorError(error);
    const text = [
      `SPL transfer failed: ${explanation}`,
      ``,
      `Details:`,
      `  Guardian: ${args.guardian}`,
      `  Vault Nonce: ${args.vault_nonce}`,
      `  Delegate Nonce: ${args.delegate_nonce}`,
      `  Mint: ${args.mint}`,
      `  Destination: ${args.destination}`,
      `  Amount: ${args.amount}`,
      `  Price Feed: ${feedName}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }], isError: true };
  }
}
