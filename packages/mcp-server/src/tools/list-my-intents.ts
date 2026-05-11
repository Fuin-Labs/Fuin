import { fetchIntentsByAgent } from "../accounts.js";
import type { Config } from "../config.js";

const PRED_PRICE = 0b0001;
const PRED_DEX = 0b0010;
const PRED_TIME = 0b0100;
const PRED_READ_ONLY = 0b1000;

function describePredicate(flags: number, allowedDexes: { toBase58(): string }[]): string {
  if (flags & PRED_READ_ONLY) return "READ-ONLY (no spends)";
  const parts: string[] = [];
  if (flags & PRED_DEX) {
    parts.push(`dex=[${allowedDexes.map((p) => p.toBase58().slice(0, 6) + "…").join(",")}]`);
  }
  if (flags & PRED_PRICE) parts.push("price-bound");
  if (flags & PRED_TIME) parts.push("time-windowed");
  return parts.length ? parts.join(", ") : "unconstrained";
}

export async function listMyIntents(config: Config) {
  const agent = config.keypair.publicKey;

  const intents = await fetchIntentsByAgent(
    config.connection,
    config.fuinV2.program,
    agent
  );

  if (intents.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No v2 intents found for agent: ${agent.toBase58()}\n\nA user must sign a root intent (or a parent agent must derive a child intent) targeting this pubkey before this agent can act under v2.`,
        },
      ],
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const lines: string[] = [
    `Found ${intents.length} intent(s) where this agent (${agent.toBase58()}) is authorized:`,
    ``,
  ];

  for (const it of intents) {
    const a = it.account;
    const expiresAt = a.expiresAt.toNumber();
    const expired = expiresAt < now;
    const status = a.revoked ? "REVOKED" : expired ? "EXPIRED" : "ACTIVE";
    const role = a.parentIntent ? `child (depth ${a.depth})` : "ROOT";

    lines.push(
      `--- Intent ${it.publicKey.toBase58()} ---`,
      `  Role: ${role}`,
      `  Status: ${status}`,
      `  User (root signer): ${a.user.toBase58()}`,
      `  Parent: ${a.parentIntent ? a.parentIntent.toBase58() : "(none — root)"}`,
      `  Predicate: ${describePredicate(a.goalPredicate.flags, a.goalPredicate.allowedDexes)}`,
      `  Budget: ${a.remainingBudget.toString()} / ${a.budget.toString()} remaining`,
      `  Expires: ${new Date(expiresAt * 1000).toISOString()}${expired ? " (EXPIRED)" : ""}`,
      ``
    );
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}
