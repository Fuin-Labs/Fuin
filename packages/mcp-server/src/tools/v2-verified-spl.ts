import { z } from "zod";
import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

const ACTORS = ["user", "orchestrator", "research", "executeAgent", "audit", "rogue"] as const;

export const v2VerifiedSplSchema = {
  as: z.enum(ACTORS).describe("Actor name to sign the action. Must be the intent's authorized agent."),
  intent_pda: z.string().describe("Intent PDA authorizing the action."),
  mint: z.string().describe("SPL token mint."),
  destination: z.string().describe("Destination wallet pubkey (ATA auto-derived)."),
  amount: z.coerce.number().positive().describe("Amount in raw token units."),
  token_program: z.string().optional().describe("Token program (default SPL Token). Use Token-2022 for token2022 mints."),
};

export async function v2VerifiedSpl(config: Config, args: any) {
  try {
    const r = await relayerPost<any>(config.relayerUrl, "/actions/verify-spl", args);
    if (r.rejected) {
      const text = [
        `Verified SPL transfer REJECTED.`,
        ``,
        `  reason:    ${r.reason}`,
        `  intent:    ${r.intent}`,
        `  agent:     ${r.agent_actor}`,
        `  ancestors: ${r.ancestors.length}`,
        ``,
        `Raw chain error: ${r.raw}`,
      ].join("\n");
      return { content: [{ type: "text" as const, text }], isError: true };
    }
    const text = [
      `Verified SPL transfer succeeded.`,
      ``,
      `  intent:    ${r.intent}`,
      `  agent:     ${r.agent_actor}`,
      `  ancestors: ${r.ancestors.length}`,
      `  tx:        https://explorer.solana.com/tx/${r.sig}?cluster=devnet`,
    ].join("\n");
    return { content: [{ type: "text" as const, text }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
