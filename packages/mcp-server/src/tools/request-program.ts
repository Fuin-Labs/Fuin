import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { findVaultPda, findDelegatePda } from "@fuin-labs/sdk";
import { resolveContext } from "../resolve.js";
import type { Config } from "../config.js";

export const requestProgramSchema = {
  guardian: z.string().optional().describe("Guardian wallet public key (base58). Auto-resolved if omitted."),
  vault_nonce: z.coerce.number().int().optional().describe("Vault nonce. Auto-resolved if omitted."),
  delegate_nonce: z.coerce.number().int().optional().describe("Delegate nonce. Auto-resolved if omitted."),
  program_address: z
    .string()
    .describe("Solana program address to request access to (base58)"),
  reason: z.string().describe("Why this program is needed"),
};

export async function requestProgram(
  config: Config,
  args: {
    guardian?: string;
    vault_nonce?: number;
    delegate_nonce?: number;
    program_address: string;
    reason: string;
  }
) {
  let ctx;
  try {
    ctx = await resolveContext(config, args);
  } catch (error: any) {
    return { content: [{ type: "text" as const, text: error.message }], isError: true };
  }

  const vaultNonce = new BN(ctx.vaultNonce);
  const delegateNonce = new BN(ctx.delegateNonce);

  const [vaultPda] = findVaultPda(
    ctx.guardian,
    vaultNonce,
    config.client.program.programId
  );
  const [delegatePda] = findDelegatePda(
    vaultPda,
    delegateNonce,
    config.client.program.programId
  );

  // Validate program_address is a valid public key
  try {
    new PublicKey(args.program_address);
  } catch {
    return {
      content: [
        {
          type: "text" as const,
          text: `Invalid program address: ${args.program_address}`,
        },
      ],
    };
  }

  const apiUrl =
    process.env.FUIN_API_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/api/program-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vaultPda: vaultPda.toBase58(),
      delegatePda: delegatePda.toBase58(),
      guardian: ctx.guardian.toBase58(),
      programAddress: args.program_address,
      reason: args.reason,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to submit program request (HTTP ${res.status}): ${errBody}`,
        },
      ],
    };
  }

  const data = await res.json();

  const text = [
    `Program request submitted successfully.`,
    ``,
    `Request ID: ${data.id}`,
    `Status: ${data.status}`,
    `Vault: ${vaultPda.toBase58()}`,
    `Delegate: ${delegatePda.toBase58()}`,
    `Program: ${args.program_address}`,
    `Reason: ${args.reason}`,
    ``,
    `The guardian will review this request in their dashboard.`,
  ].join("\n");

  return { content: [{ type: "text" as const, text }] };
}
