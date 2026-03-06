import { PublicKey } from "@solana/web3.js";
import { fetchDelegatesByAuthority, fetchVaultByPda } from "./accounts.js";
import type { Config } from "./config.js";

export interface ResolvedContext {
  guardian: PublicKey;
  vaultNonce: number;
  delegateNonce: number;
}

/**
 * Resolve guardian, vault_nonce, and delegate_nonce.
 * If all three are provided, use them directly.
 * Otherwise, auto-discover from the delegate keypair's on-chain accounts.
 */
export async function resolveContext(
  config: Config,
  args: {
    guardian?: string;
    vault_nonce?: number;
    delegate_nonce?: number;
  }
): Promise<ResolvedContext> {
  if (args.guardian && args.vault_nonce !== undefined && args.delegate_nonce !== undefined) {
    return {
      guardian: new PublicKey(args.guardian),
      vaultNonce: args.vault_nonce,
      delegateNonce: args.delegate_nonce,
    };
  }

  const delegates = await fetchDelegatesByAuthority(
    config.connection,
    config.client.program,
    config.keypair.publicKey
  );

  // Filter to active delegates only
  const active = delegates.filter((d) => d.account.isActive);
  const candidates = active.length > 0 ? active : delegates;

  if (candidates.length === 0) {
    throw new Error(
      `No delegates found for keypair ${config.keypair.publicKey.toBase58()}. ` +
      `Ask the guardian to issue a delegate key to this public key first.`
    );
  }

  if (candidates.length > 1 && !args.vault_nonce && !args.delegate_nonce) {
    const list = candidates
      .map((d) => `  - delegate_nonce=${d.account.nonce.toNumber()}, vault=${d.account.vault.toBase58()}`)
      .join("\n");
    throw new Error(
      `Multiple delegates found. Please specify vault_nonce and delegate_nonce:\n${list}`
    );
  }

  const del = candidates[0]!;
  const vault = await fetchVaultByPda(
    config.client.program,
    config.connection,
    del.account.vault
  );

  if (!vault) {
    throw new Error(`Could not fetch vault at ${del.account.vault.toBase58()}`);
  }

  return {
    guardian: vault.account.guardian,
    vaultNonce: vault.account.nonce.toNumber(),
    delegateNonce: del.account.nonce.toNumber(),
  };
}
