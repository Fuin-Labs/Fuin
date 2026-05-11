import { PublicKey } from "@solana/web3.js";
import { GoalPredicate, type GoalPredicateData } from "@fuin-labs/sdk-v2";

const JUPITER = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
const RAYDIUM = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");

const DEX_ALIASES: Record<string, PublicKey> = {
  jupiter: JUPITER,
  raydium: RAYDIUM,
};

export interface PredicateInput {
  dex?: string[];
  time_window_hours?: number;
  read_only?: boolean;
  max_price_usd?: number;
  price_token?: string;
  price_oracle?: string;
}

export function buildPredicate(input: PredicateInput | undefined): GoalPredicateData {
  if (!input || Object.keys(input).length === 0) {
    return GoalPredicate.empty();
  }
  if (input.read_only) {
    return GoalPredicate.readOnly();
  }
  let p = GoalPredicate.composite();
  if (input.dex && input.dex.length > 0) {
    const pubkeys = input.dex.map((name) => {
      const lower = name.toLowerCase();
      const aliased = DEX_ALIASES[lower];
      if (aliased) return aliased;
      try {
        return new PublicKey(name);
      } catch {
        throw new Error(`Unknown DEX alias: ${name}`);
      }
    });
    p = p.onlyOnDexes(pubkeys);
  }
  if (input.time_window_hours && input.time_window_hours > 0) {
    const now = Math.floor(Date.now() / 1000);
    p = p.withinTimeWindow(now - 3600, now + input.time_window_hours * 3600);
  }
  if (
    input.max_price_usd &&
    input.price_token &&
    input.price_oracle
  ) {
    p = p.belowPriceUSD(
      new PublicKey(input.price_token),
      BigInt(Math.floor(input.max_price_usd * 1_000_000)),
      new PublicKey(input.price_oracle)
    );
  }
  return p.build();
}

export function describePredicate(input: PredicateInput | undefined): string {
  if (!input || Object.keys(input).length === 0) return "unconstrained";
  if (input.read_only) return "READ-ONLY (no spends)";
  const parts: string[] = [];
  if (input.dex?.length) parts.push(`dex=[${input.dex.join(",")}]`);
  if (input.time_window_hours) parts.push(`${input.time_window_hours}h window`);
  if (input.max_price_usd) parts.push(`max $${input.max_price_usd}`);
  return parts.length ? parts.join(" · ") : "unconstrained";
}
