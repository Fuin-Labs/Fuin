import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { GoalPredicate } from "@fuin-labs/sdk-v2";
import { fetchIntentByPda } from "../accounts.js";
import type { Config } from "../config.js";

export const deriveChildIntentSchema = {
  parent_intent: z
    .string()
    .describe(
      "Parent intent PDA (base58). The MCP keypair must be this intent's `agent` (i.e. an orchestrator)."
    ),
  child_agent: z
    .string()
    .describe(
      "Child agent's public key (base58). The recipient of the new sub-intent."
    ),
  budget: z.coerce
    .number()
    .nonnegative()
    .describe(
      "Child budget in raw u64 units (token base units, decimals depend on the predicate's price token). Must be ≤ parent's remaining_budget."
    ),
  expires_at_unix: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Child expiry as a unix timestamp in seconds. Should be ≤ parent's expires_at."
    ),
  predicate: z
    .object({
      read_only: z
        .boolean()
        .optional()
        .describe("If true, child is READ-ONLY (rejects all spend actions). Other fields ignored."),
      allowed_dexes: z
        .array(z.string())
        .max(4)
        .optional()
        .describe("OnlyOnDexes: max 4 program IDs (base58) the child may interact with."),
      time_window: z
        .object({
          start_unix: z.coerce.number().int(),
          end_unix: z.coerce.number().int(),
        })
        .optional()
        .describe("WithinTimeWindow constraint."),
      price_below_usd: z
        .object({
          token_mint: z.string().describe("Token whose price is bounded (base58)."),
          threshold_usd_micros: z.coerce
            .number()
            .nonnegative()
            .describe("Max acceptable USD price in micros (1 USD = 1_000_000)."),
          pyth_oracle: z.string().describe("Pyth price feed account (base58)."),
        })
        .optional()
        .describe("BelowPriceUSD constraint."),
    })
    .describe(
      "Goal predicate. Pass {} (empty) to inherit only the parent's constraints. Predicates are AND-composed."
    ),
  child_nonce: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      "Child intent nonce (u64). Defaults to Date.now() if omitted. Must be unique per (user, child_agent)."
    ),
};

type Args = {
  parent_intent: string;
  child_agent: string;
  budget: number;
  expires_at_unix: number;
  predicate: {
    read_only?: boolean;
    allowed_dexes?: string[];
    time_window?: { start_unix: number; end_unix: number };
    price_below_usd?: {
      token_mint: string;
      threshold_usd_micros: number;
      pyth_oracle: string;
    };
  };
  child_nonce?: number;
};

function buildPredicate(p: Args["predicate"]) {
  if (p.read_only) return GoalPredicate.readOnly();
  if (
    !p.allowed_dexes &&
    !p.time_window &&
    !p.price_below_usd
  ) {
    return GoalPredicate.empty();
  }
  const builder = GoalPredicate.composite();
  if (p.allowed_dexes && p.allowed_dexes.length > 0) {
    builder.onlyOnDexes(p.allowed_dexes.map((s) => new PublicKey(s)));
  }
  if (p.time_window) {
    builder.withinTimeWindow(p.time_window.start_unix, p.time_window.end_unix);
  }
  if (p.price_below_usd) {
    builder.belowPriceUSD(
      new PublicKey(p.price_below_usd.token_mint),
      BigInt(Math.floor(p.price_below_usd.threshold_usd_micros)),
      new PublicKey(p.price_below_usd.pyth_oracle)
    );
  }
  return builder.build();
}

export async function deriveChildIntent(config: Config, args: Args) {
  let parentPda: PublicKey;
  let childAgent: PublicKey;
  try {
    parentPda = new PublicKey(args.parent_intent);
    childAgent = new PublicKey(args.child_agent);
  } catch (e: any) {
    return {
      content: [{ type: "text" as const, text: `Invalid pubkey arg: ${e?.message ?? e}` }],
      isError: true,
    };
  }

  // Verify the MCP keypair is the parent's authorized agent.
  const parent = await fetchIntentByPda(config.fuinV2.program, parentPda);
  if (!parent) {
    return {
      content: [
        { type: "text" as const, text: `Parent intent not found at ${parentPda.toBase58()}` },
      ],
      isError: true,
    };
  }
  if (!parent.account.agent.equals(config.keypair.publicKey)) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            `Cannot derive child: MCP keypair (${config.keypair.publicKey.toBase58()}) ` +
            `is not the parent intent's agent (${parent.account.agent.toBase58()}). ` +
            `Only the parent's agent can sign a derive_child_intent.`,
        },
      ],
      isError: true,
    };
  }

  let predicate;
  try {
    predicate = buildPredicate(args.predicate);
  } catch (e: any) {
    return {
      content: [
        { type: "text" as const, text: `Invalid predicate: ${e?.message ?? e}` },
      ],
      isError: true,
    };
  }

  try {
    const { pda, sig } = await config.fuinV2.deriveChildIntent({
      parentAgent: config.keypair,
      parent: parentPda,
      childAgent,
      predicate,
      budget: BigInt(Math.floor(args.budget)),
      expiresAt: BigInt(Math.floor(args.expires_at_unix)),
      nonce: args.child_nonce ?? Date.now(),
    });

    const cluster = config.connection.rpcEndpoint.includes("devnet")
      ? "devnet"
      : config.connection.rpcEndpoint.includes("mainnet")
        ? "mainnet-beta"
        : "custom";
    const explorerUrl =
      cluster === "custom"
        ? `https://explorer.solana.com/tx/${sig}`
        : `https://explorer.solana.com/tx/${sig}?cluster=${cluster}`;

    const scope = args.predicate.read_only
      ? "READ-ONLY"
      : [
          args.predicate.allowed_dexes?.length
            ? `dex=[${args.predicate.allowed_dexes.length} program(s)]`
            : null,
          args.predicate.time_window ? "time-windowed" : null,
          args.predicate.price_below_usd ? "price-bound" : null,
        ]
          .filter(Boolean)
          .join(", ") || "(empty — inherits parent only)";

    const text = [
      `Child intent derived!`,
      ``,
      `Child PDA:     ${pda.toBase58()}`,
      `Parent:        ${parentPda.toBase58()}`,
      `Child agent:   ${childAgent.toBase58()}`,
      `Budget:        ${args.budget}`,
      `Expires:       ${new Date(args.expires_at_unix * 1000).toISOString()}`,
      `Scope:         ${scope}`,
      `Transaction:   ${sig}`,
      `Explorer:      ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    const msg = (error?.message ?? String(error)).split("\n")[0];
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to derive child intent: ${msg}`,
        },
      ],
      isError: true,
    };
  }
}
