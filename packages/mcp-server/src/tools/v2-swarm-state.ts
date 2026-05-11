import { relayerGet, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

interface State {
  initialized: boolean;
  actors?: Record<string, { pubkey: string }>;
  intents?: Array<{ pda: string; role: string; agent_actor: string }>;
  fundingSig?: string;
}

export async function v2SwarmState(config: Config) {
  try {
    const s = await relayerGet<State>(config.relayerUrl, "/demo/state");
    if (!s.initialized) {
      return {
        content: [{ type: "text" as const, text: "Swarm not initialized. Call init-swarm-demo." }],
      };
    }
    const lines: string[] = ["Swarm state:", ""];
    lines.push("Actors:");
    for (const [name, a] of Object.entries(s.actors ?? {})) {
      lines.push(`  ${name.padEnd(14)} ${a.pubkey}`);
    }
    lines.push("", `Intents (${s.intents?.length ?? 0}):`);
    for (const i of s.intents ?? []) {
      lines.push(`  [${i.role.padEnd(8)}] agent=${i.agent_actor.padEnd(13)} pda=${i.pda}`);
    }
    if (s.fundingSig) {
      lines.push("", `Funding tx: https://explorer.solana.com/tx/${s.fundingSig}?cluster=devnet`);
    }
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
