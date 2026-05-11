import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { fetchIntentByPda, walkAncestorChain } from "../accounts.js";
import type { Config } from "../config.js";

export const transferSplVerifiedSchema = {
  intent: z
    .string()
    .describe(
      "Intent PDA (base58) authorizing this transfer. The MCP keypair must be this intent's `agent`."
    ),
  mint: z.string().describe("SPL token mint address (base58)"),
  destination: z
    .string()
    .describe(
      "Destination wallet public key (base58). The associated token account will be auto-derived."
    ),
  amount: z.coerce
    .number()
    .positive()
    .describe("Amount in smallest token units (e.g. 1_000_000 for 1.0 USDC at 6 decimals)"),
  token_program: z
    .string()
    .optional()
    .describe(
      `Token program ID (base58). Defaults to SPL Token (${TOKEN_PROGRAM_ID.toBase58()}). Use Token-2022 (${TOKEN_2022_PROGRAM_ID.toBase58()}) for Token-2022 mints.`
    ),
};

const V2_ERROR_HINTS: Array<{ match: RegExp; msg: string }> = [
  { match: /IntentRevoked/, msg: "Intent has been revoked by the user." },
  { match: /IntentExpired/, msg: "Intent has expired (past expires_at)." },
  { match: /IntentBudgetExceeded/, msg: "Action would exceed the intent's remaining budget." },
  { match: /AgentMismatch/, msg: "MCP keypair is not this intent's authorized agent." },
  { match: /UserMismatch/, msg: "Ancestor chain has a user mismatch — chain is corrupt or wrong intent passed." },
  { match: /PredicateDexViolation/, msg: "Action targets a program not in the predicate's allowed-DEX list." },
  { match: /PredicateTimeViolation/, msg: "Current time is outside the predicate's allowed time window." },
  { match: /PredicatePriceViolation/, msg: "Token price is above the predicate's USD threshold." },
  { match: /PredicateReadOnlyViolation/, msg: "Predicate is read-only — no spend actions allowed." },
  { match: /ActionUnsupported/, msg: "Action ix is not a recognized SPL transfer or Jupiter v6 route." },
  { match: /ActionParseFailed/, msg: "Action ix could not be parsed by the on-chain descriptor parser." },
  { match: /InvalidActionIndex/, msg: "verify_authorizes target_ix_index points outside the transaction." },
  { match: /AncestorChainTooShort/, msg: "Not enough ancestor PDAs passed in remaining_accounts." },
];

function explainError(error: any): string {
  const msg = error?.message ?? String(error);
  for (const { match, msg: hint } of V2_ERROR_HINTS) {
    if (match.test(msg)) return hint;
  }
  return msg.split("\n")[0] ?? msg;
}

export async function transferSplVerified(
  config: Config,
  args: {
    intent: string;
    mint: string;
    destination: string;
    amount: number;
    token_program?: string;
  }
) {
  let intentPda: PublicKey;
  let mint: PublicKey;
  let destinationWallet: PublicKey;
  let tokenProgram: PublicKey;
  try {
    intentPda = new PublicKey(args.intent);
    mint = new PublicKey(args.mint);
    destinationWallet = new PublicKey(args.destination);
    tokenProgram = args.token_program ? new PublicKey(args.token_program) : TOKEN_PROGRAM_ID;
  } catch (e: any) {
    return {
      content: [{ type: "text" as const, text: `Invalid pubkey arg: ${e?.message ?? e}` }],
      isError: true,
    };
  }

  const agent = config.keypair;

  // 1. Verify intent exists and this keypair is the authorized agent.
  const intent = await fetchIntentByPda(config.fuinV2.program, intentPda);
  if (!intent) {
    return {
      content: [{ type: "text" as const, text: `Intent not found at ${intentPda.toBase58()}` }],
      isError: true,
    };
  }
  if (!intent.account.agent.equals(agent.publicKey)) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            `Agent mismatch: intent ${intentPda.toBase58()} is assigned to ` +
            `${intent.account.agent.toBase58()}, but MCP keypair is ${agent.publicKey.toBase58()}.`,
        },
      ],
      isError: true,
    };
  }

  // 2. Walk ancestor chain (excludes the intent itself; root last).
  let ancestors: PublicKey[];
  try {
    ancestors = await walkAncestorChain(config.fuinV2.program, intentPda);
  } catch (e: any) {
    return {
      content: [{ type: "text" as const, text: `Ancestor walk failed: ${e?.message ?? e}` }],
      isError: true,
    };
  }

  // 3. Look up mint decimals for TransferChecked.
  let decimals: number;
  try {
    const mintInfo = await getMint(config.connection, mint, "confirmed", tokenProgram);
    decimals = mintInfo.decimals;
  } catch (e: any) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            `Could not fetch mint ${mint.toBase58()} (token_program=${tokenProgram.toBase58()}): ` +
            `${e?.message ?? e}`,
        },
      ],
      isError: true,
    };
  }

  // 4. Derive source + destination ATAs.
  const sourceAta = getAssociatedTokenAddressSync(mint, agent.publicKey, false, tokenProgram);
  const destAta = getAssociatedTokenAddressSync(mint, destinationWallet, false, tokenProgram);

  // 5. Build the action ix (SPL TransferChecked).
  const actionIx = createTransferCheckedInstruction(
    sourceAta,
    mint,
    destAta,
    agent.publicKey,
    BigInt(args.amount),
    decimals,
    [],
    tokenProgram
  );

  // 6. Send verify_authorizes(ix0) + actionIx(ix1) atomically.
  try {
    const sig = await config.fuinV2.sendVerifiedAction({
      agent,
      intent: intentPda,
      ancestors,
      actionIx,
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

    const text = [
      `Verified SPL transfer succeeded!`,
      ``,
      `Intent:        ${intentPda.toBase58()}`,
      `Agent:         ${agent.publicKey.toBase58()}`,
      `Mint:          ${args.mint} (${decimals} decimals)`,
      `Source ATA:    ${sourceAta.toBase58()}`,
      `Dest wallet:   ${args.destination}`,
      `Dest ATA:      ${destAta.toBase58()}`,
      `Amount:        ${args.amount}`,
      `Ancestors:     ${ancestors.length}`,
      `Transaction:   ${sig}`,
      `Explorer:      ${explorerUrl}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  } catch (error: any) {
    const explanation = explainError(error);
    const text = [
      `Verified SPL transfer FAILED: ${explanation}`,
      ``,
      `Details:`,
      `  Intent:    ${intentPda.toBase58()}`,
      `  Mint:      ${args.mint}`,
      `  Source:    ${sourceAta.toBase58()}`,
      `  Dest ATA:  ${destAta.toBase58()}`,
      `  Amount:    ${args.amount}`,
      `  Ancestors: ${ancestors.map((a) => a.toBase58()).join(", ") || "(root has no ancestors)"}`,
    ].join("\n");
    return { content: [{ type: "text" as const, text }], isError: true };
  }
}
