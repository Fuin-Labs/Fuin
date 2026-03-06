import { z } from "zod";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { findVaultPda } from "@fuin-labs/sdk";
import { fetchVaultByPda } from "../accounts.js";
import { resolveContext } from "../resolve.js";
import type { Config } from "../config.js";

export const getBalanceSchema = {
  guardian: z.string().optional().describe("Guardian wallet public key (base58). Auto-resolved if omitted."),
  vault_nonce: z.coerce.number().int().optional().describe("Vault nonce. Auto-resolved if omitted."),
};

function formatState(state: Record<string, unknown>): string {
  const key = Object.keys(state)[0];
  if (key === "active") return "Active";
  if (key === "frozen") return "Frozen";
  return key ?? "Unknown";
}

export async function getBalance(
  config: Config,
  args: { guardian?: string; vault_nonce?: number }
) {
  let guardian: PublicKey;
  let vaultNonce: number;

  if (args.guardian && args.vault_nonce !== undefined) {
    guardian = new PublicKey(args.guardian);
    vaultNonce = args.vault_nonce;
  } else {
    try {
      const ctx = await resolveContext(config, args);
      guardian = ctx.guardian;
      vaultNonce = ctx.vaultNonce;
    } catch (error: any) {
      return { content: [{ type: "text" as const, text: error.message }], isError: true };
    }
  }

  const nonce = new BN(vaultNonce);
  const [vaultPda] = findVaultPda(guardian, nonce, config.client.program.programId);

  const vault = await fetchVaultByPda(
    config.client.program,
    config.connection,
    vaultPda
  );

  if (!vault) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No vault found for guardian ${guardian.toBase58()} with nonce ${vaultNonce}.\nExpected PDA: ${vaultPda.toBase58()}`,
        },
      ],
    };
  }

  const balanceSol = vault.balance / LAMPORTS_PER_SOL;
  const dailyCap = vault.account.policies.spending.dailyCap.toNumber() / LAMPORTS_PER_SOL;
  const perTxCap = vault.account.policies.spending.perTxCap.toNumber() / LAMPORTS_PER_SOL;
  const dailySpent = vault.account.policies.spending.dailySpent.toNumber() / LAMPORTS_PER_SOL;

  const allowList = vault.account.policies.programs.allowList;
  const denyList = vault.account.policies.programs.denyList;

  const lines = [
    `Vault: ${vaultPda.toBase58()}`,
    `Guardian: ${vault.account.guardian.toBase58()}`,
    `State: ${formatState(vault.account.state)}`,
    `Nonce: ${vault.account.nonce.toNumber()}`,
    ``,
    `Balance: ${balanceSol} SOL`,
    ``,
    `Spending Policy:`,
    `  Epoch Cap: ${dailyCap} SOL`,
    `  Per-Tx Cap: ${perTxCap} SOL`,
    `  Spent This Epoch: ${dailySpent} SOL`,
    `  Remaining This Epoch: ${Math.max(0, dailyCap - dailySpent)} SOL`,
    `  Last Reset Epoch: ${vault.account.policies.spending.lastResetEpoch.toNumber()}`,
  ];

  if (allowList.length > 0 || denyList.length > 0) {
    lines.push(``, `Program Policy:`);
    if (allowList.length > 0) {
      lines.push(`  Allowed Programs (${allowList.length}):`);
      for (const pk of allowList) lines.push(`    - ${pk.toBase58()}`);
    }
    if (denyList.length > 0) {
      lines.push(`  Denied Programs (${denyList.length}):`);
      for (const pk of denyList) lines.push(`    - ${pk.toBase58()}`);
    }
  }

  const text = lines.join("\n");

  return { content: [{ type: "text" as const, text }] };
}
