import { z } from "zod";
import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

export const v2InitSwarmSchema = {
  fund_sol_per_actor: z
    .number()
    .positive()
    .optional()
    .describe("SOL to fund each actor with. Default 0.06 (enough for ~30 v2 ixs)."),
};

export async function v2InitSwarm(config: Config, args: { fund_sol_per_actor?: number }) {
  try {
    const r = await relayerPost<{
      ok: boolean;
      actors: Record<string, { secretKey: string; pubkey: string }>;
      fundingSig: string;
      fundedPerActor: number;
    }>(config.relayerUrl, "/demo/init", { fund_sol_per_actor: args.fund_sol_per_actor });
    const lines = [
      `Initialized swarm. Funded ${Object.keys(r.actors).length} actors with ${r.fundedPerActor} SOL each.`,
      ``,
      `Funding tx: https://explorer.solana.com/tx/${r.fundingSig}?cluster=devnet`,
      ``,
      `Actors:`,
      ...Object.entries(r.actors).map(([name, a]) => `  ${name.padEnd(14)} ${a.pubkey}`),
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
