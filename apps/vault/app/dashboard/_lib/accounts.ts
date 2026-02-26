import { Connection, PublicKey } from "@solana/web3.js";
import type { Program, Idl } from "@coral-xyz/anchor";
import type BN from "bn.js";
import { FUIN_PROGRAM_ID } from "@fuin/sdk";

// Account discriminators from the IDL
const VAULT_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119]);
const DELEGATE_DISCRIMINATOR = Buffer.from([92, 145, 166, 111, 11, 38, 38, 247]);

export interface VaultAccount {
  publicKey: PublicKey;
  account: {
    version: number;
    state: Record<string, unknown>;
    guardian: PublicKey;
    policies: {
      spending: { dailyCap: BN; perTxCap: BN; dailySpent: BN; lastResetEpoch: BN };
      programs: { allowList: PublicKey[]; denyList: PublicKey[] };
      time: { allowedAfter: BN; allowedBefore: BN };
      risk: { maxSlippageBps: number; requireCosignAbove: BN };
    };
    recovery: { timeoutSeconds: BN; lastGuardianActivity: BN; backupGuardian: PublicKey | null };
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

export async function fetchVaultsByGuardian(
  connection: Connection,
  program: Program<Idl>,
  guardian: PublicKey
): Promise<VaultAccount[]> {
  const accounts = await connection.getProgramAccounts(FUIN_PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR.toString("base64"), encoding: "base64" } },
      { memcmp: { offset: 10, bytes: guardian.toBase58() } },
    ],
  });

  const results: VaultAccount[] = [];
  for (const { pubkey, account: raw } of accounts) {
    try {
      const decoded = program.coder.accounts.decode("vault", raw.data);
      const balance = await connection.getBalance(pubkey);
      results.push({ publicKey: pubkey, account: decoded, balance });
    } catch {
      // skip malformed accounts
    }
  }

  return results.sort((a, b) => a.account.nonce.toNumber() - b.account.nonce.toNumber());
}

export async function fetchDelegatesByVault(
  connection: Connection,
  program: Program<Idl>,
  vaultPda: PublicKey
): Promise<DelegateAccount[]> {
  const accounts = await connection.getProgramAccounts(FUIN_PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: DELEGATE_DISCRIMINATOR.toString("base64"), encoding: "base64" } },
      { memcmp: { offset: 8, bytes: vaultPda.toBase58() } },
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

  return results.sort((a, b) => a.account.nonce.toNumber() - b.account.nonce.toNumber());
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

export async function fetchDelegatesByAuthority(
  connection: Connection,
  program: Program<Idl>,
  authority: PublicKey
): Promise<DelegateAccount[]> {
  const accounts = await connection.getProgramAccounts(FUIN_PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: DELEGATE_DISCRIMINATOR.toString("base64"), encoding: "base64" } },
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
