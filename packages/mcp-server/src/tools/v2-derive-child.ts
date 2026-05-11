import { z } from "zod";
import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

const ACTORS = ["user", "orchestrator", "research", "executeAgent", "audit", "rogue"] as const;

const predicateSchema = z
  .object({
    dex: z.array(z.string()).optional(),
    time_window_hours: z.number().nonnegative().optional(),
    read_only: z.boolean().optional(),
    max_price_usd: z.number().nonnegative().optional(),
    price_token: z.string().optional(),
    price_oracle: z.string().optional(),
  })
  .optional();

export const v2DeriveChildSchema = {
  as: z.enum(ACTORS).describe("Parent agent actor name. Must match parent intent's agent."),
  parent_pda: z.string().describe("Parent intent PDA (base58)."),
  child_actor: z.enum(ACTORS).describe("Actor that becomes the new child intent's agent."),
  predicate: predicateSchema,
  budget: z.coerce.number().nonnegative(),
  expires_in_hours: z.number().positive(),
  nonce: z.coerce.number().optional(),
};

export async function v2DeriveChild(config: Config, args: any) {
  try {
    const r = await relayerPost<{ pda: string; sig: string; scope: string; parent: string; child_actor: string }>(
      config.relayerUrl,
      "/intents/derive-child",
      args
    );
    const text = [
      `Child intent derived.`,
      ``,
      `  pda:    ${r.pda}`,
      `  parent: ${r.parent}`,
      `  child:  ${r.child_actor}`,
      `  scope:  ${r.scope}`,
      `  tx:     https://explorer.solana.com/tx/${r.sig}?cluster=devnet`,
    ].join("\n");
    return { content: [{ type: "text" as const, text }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
