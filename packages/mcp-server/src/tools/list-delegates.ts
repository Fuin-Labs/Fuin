import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { CAN_SWAP, CAN_TRANSFER, CAN_STAKE, CAN_LP } from "@fuin/sdk";
import { fetchDelegatesByAuthority, fetchVaultByPda } from "../accounts.js";
import type { Config } from "../config.js";

function formatPermissions(perms: number): string {
  const flags: string[] = [];
  if (perms & CAN_SWAP) flags.push("Swap");
  if (perms & CAN_TRANSFER) flags.push("Transfer");
  if (perms & CAN_STAKE) flags.push("Stake");
  if (perms & CAN_LP) flags.push("LP");
  return flags.length > 0 ? flags.join(", ") : "None";
}

export async function listDelegates(config: Config) {
  const authority = config.keypair.publicKey;

  const delegates = await fetchDelegatesByAuthority(
    config.connection,
    config.client.program,
    authority
  );

  if (delegates.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No delegates found for authority: ${authority.toBase58()}\n\nThis means no guardian has issued a delegate key to this keypair, or the delegates have been closed.`,
        },
      ],
    };
  }

  const lines: string[] = [
    `Found ${delegates.length} delegate(s) for authority: ${authority.toBase58()}`,
    ``,
  ];

  for (const del of delegates) {
    const d = del.account;
    const dailyLimit = d.dailyLimit.toNumber() / LAMPORTS_PER_SOL;
    const dailySpent = d.dailySpent.toNumber() / LAMPORTS_PER_SOL;
    const expiry = d.expiry.toNumber();
    const now = Math.floor(Date.now() / 1000);
    const expired = expiry > 0 && expiry < now;

    // Fetch vault info for this delegate
    let vaultInfo = "";
    const vault = await fetchVaultByPda(
      config.client.program,
      config.connection,
      d.vault
    );
    if (vault) {
      const vaultBalance = vault.balance / LAMPORTS_PER_SOL;
      const stateKey = Object.keys(vault.account.state)[0] ?? "unknown";
      vaultInfo = [
        `  Vault Balance: ${vaultBalance} SOL`,
        `  Vault State: ${stateKey === "active" ? "Active" : stateKey === "frozen" ? "Frozen" : stateKey}`,
        `  Guardian: ${vault.account.guardian.toBase58()}`,
        `  Vault Nonce: ${vault.account.nonce.toNumber()}`,
      ].join("\n");
    }

    lines.push(
      `--- Delegate #${d.nonce.toNumber()} ---`,
      `PDA: ${del.publicKey.toBase58()}`,
      `Vault: ${d.vault.toBase58()}`,
      vaultInfo,
      `Status: ${d.isActive ? (expired ? "Expired" : "Active") : "Inactive"}`,
      `Permissions: ${formatPermissions(d.permissions)}`,
      `Epoch Limit: ${dailyLimit} SOL (spent: ${dailySpent} SOL)`,
      `Uses: ${d.uses}${d.maxUses > 0 ? ` / ${d.maxUses}` : " (unlimited)"}`,
      `Expiry: ${expiry === 0 ? "None" : new Date(expiry * 1000).toISOString()}${expired ? " (EXPIRED)" : ""}`,
      ``
    );
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}
