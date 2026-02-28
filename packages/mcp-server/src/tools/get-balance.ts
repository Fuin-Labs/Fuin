import { z } from "zod";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { findVaultPda } from "@fuin/sdk";
import { fetchVaultByPda } from "../accounts.js";
import type { Config } from "../config.js";

export const getBalanceSchema = {
  guardian: z.string().describe("Guardian wallet public key (base58)"),
  vault_nonce: z.coerce.number().int().describe("Vault nonce"),
};

function formatState(state: Record<string, unknown>): string {
  const key = Object.keys(state)[0];
  if (key === "active") return "Active";
  if (key === "frozen") return "Frozen";
  return key ?? "Unknown";
}

export async function getBalance(
  config: Config,
  args: { guardian: string; vault_nonce: number }
) {
  const guardian = new PublicKey(args.guardian);
  const nonce = new BN(args.vault_nonce);
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
          text: `No vault found for guardian ${args.guardian} with nonce ${args.vault_nonce}.\nExpected PDA: ${vaultPda.toBase58()}`,
        },
      ],
    };
  }

  const balanceSol = vault.balance / LAMPORTS_PER_SOL;
  const dailyCap = vault.account.policies.spending.dailyCap.toNumber() / LAMPORTS_PER_SOL;
  const perTxCap = vault.account.policies.spending.perTxCap.toNumber() / LAMPORTS_PER_SOL;
  const dailySpent = vault.account.policies.spending.dailySpent.toNumber() / LAMPORTS_PER_SOL;

  const text = [
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
  ].join("\n");

  return { content: [{ type: "text" as const, text }] };
}
