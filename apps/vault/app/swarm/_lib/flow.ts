import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Fuin, GoalPredicate, GoalPredicateData } from "@fuin-labs/sdk-v2";

const JUPITER = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
const SPL_TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
import { FUIN_IDL } from "./idl";
import type { StepEvent, SwarmRunResult } from "./types";

const FUND_SOL_PER_KEY = 0.06;

interface Roles {
  user: Keypair;
  orchestrator: Keypair;
  research: Keypair;
  executeAgent: Keypair;
  audit: Keypair;
  subUser: Keypair;
  subOrch: Keypair;
  rogue: Keypair;
}

function buildRoles(): Roles {
  return {
    user: Keypair.generate(),
    orchestrator: Keypair.generate(),
    research: Keypair.generate(),
    executeAgent: Keypair.generate(),
    audit: Keypair.generate(),
    subUser: Keypair.generate(),
    subOrch: Keypair.generate(),
    rogue: Keypair.generate(),
  };
}

function makeProvider(connection: Connection, payer: Keypair): anchor.AnchorProvider {
  const wallet = new anchor.Wallet(payer);
  return new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

function makeFuin(connection: Connection, payer: Keypair): Fuin {
  return new Fuin({ provider: makeProvider(connection, payer), idl: FUIN_IDL });
}

async function fundAllInOneTx(
  connection: Connection,
  funder: WalletContextState,
  roles: Roles
): Promise<string> {
  if (!funder.publicKey || !funder.signTransaction) {
    throw new Error("wallet not connected");
  }
  const lamports = Math.floor(FUND_SOL_PER_KEY * LAMPORTS_PER_SOL);
  const targets = [
    roles.user, roles.orchestrator,
    roles.research, roles.executeAgent, roles.audit,
    roles.subUser, roles.subOrch, roles.rogue,
  ].map((kp) => kp.publicKey);

  const tx = new Transaction();
  for (const to of targets) {
    tx.add(SystemProgram.transfer({
      fromPubkey: funder.publicKey,
      toPubkey: to,
      lamports,
    }));
  }
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = funder.publicKey;

  const signed = await funder.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
  return sig;
}

async function deriveChild(args: {
  connection: Connection;
  parentAgent: Keypair;
  parent: PublicKey;
  childAgent: PublicKey;
  predicate: GoalPredicateData;
  budgetMicros: bigint;
  expiresAt: bigint;
  nonce: number;
}): Promise<{ pda: PublicKey; sig: string }> {
  const fuin = makeFuin(args.connection, args.parentAgent);
  return fuin.deriveChildIntent({
    parentAgent: args.parentAgent,
    parent: args.parent,
    childAgent: args.childAgent,
    predicate: args.predicate,
    budget: args.budgetMicros,
    expiresAt: args.expiresAt,
    nonce: args.nonce,
  });
}

const EXPECTED_REJECTION_MARKERS = [
  "predicate",
  "Predicate",
  "DexNotAllowed",
  "OutOfBounds",
  "ScopeViolation",
];

function isExpectedRejection(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? String(e);
  return EXPECTED_REJECTION_MARKERS.some((m) => msg.includes(m));
}

function firstLineOf(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  return (msg.split("\n")[0] ?? msg).slice(0, 120);
}

export async function* runSwarmDemo(args: {
  connection: Connection;
  funder: WalletContextState;
}): AsyncGenerator<StepEvent, SwarmRunResult> {
  const roles = buildRoles();

  // ── Step 1: fund ────────────────────────────────────────────────────────
  yield { id: "fund", status: "running" };
  let fundSig: string;
  try {
    fundSig = await fundAllInOneTx(args.connection, args.funder, roles);
  } catch (e) {
    yield { id: "fund", status: "failed", error: firstLineOf(e) };
    throw e;
  }
  yield { id: "fund", status: "ok", sig: fundSig };

  const now = Math.floor(Date.now() / 1000);

  // ── Step 2: user signs root intent ──────────────────────────────────────
  yield { id: "sign-root", status: "running" };
  let rootPda: PublicKey;
  let rootSig: string;
  try {
    const fuinAsUser = makeFuin(args.connection, roles.user);
    const rootPredicate = GoalPredicate.composite()
      .onlyOnDexes([JUPITER])
      .withinTimeWindow(now - 3600, now + 24 * 3600)
      .build();
    const rootNonce = Date.now();
    const out = await fuinAsUser.signRootIntent({
      user: roles.user,
      agent: roles.orchestrator.publicKey,
      predicate: rootPredicate,
      budget: 500_000_000n,
      expiresAt: BigInt(now + 24 * 3600),
      nonce: rootNonce,
    });
    rootPda = out.pda;
    rootSig = out.sig;
  } catch (e) {
    yield { id: "sign-root", status: "failed", error: firstLineOf(e) };
    throw e;
  }
  yield {
    id: "sign-root",
    status: "ok",
    pda: rootPda.toBase58(),
    sig: rootSig,
    scope: "Jupiter · 24h · 500 USDC",
  };

  const childExp = BigInt(now + 23 * 3600);

  // ── Step 3a: research (read-only, $50) ──────────────────────────────────
  yield { id: "derive-research", status: "running" };
  try {
    const r = await deriveChild({
      connection: args.connection,
      parentAgent: roles.orchestrator,
      parent: rootPda,
      childAgent: roles.research.publicKey,
      predicate: GoalPredicate.readOnly(),
      budgetMicros: 50_000_000n,
      expiresAt: childExp,
      nonce: 1,
    });
    yield {
      id: "derive-research",
      status: "ok",
      pda: r.pda.toBase58(),
      sig: r.sig,
      scope: "read-only · $50",
    };
  } catch (e) {
    yield { id: "derive-research", status: "failed", error: firstLineOf(e) };
    throw e;
  }

  // ── Step 3b: execute (Jupiter, $400) ────────────────────────────────────
  yield { id: "derive-execute", status: "running" };
  try {
    const r = await deriveChild({
      connection: args.connection,
      parentAgent: roles.orchestrator,
      parent: rootPda,
      childAgent: roles.executeAgent.publicKey,
      predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
      budgetMicros: 400_000_000n,
      expiresAt: childExp,
      nonce: 2,
    });
    yield {
      id: "derive-execute",
      status: "ok",
      pda: r.pda.toBase58(),
      sig: r.sig,
      scope: "Jupiter only · $400",
    };
  } catch (e) {
    yield { id: "derive-execute", status: "failed", error: firstLineOf(e) };
    throw e;
  }

  // ── Step 3c: audit (read-only, $50) ─────────────────────────────────────
  yield { id: "derive-audit", status: "running" };
  try {
    const r = await deriveChild({
      connection: args.connection,
      parentAgent: roles.orchestrator,
      parent: rootPda,
      childAgent: roles.audit.publicKey,
      predicate: GoalPredicate.readOnly(),
      budgetMicros: 50_000_000n,
      expiresAt: childExp,
      nonce: 3,
    });
    yield {
      id: "derive-audit",
      status: "ok",
      pda: r.pda.toBase58(),
      sig: r.sig,
      scope: "read-only · $50",
    };
  } catch (e) {
    yield { id: "derive-audit", status: "failed", error: firstLineOf(e) };
    throw e;
  }

  // ── Step 4: rogue boundary attempt ──────────────────────────────────────
  yield { id: "rogue-reject", status: "running" };
  try {
    const fuinAsSubUser = makeFuin(args.connection, roles.subUser);
    const subRoot = await fuinAsSubUser.signRootIntent({
      user: roles.subUser,
      agent: roles.subOrch.publicKey,
      predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
      budget: 100_000_000n,
      expiresAt: BigInt(now + 3600),
      nonce: Date.now() + 1,
    });

    const rogueChild = await deriveChild({
      connection: args.connection,
      parentAgent: roles.subOrch,
      parent: subRoot.pda,
      childAgent: roles.rogue.publicKey,
      predicate: GoalPredicate.empty(),
      budgetMicros: 50_000_000n,
      expiresAt: BigInt(now + 1800),
      nonce: 1,
    });

    const fakeSrc = Keypair.generate().publicKey;
    const fakeDst = Keypair.generate().publicKey;
    const splIx = new TransactionInstruction({
      programId: SPL_TOKEN_PROGRAM_ID,
      keys: [
        { pubkey: fakeSrc, isSigner: false, isWritable: true },
        { pubkey: fakeDst, isSigner: false, isWritable: true },
        { pubkey: roles.rogue.publicKey, isSigner: true, isWritable: false },
      ],
      data: Buffer.concat([Buffer.from([3]), new BN(1).toArrayLike(Buffer, "le", 8)]),
    });

    const fuinAsRogue = makeFuin(args.connection, roles.rogue);
    try {
      await fuinAsRogue.sendVerifiedAction({
        agent: roles.rogue,
        intent: rogueChild.pda,
        ancestors: [subRoot.pda],
        actionIx: splIx,
      });
      yield {
        id: "rogue-reject",
        status: "failed",
        error: "unexpected success — verify_authorizes did not reject the out-of-scope ix",
      };
    } catch (inner) {
      if (isExpectedRejection(inner)) {
        yield { id: "rogue-reject", status: "ok", reason: firstLineOf(inner) };
      } else {
        yield {
          id: "rogue-reject",
          status: "failed",
          error: firstLineOf(inner),
        };
      }
    }
  } catch (e) {
    yield { id: "rogue-reject", status: "failed", error: firstLineOf(e) };
  }

  return { rootPda: rootPda.toBase58() };
}
