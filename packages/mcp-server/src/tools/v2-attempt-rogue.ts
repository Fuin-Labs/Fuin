import { z } from "zod";
import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

const ACTORS = ["user", "orchestrator", "research", "executeAgent", "audit", "rogue"] as const;

export const v2AttemptRogueSchema = {
  as: z.enum(ACTORS).describe("Rogue actor name (typically 'rogue')."),
  intent_pda: z.string().describe("Rogue intent PDA (child of root)."),
  mint: z.string().describe("Mint of an SPL transfer that will fall outside the parent's predicate scope."),
  destination: z.string(),
  amount: z.coerce.number().positive(),
  token_program: z.string().optional(),
};

export async function v2AttemptRogue(config: Config, args: any) {
  try {
    const r = await relayerPost<any>(config.relayerUrl, "/actions/verify-spl", {
      ...args,
      expect_rejection: true,
    });
    if (r.rejected) {
      const text = [
        `✓ BOUNDARY HELD — rogue action rejected on-chain.`,
        ``,
        `  reason:    ${r.reason}`,
        `  intent:    ${r.intent}`,
        `  agent:     ${r.agent_actor}`,
        `  ancestors: ${r.ancestors.length}`,
        ``,
        `Raw chain error: ${r.raw}`,
        ``,
        `This is the demo payoff. The action was syntactically valid; the on-chain`,
        `ancestor-walk in verify_authorizes refused it because a parent predicate`,
        `disallows it. Off-chain code cannot reach this code path.`,
      ].join("\n");
      return { content: [{ type: "text" as const, text }] };
    }
    // unexpected success — that's BAD for the demo
    const text = [
      `⚠  UNEXPECTED SUCCESS — the rogue action was NOT rejected.`,
      `   tx: https://explorer.solana.com/tx/${r.sig}?cluster=devnet`,
      `   The parent predicate did not catch this. Investigate.`,
    ].join("\n");
    return { content: [{ type: "text" as const, text }], isError: true };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
