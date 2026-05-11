import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { fetchIntentByPda, walkAncestorChain } from "../accounts.js";
import type { Config } from "../config.js";

export const getIntentSchema = {
  intent: z
    .string()
    .describe("Intent PDA (base58). The on-chain account holding agent, predicate, budget, and parent link."),
};

const PRED_PRICE = 0b0001;
const PRED_DEX = 0b0010;
const PRED_TIME = 0b0100;
const PRED_READ_ONLY = 0b1000;

function predicateLines(flags: number, p: any): string[] {
  const out: string[] = [];
  if (flags & PRED_READ_ONLY) {
    out.push(`  Predicate: READ-ONLY (rejects all spend actions)`);
    return out;
  }
  if (flags === 0) {
    out.push(`  Predicate: (empty — inherits parent constraints only)`);
    return out;
  }
  out.push(`  Predicate flags: 0x${flags.toString(16)}`);
  if (flags & PRED_DEX) {
    out.push(
      `    OnlyOnDexes: [${p.allowedDexes.map((d: PublicKey) => d.toBase58()).join(", ")}]`
    );
  }
  if (flags & PRED_TIME) {
    out.push(
      `    WithinTimeWindow: ${new Date(p.timeStartTs.toNumber() * 1000).toISOString()} → ${new Date(p.timeEndTs.toNumber() * 1000).toISOString()}`
    );
  }
  if (flags & PRED_PRICE) {
    out.push(
      `    BelowPriceUSD: token=${p.priceToken.toBase58()} threshold=${p.priceThresholdUsdMicros.toString()} micros (oracle=${p.priceOracle.toBase58()})`
    );
  }
  return out;
}

export async function getIntent(
  config: Config,
  args: { intent: string }
) {
  let pda: PublicKey;
  try {
    pda = new PublicKey(args.intent);
  } catch {
    return {
      content: [{ type: "text" as const, text: `Invalid intent PDA: ${args.intent}` }],
      isError: true,
    };
  }

  const intent = await fetchIntentByPda(config.fuinV2.program, pda);
  if (!intent) {
    return {
      content: [
        { type: "text" as const, text: `Intent not found at ${pda.toBase58()}` },
      ],
      isError: true,
    };
  }

  const a = intent.account;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = a.expiresAt.toNumber();
  const expired = expiresAt < now;
  const status = a.revoked ? "REVOKED" : expired ? "EXPIRED" : "ACTIVE";

  const ancestors = await walkAncestorChain(config.fuinV2.program, pda);

  const lines: string[] = [
    `Intent ${pda.toBase58()}`,
    ``,
    `  Status: ${status}`,
    `  Role: ${a.parentIntent ? `child (depth ${a.depth})` : "ROOT"}`,
    `  User (root signer): ${a.user.toBase58()}`,
    `  Agent: ${a.agent.toBase58()}`,
    `  Parent: ${a.parentIntent ? a.parentIntent.toBase58() : "(none — root)"}`,
    `  Budget: ${a.remainingBudget.toString()} / ${a.budget.toString()} remaining`,
    `  Created: ${new Date(a.createdAt.toNumber() * 1000).toISOString()}`,
    `  Expires: ${new Date(expiresAt * 1000).toISOString()}${expired ? " (EXPIRED)" : ""}`,
    `  Policy version: ${a.policyVersion}`,
    `  Nonce: ${a.nonce.toString()}`,
    ...predicateLines(a.goalPredicate.flags, a.goalPredicate),
    ``,
    `Ancestor chain (${ancestors.length} parent${ancestors.length === 1 ? "" : "s"}):`,
    ...(ancestors.length === 0
      ? ["  (none — this is a root intent)"]
      : ancestors.map((p, i) => `  [${i}] ${p.toBase58()}`)),
  ];

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}
