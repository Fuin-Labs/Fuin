import { z } from "zod";
import { relayerGet, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

const ACTORS = ["user", "orchestrator", "research", "executeAgent", "audit", "rogue"] as const;

export const v2ListIntentsSchema = {
  actor: z.enum(ACTORS).describe("Actor whose authorized intents we want."),
};

export async function v2ListIntents(config: Config, args: { actor: string }) {
  try {
    const state = await relayerGet<{ initialized: boolean; actors?: Record<string, { pubkey: string }> }>(
      config.relayerUrl,
      "/demo/state"
    );
    if (!state.initialized) {
      return {
        content: [{ type: "text" as const, text: "Swarm not initialized. Call init-swarm-demo." }],
      };
    }
    const pubkey = state.actors?.[args.actor]?.pubkey;
    if (!pubkey) {
      return { content: [{ type: "text" as const, text: `Unknown actor: ${args.actor}` }], isError: true };
    }
    const r = await relayerGet<{ count: number; intents: any[] }>(
      config.relayerUrl,
      `/intents/by-agent/${pubkey}`
    );
    if (r.count === 0) {
      return {
        content: [{ type: "text" as const, text: `No intents found where '${args.actor}' is agent.` }],
      };
    }
    const lines: string[] = [`Found ${r.count} intent(s) for ${args.actor} (${pubkey}):`, ""];
    for (const it of r.intents) {
      lines.push(
        `--- ${it.pda} ---`,
        `  Role:      ${it.role}`,
        `  Parent:    ${it.parent ?? "(root)"}`,
        `  Budget:    ${it.remaining} / ${it.budget}`,
        `  Expires:   ${new Date(Number(it.expiresAt) * 1000).toISOString()}`,
        `  Status:    ${it.revoked ? "REVOKED" : "ACTIVE"}`,
        ``
      );
    }
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
