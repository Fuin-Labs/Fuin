#!/usr/bin/env npx tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { getBalance, getBalanceSchema } from "./tools/get-balance.js";
import { getDelegateInfo, getDelegateInfoSchema } from "./tools/get-delegate-info.js";
import { listDelegates } from "./tools/list-delegates.js";
import { transferSol, transferSolSchema } from "./tools/transfer-sol.js";

const config = loadConfig();

const server = new McpServer({
  name: "fuin",
  version: "1.0.0",
});

// --- Read-only tools ---

server.tool(
  "get-balance",
  "Get vault SOL balance, state, and spending policy caps",
  getBalanceSchema,
  { readOnlyHint: true },
  async (args) => getBalance(config, args)
);

server.tool(
  "get-delegate-info",
  "Get delegate permissions, spending limits, usage count, expiry, and status",
  getDelegateInfoSchema,
  { readOnlyHint: true },
  async (args) => getDelegateInfo(config, args)
);

server.tool(
  "list-delegates",
  "List all delegates issued to this agent's keypair, with vault info",
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

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
