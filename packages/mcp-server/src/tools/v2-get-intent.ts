import { z } from "zod";
import { relayerGet, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

export const v2GetIntentSchema = {
  pda: z.string().describe("Intent PDA (base58)."),
};

export async function v2GetIntent(config: Config, args: { pda: string }) {
  try {
    const it = await relayerGet<any>(config.relayerUrl, `/intents/${args.pda}`);
    const lines = [
      `Intent ${it.pda}`,
      ``,
      `  User (root signer): ${it.user}`,
      `  Agent:              ${it.agent}${it.agent_actor ? ` (${it.agent_actor})` : ""}`,
      `  Parent:             ${it.parent ?? "(none — root)"}`,
      `  Depth:              ${it.depth}`,
      `  Budget:             ${it.remaining} / ${it.budget}`,
      `  Expires:            ${new Date(Number(it.expiresAt) * 1000).toISOString()}`,
      `  Status:             ${it.revoked ? "REVOKED" : "ACTIVE"}`,
    ].join("\n");
    return { content: [{ type: "text" as const, text: lines }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
