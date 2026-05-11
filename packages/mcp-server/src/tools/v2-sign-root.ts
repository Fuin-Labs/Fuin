import { z } from "zod";
import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

const ACTORS = ["user", "orchestrator", "research", "executeAgent", "audit", "rogue"] as const;

const predicateSchema = z
  .object({
    dex: z.array(z.string()).optional().describe("DEX aliases ('jupiter', 'raydium') or raw pubkeys"),
    time_window_hours: z.number().nonnegative().optional(),
    read_only: z.boolean().optional(),
    max_price_usd: z.number().nonnegative().optional(),
    price_token: z.string().optional(),
    price_oracle: z.string().optional(),
  })
  .optional()
  .describe("Goal predicate. Empty object = unconstrained. Set read_only:true for read-only.");

export const v2SignRootSchema = {
  as: z.enum(ACTORS).describe("Actor name that signs as the root user (typically 'user')."),
  agent_actor: z.enum(ACTORS).describe("Actor name who becomes the root agent (typically 'orchestrator')."),
  predicate: predicateSchema,
  budget: z.coerce.number().nonnegative().describe("Budget in token micro-units (e.g. 500_000_000 = 500 USDC at 6dp)."),
  expires_in_hours: z.number().positive().describe("Intent expiry, hours from now."),
  nonce: z.coerce.number().optional(),
};

export async function v2SignRoot(config: Config, args: any) {
  try {
    const r = await relayerPost<{ pda: string; sig: string; scope: string; user_actor: string; agent_actor: string }>(
      config.relayerUrl,
      "/intents/sign-root",
      args
    );
    const text = [
      `Root intent signed.`,
      ``,
      `  pda:    ${r.pda}`,
      `  scope:  ${r.scope}`,
      `  user:   ${r.user_actor}`,
      `  agent:  ${r.agent_actor}`,
      `  tx:     https://explorer.solana.com/tx/${r.sig}?cluster=devnet`,
    ].join("\n");
    return { content: [{ type: "text" as const, text }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
