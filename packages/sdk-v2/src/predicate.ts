import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const PRED_PRICE = 0b0001;
export const PRED_DEX = 0b0010;
export const PRED_TIME = 0b0100;
export const PRED_READ_ONLY = 0b1000;

export interface GoalPredicateData {
  flags: number;
  priceToken: PublicKey;
  priceThresholdUsdMicros: BN;
  priceOracle: PublicKey;
  allowedDexes: PublicKey[];
  timeStartTs: BN;
  timeEndTs: BN;
}

const empty = (): GoalPredicateData => ({
  flags: 0,
  priceToken: PublicKey.default,
  priceThresholdUsdMicros: new BN(0),
  priceOracle: PublicKey.default,
  allowedDexes: [],
  timeStartTs: new BN(0),
  timeEndTs: new BN(0),
});

/**
 * Fluent builder for Fuin v2 goal predicates. Predicates are AND-composed:
 * an action must satisfy every constraint set on the predicate.
 *
 *   GoalPredicate.composite()
 *     .onlyOnDexes([JUPITER])
 *     .withinTimeWindow(start, end)
 *     .belowPriceUSD(SOL_MINT, 80, pythSolFeed)
 *     .build()
 *
 * Read-only is a one-shot — it forbids all spend actions and is the strictest
 * possible predicate.
 *
 *   GoalPredicate.readOnly()
 */
export class GoalPredicate {
  private constructor(private data: GoalPredicateData) {}

  static composite(): GoalPredicate {
    return new GoalPredicate(empty());
  }

  static readOnly(): GoalPredicateData {
    return { ...empty(), flags: PRED_READ_ONLY };
  }

  static empty(): GoalPredicateData {
    return empty();
  }

  belowPriceUSD(
    token: PublicKey,
    thresholdUsdMicros: bigint | number,
    oracle: PublicKey
  ): this {
    this.data.flags |= PRED_PRICE;
    this.data.priceToken = token;
    this.data.priceThresholdUsdMicros = new BN(thresholdUsdMicros.toString());
    this.data.priceOracle = oracle;
    return this;
  }

  onlyOnDexes(allowlist: PublicKey[]): this {
    if (allowlist.length > 4) {
      throw new Error("dex allowlist limit: 4");
    }
    this.data.flags |= PRED_DEX;
    this.data.allowedDexes = allowlist;
    return this;
  }

  withinTimeWindow(startTs: number | bigint, endTs: number | bigint): this {
    this.data.flags |= PRED_TIME;
    this.data.timeStartTs = new BN(startTs.toString());
    this.data.timeEndTs = new BN(endTs.toString());
    return this;
  }

  build(): GoalPredicateData {
    return { ...this.data };
  }
}
