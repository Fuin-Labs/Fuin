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

function createServer(config: Config) {
  const server = new McpServer({
    name: "fuin",
    version: "1.1.0",
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

  return server;
}

// Sandbox server for Smithery capability scanning (no real credentials needed)
export function createSandboxServer() {
  const server = new McpServer({
    name: "fuin",
    version: "1.1.0",
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
