import { relayerPost, formatRelayerError } from "../relayer-client.js";
import type { Config } from "../config.js";

export async function v2ResetSwarm(config: Config) {
  try {
    await relayerPost(config.relayerUrl, "/demo/reset", {});
    return {
      content: [
        {
          type: "text" as const,
          text: "Swarm state wiped. Call init-swarm-demo to start fresh.",
        },
      ],
    };
  } catch (e) {
    return { content: [{ type: "text" as const, text: formatRelayerError(e) }], isError: true };
  }
}
