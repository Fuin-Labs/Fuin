import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, type Config } from "./config.js";
import { getBalance, getBalanceSchema } from "./tools/get-balance.js";
import { getDelegateInfo, getDelegateInfoSchema } from "./tools/get-delegate-info.js";
import { listDelegates } from "./tools/list-delegates.js";
import { transferSol, transferSolSchema } from "./tools/transfer-sol.js";
import { transferSpl, transferSplSchema } from "./tools/transfer-spl.js";
import { requestProgram, requestProgramSchema } from "./tools/request-program.js";
import { swap, swapSchema } from "./tools/swap.js";
// --- v2 tools (relayer-backed) ---
import { v2InitSwarm, v2InitSwarmSchema } from "./tools/v2-init-swarm.js";
import { v2ResetSwarm } from "./tools/v2-reset-swarm.js";
import { v2SwarmState } from "./tools/v2-swarm-state.js";
import { v2SignRoot, v2SignRootSchema } from "./tools/v2-sign-root.js";
import { v2DeriveChild, v2DeriveChildSchema } from "./tools/v2-derive-child.js";
import { v2VerifiedSpl, v2VerifiedSplSchema } from "./tools/v2-verified-spl.js";
import { v2AttemptRogue, v2AttemptRogueSchema } from "./tools/v2-attempt-rogue.js";
import { v2ListIntents, v2ListIntentsSchema } from "./tools/v2-list-intents.js";
import { v2GetIntent, v2GetIntentSchema } from "./tools/v2-get-intent.js";

function createServer(config: Config) {
  const server = new McpServer({
    name: "fuin",
    version: "1.2.0",
  });

  // --- Read-only tools ---

  server.tool(
    "get-balance",
    "Get vault SOL balance, state, spending policy caps, and program allow/deny lists",
    getBalanceSchema,
    { readOnlyHint: true },
    async (args) => getBalance(config, args)
  );

  server.tool(
    "get-delegate-info",
    "Get delegate permissions, spending limits, usage count, expiry, status, and vault program policies",
    getDelegateInfoSchema,
    { readOnlyHint: true },
    async (args) => getDelegateInfo(config, args)
  );

  server.tool(
    "list-delegates",
    "List all delegates issued to this agent's keypair, with vault info and program policies",
    {},
    { readOnlyHint: true },
    async () => listDelegates(config)
  );

  // --- Destructive tools ---

  server.tool(
    "transfer-sol",
    "Execute a SOL transfer from a Fuin vault using delegate permissions. On-chain policy enforcement applies.",
    transferSolSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => transferSol(config, args)
  );

  server.tool(
    "transfer-spl",
    "Execute an SPL token transfer from a Fuin vault using delegate permissions. Requires CAN_TRANSFER permission. Supports Pyth price feeds for USD valuation.",
    transferSplSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => transferSpl(config, args)
  );

  server.tool(
    "request-program",
    "Request the guardian to add a program to the vault's allow-list. Creates a pending request for guardian review.",
    requestProgramSchema,
    { destructiveHint: false, idempotentHint: false },
    async (args) => requestProgram(config, args)
  );

  server.tool(
    "swap",
    "Execute a token swap on Meteora DLMM from a Fuin vault using delegate permissions. Requires CAN_SWAP permission and DLMM program in vault allow-list. On-chain policy enforcement applies.",
    swapSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => swap(config, args)
  );

  // --- v2 swarm tools (relayer-backed) ---

  server.tool(
    "init-swarm-demo",
    "Initialize the v2 swarm demo: generates 6 ephemeral actor keypairs (user, orchestrator, research, executeAgent, audit, rogue) and funds them in one tx from the relayer's funder wallet. Must be called before any other v2 tool. Idempotency: refuses if already initialized — call reset-swarm-demo first to start over.",
    v2InitSwarmSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => v2InitSwarm(config, args)
  );

  server.tool(
    "reset-swarm-demo",
    "Wipe v2 swarm state (deletes the relayer's actors + recorded intents). Existing on-chain intent accounts remain; this tool only clears local state. Use to start a fresh demo.",
    {},
    { destructiveHint: true, idempotentHint: true },
    async () => v2ResetSwarm(config)
  );

  server.tool(
    "swarm-state",
    "Show all v2 swarm actors (name → pubkey) and recorded intents. Read-only; use to orient at any point in the demo.",
    {},
    { readOnlyHint: true },
    async () => v2SwarmState(config)
  );

  server.tool(
    "sign-root-intent",
    "User actor signs a root intent authorizing an agent actor to act under a goal predicate within a budget and time window. Returns the new intent PDA and tx signature. Predicate examples: {dex:['jupiter'], time_window_hours:24} restricts to Jupiter swaps within 24h; {read_only:true} bans spends entirely; {} is unconstrained.",
    v2SignRootSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => v2SignRoot(config, args)
  );

  server.tool(
    "derive-child-intent",
    "Parent agent derives a stricter child intent under an existing parent. The on-chain ancestor-walk enforces that a child's runtime scope is the INTERSECTION of its predicate AND every ancestor's predicate — i.e. a child can never widen scope. Returns the new child PDA + tx sig.",
    v2DeriveChildSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => v2DeriveChild(config, args)
  );

  server.tool(
    "verified-spl-transfer",
    "An authorized agent executes an SPL TransferChecked guarded by verify_authorizes(intent, ancestors). On-chain ancestor walk evaluates every parent predicate against the parsed transfer. Succeeds only if every ancestor allows it. If rejected, returns the rejection reason from the chain's error.",
    v2VerifiedSplSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => v2VerifiedSpl(config, args)
  );

  server.tool(
    "attempt-rogue-action",
    "Same wire format as verified-spl-transfer, but framed as the demo's boundary moment. Expects rejection: the rogue agent tries an action that falls outside its parent's predicate, the ancestor-walk catches it, the action is rejected on-chain. If this tool returns ✓ BOUNDARY HELD, the demo's central claim is verified end-to-end.",
    v2AttemptRogueSchema,
    { destructiveHint: true, idempotentHint: false },
    async (args) => v2AttemptRogue(config, args)
  );

  server.tool(
    "list-my-intents",
    "List all v2 intents where the named actor is the authorized agent. Read-only. Useful for 'what can I do?' from an agent's perspective.",
    v2ListIntentsSchema,
    { readOnlyHint: true },
    async (args) => v2ListIntents(config, args)
  );

  server.tool(
    "get-intent",
    "Fetch a single v2 intent record from chain by PDA. Read-only. Shows user, agent, parent, depth, budget remaining, expiry, revoked status.",
    v2GetIntentSchema,
    { readOnlyHint: true },
    async (args) => v2GetIntent(config, args)
  );

  return server;
}

// Sandbox server for Smithery capability scanning (no real credentials needed)
export function createSandboxServer() {
  const server = new McpServer({
    name: "fuin",
    version: "1.2.0",
  });

  server.tool(
    "get-balance",
    "Get vault SOL balance, state, spending policy caps, and program allow/deny lists",
    getBalanceSchema,
    { readOnlyHint: true },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "get-delegate-info",
    "Get delegate permissions, spending limits, usage count, expiry, status, and vault program policies",
    getDelegateInfoSchema,
    { readOnlyHint: true },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "list-delegates",
    "List all delegates issued to this agent's keypair, with vault info and program policies",
    {},
    { readOnlyHint: true },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "transfer-sol",
    "Execute a SOL transfer from a Fuin vault using delegate permissions. On-chain policy enforcement applies.",
    transferSolSchema,
    { destructiveHint: true, idempotentHint: false },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "transfer-spl",
    "Execute an SPL token transfer from a Fuin vault using delegate permissions. Requires CAN_TRANSFER permission. Supports Pyth price feeds for USD valuation.",
    transferSplSchema,
    { destructiveHint: true, idempotentHint: false },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "request-program",
    "Request the guardian to add a program to the vault's allow-list. Creates a pending request for guardian review.",
    requestProgramSchema,
    { destructiveHint: false, idempotentHint: false },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  server.tool(
    "swap",
    "Execute a token swap on Meteora DLMM from a Fuin vault using delegate permissions. Requires CAN_SWAP permission and DLMM program in vault allow-list. On-chain policy enforcement applies.",
    swapSchema,
    { destructiveHint: true, idempotentHint: false },
    async () => ({ content: [{ type: "text" as const, text: "sandbox" }] })
  );

  return server;
}

// --- Start ---
// Only start the real server if DELEGATE_PRIVATE_KEY is available.
// When Smithery imports this file for scanning, the env var won't be set,
// so it falls through to the exported createSandboxServer instead.

if (process.env.DELEGATE_PRIVATE_KEY) {
  (async () => {
    const config = loadConfig();
    const server = createServer(config);
    const transport = new StdioServerTransport();
    await server.connect(transport);
  })().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
