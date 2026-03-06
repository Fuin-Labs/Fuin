import { z } from "zod";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { findVaultPda, findDelegatePda, CAN_SWAP, CAN_TRANSFER, CAN_STAKE, CAN_LP } from "@fuin-labs/sdk";
import { fetchDelegateByPda, fetchVaultByPda } from "../accounts.js";
import { resolveContext } from "../resolve.js";
import type { Config } from "../config.js";

export const getDelegateInfoSchema = {
  guardian: z.string().optional().describe("Guardian wallet public key (base58). Auto-resolved if omitted."),
  vault_nonce: z.coerce.number().int().optional().describe("Vault nonce. Auto-resolved if omitted."),
  delegate_nonce: z.coerce.number().int().optional().describe("Delegate nonce. Auto-resolved if omitted."),
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
  args: { guardian?: string; vault_nonce?: number; delegate_nonce?: number }
) {
  let ctx;
  try {
    ctx = await resolveContext(config, args);
  } catch (error: any) {
    return { content: [{ type: "text" as const, text: error.message }], isError: true };
  }

  const vaultNonce = new BN(ctx.vaultNonce);
  const delegateNonce = new BN(ctx.delegateNonce);

  const [vaultPda] = findVaultPda(ctx.guardian, vaultNonce, config.client.program.programId);
  const [delegatePda] = findDelegatePda(vaultPda, delegateNonce, config.client.program.programId);

  const delegate = await fetchDelegateByPda(config.client.program, delegatePda);

  if (!delegate) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No delegate found at PDA: ${delegatePda.toBase58()}\nVault: ${vaultPda.toBase58()}\nGuardian: ${ctx.guardian.toBase58()}, Vault Nonce: ${ctx.vaultNonce}, Delegate Nonce: ${ctx.delegateNonce}`,
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

  const lines = [
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
  ];

  // Fetch vault to show program policies
  const vault = await fetchVaultByPda(
    config.client.program,
    config.connection,
    d.vault
  );
  if (vault) {
    const allowList = vault.account.policies.programs.allowList;
    const denyList = vault.account.policies.programs.denyList;
    if (allowList.length > 0 || denyList.length > 0) {
      lines.push(``, `Vault Program Policy:`);
      if (allowList.length > 0) {
        lines.push(`  Allowed Programs (${allowList.length}):`);
        for (const pk of allowList) lines.push(`    - ${pk.toBase58()}`);
      }
      if (denyList.length > 0) {
        lines.push(`  Denied Programs (${denyList.length}):`);
        for (const pk of denyList) lines.push(`    - ${pk.toBase58()}`);
      }
    }
  }

  const text = lines.join("\n");

  return { content: [{ type: "text" as const, text }] };
}
