import { Connection, PublicKey } from "@solana/web3.js";
import type { Program, Idl } from "@coral-xyz/anchor";
import type BN from "bn.js";
import { FUIN_PROGRAM_ID } from "@fuin/sdk";

const VAULT_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119]);
const DELEGATE_DISCRIMINATOR = Buffer.from([
  92, 145, 166, 111, 11, 38, 38, 247,
]);

export interface VaultAccount {
  publicKey: PublicKey;
  account: {
    version: number;
    state: Record<string, unknown>;
    guardian: PublicKey;
    policies: {
      spending: {
        dailyCap: BN;
        perTxCap: BN;
        dailySpent: BN;
        lastResetEpoch: BN;
      };
      programs: { allowList: PublicKey[]; denyList: PublicKey[] };
      time: { allowedAfter: BN; allowedBefore: BN };
      risk: { maxSlippageBps: number; requireCosignAbove: BN };
    };
    recovery: {
      timeoutSeconds: BN;
      lastGuardianActivity: BN;
      backupGuardian: PublicKey | null;
    };
    nonce: BN;
    bump: number;
  };
  balance: number;
}

export interface DelegateAccount {
  publicKey: PublicKey;
  account: {
    vault: PublicKey;
    authority: PublicKey;
    permissions: number;
    dailyLimit: BN;
    dailySpent: BN;
    lastResetEpoch: BN;
    maxUses: number;
    uses: number;
    expiry: BN;
    isActive: boolean;
    nonce: BN;
    bump: number;
  };
}

export async function fetchDelegatesByAuthority(
  connection: Connection,
  program: Program<Idl>,
  authority: PublicKey
): Promise<DelegateAccount[]> {
  const accounts = await connection.getProgramAccounts(FUIN_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: DELEGATE_DISCRIMINATOR.toString("base64"),
          encoding: "base64",
        },
      },
      { memcmp: { offset: 40, bytes: authority.toBase58() } },
    ],
  });

  const results: DelegateAccount[] = [];
  for (const { pubkey, account: raw } of accounts) {
    try {
      const decoded = program.coder.accounts.decode("delegate", raw.data);
      results.push({ publicKey: pubkey, account: decoded });
    } catch {
      // skip malformed
    }
  }

  return results;
}

export async function fetchVaultByPda(
  program: Program<Idl>,
  connection: Connection,
  vaultPda: PublicKey
): Promise<VaultAccount | null> {
  try {
    const decoded = await (program.account as any).vault.fetch(vaultPda);
    const balance = await connection.getBalance(vaultPda);
    return { publicKey: vaultPda, account: decoded, balance };
  } catch {
    return null;
  }
}

export async function fetchDelegateByPda(
  program: Program<Idl>,
  delegatePda: PublicKey
): Promise<DelegateAccount | null> {
  try {
    const decoded = await (program.account as any).delegate.fetch(delegatePda);
    return { publicKey: delegatePda, account: decoded };
  } catch {
    return null;
  }
}
