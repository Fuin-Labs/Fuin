import { z } from "zod";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { findVaultPda, findDelegatePda, CAN_SWAP, CAN_TRANSFER, CAN_STAKE, CAN_LP } from "@fuin/sdk";
import { fetchDelegateByPda } from "../accounts.js";
import type { Config } from "../config.js";

export const getDelegateInfoSchema = {
  guardian: z.string().describe("Guardian wallet public key (base58)"),
  vault_nonce: z.coerce.number().int().describe("Vault nonce"),
  delegate_nonce: z.coerce.number().int().describe("Delegate nonce"),
};

function formatPermissions(perms: number): string {
  const flags: string[] = [];
  if (perms & CAN_SWAP) flags.push("Swap");
  if (perms & CAN_TRANSFER) flags.push("Transfer");
  if (perms & CAN_STAKE) flags.push("Stake");
  if (perms & CAN_LP) flags.push("LP");
  return flags.length > 0 ? flags.join(", ") : "None";
}

export async function getDelegateInfo(
  config: Config,
  args: { guardian: string; vault_nonce: number; delegate_nonce: number }
) {
  const guardian = new PublicKey(args.guardian);
  const vaultNonce = new BN(args.vault_nonce);
  const delegateNonce = new BN(args.delegate_nonce);

  const [vaultPda] = findVaultPda(guardian, vaultNonce, config.client.program.programId);
  const [delegatePda] = findDelegatePda(vaultPda, delegateNonce, config.client.program.programId);

  const delegate = await fetchDelegateByPda(config.client.program, delegatePda);

  if (!delegate) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No delegate found at PDA: ${delegatePda.toBase58()}\nVault: ${vaultPda.toBase58()}\nGuardian: ${args.guardian}, Vault Nonce: ${args.vault_nonce}, Delegate Nonce: ${args.delegate_nonce}`,
        },
      ],
    };
  }

  const d = delegate.account;
  const dailyLimit = d.dailyLimit.toNumber() / LAMPORTS_PER_SOL;
  const dailySpent = d.dailySpent.toNumber() / LAMPORTS_PER_SOL;
  const expiry = d.expiry.toNumber();
  const now = Math.floor(Date.now() / 1000);
  const expired = expiry > 0 && expiry < now;

  const text = [
    `Delegate: ${delegatePda.toBase58()}`,
    `Vault: ${d.vault.toBase58()}`,
    `Authority: ${d.authority.toBase58()}`,
    `Nonce: ${d.nonce.toNumber()}`,
    ``,
    `Status: ${d.isActive ? (expired ? "Expired" : "Active") : "Inactive (Paused/Revoked)"}`,
    `Permissions: ${formatPermissions(d.permissions)} (bitmask: ${d.permissions})`,
    ``,
    `Spending:`,
    `  Epoch Limit: ${dailyLimit} SOL`,
    `  Spent This Epoch: ${dailySpent} SOL`,
    `  Remaining: ${Math.max(0, dailyLimit - dailySpent)} SOL`,
    `  Last Reset Epoch: ${d.lastResetEpoch.toNumber()}`,
    ``,
    `Usage:`,
    `  Uses: ${d.uses}${d.maxUses > 0 ? ` / ${d.maxUses}` : " (unlimited)"}`,
    `  Expiry: ${expiry === 0 ? "None" : new Date(expiry * 1000).toISOString()}${expired ? " (EXPIRED)" : ""}`,
  ].join("\n");

  return { content: [{ type: "text" as const, text }] };
}
