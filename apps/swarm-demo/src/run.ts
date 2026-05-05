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
  SYSVAR_INSTRUCTIONS_PUBKEY,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Fuin,
  FUIN_V2_PROGRAM_ID,
  GoalPredicate,
  PRED_DEX,
  deriveIntentPda,
} from "@fuin-labs/sdk-v2";
import * as fs from "node:fs";
import * as path from "node:path";

const JUPITER = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
const RAYDIUM = new PublicKey(
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
);
const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const cluster = (process.argv[2] ?? "devnet") as "devnet" | "localnet";
const RPC_URL =
  cluster === "localnet"
    ? "http://127.0.0.1:8899"
    : "https://api.devnet.solana.com";

function box(title: string) {
  const line = "─".repeat(Math.max(60, title.length + 4));
  console.log(`\n${line}\n  ${title}\n${line}`);
}

function arrow(label: string, val: string) {
  console.log(`  ${label.padEnd(18)}→ ${val}`);
}

async function loadDeployerWallet(): Promise<Keypair> {
  const home = process.env.HOME ?? "";
  const p = path.join(home, ".config", "solana", "id.json");
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function fund(
  conn: Connection,
  payer: Keypair,
  to: PublicKey,
  sol: number
) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: to,
      lamports: Math.floor(sol * LAMPORTS_PER_SOL),
    })
  );
  return sendAndConfirmTransaction(conn, tx, [payer]);
}

async function loadIdl(): Promise<anchor.Idl> {
  const idlPath = path.resolve(
    process.cwd(),
    "../../programs/fuin/target/idl/fuin.json"
  );
  return JSON.parse(fs.readFileSync(idlPath, "utf8")) as anchor.Idl;
}

async function main() {
  box(`Fuin v2 swarm demo — ${cluster}`);
  arrow("program", FUIN_V2_PROGRAM_ID.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");
  const deployer = await loadDeployerWallet();
  const wallet = new anchor.Wallet(deployer);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const idl = await loadIdl();
  const fuin = new Fuin({ provider, idl });

  // 4 fresh keypairs — one signer per role.
  const user = Keypair.generate();
  const orchestrator = Keypair.generate();
  const research = Keypair.generate();
  const executeAgent = Keypair.generate();
  const audit = Keypair.generate();

  // Each needs ~0.05 SOL for rent + fees. Fund from deployer.
  for (const [name, kp] of Object.entries({
    user,
    orchestrator,
    research,
    executeAgent,
    audit,
  })) {
    await fund(connection, deployer, kp.publicKey, 0.06);
    arrow(`fund ${name}`, kp.publicKey.toBase58());
  }

  const now = Math.floor(Date.now() / 1000);

  // ── Step 1: user signs root intent ──────────────────────────────────────
  box("Step 1 — User signs ROOT intent");
  const rootPredicate = GoalPredicate.composite()
    .onlyOnDexes([JUPITER])
    .withinTimeWindow(now - 3600, now + 24 * 3600)
    .build();

  const rootNonce = Date.now();
  const { pda: rootPda, sig: rootSig } = await fuin.signRootIntent({
    user,
    agent: orchestrator.publicKey,
    predicate: rootPredicate,
    budget: 500_000_000n, // 500 USDC at 6dp
    expiresAt: BigInt(now + 24 * 3600),
    nonce: rootNonce,
  });
  arrow("root pda", rootPda.toBase58());
  arrow("root sig", rootSig);
  arrow("budget", "500 USDC");
  arrow("scope", "DEX=Jupiter, time-windowed 24h");

  // ── Step 2: orchestrator spawns 3 sub-agents ────────────────────────────
  box("Step 2 — Orchestrator spawns 3 sub-agents");

  const researchExp = BigInt(now + 23 * 3600);
  const { pda: researchPda, sig: researchSig } = await fuin.deriveChildIntent({
    parentAgent: orchestrator,
    parent: rootPda,
    childAgent: research.publicKey,
    predicate: GoalPredicate.readOnly(),
    budget: 50_000_000n,
    expiresAt: researchExp,
    nonce: 1,
  });
  arrow("research pda", researchPda.toBase58());
  arrow("research sig", researchSig);
  arrow("scope", "read-only, $50");

  const { pda: executePda, sig: executeSig } = await fuin.deriveChildIntent({
    parentAgent: orchestrator,
    parent: rootPda,
    childAgent: executeAgent.publicKey,
    predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
    budget: 400_000_000n,
    expiresAt: researchExp,
    nonce: 2,
  });
  arrow("execute pda", executePda.toBase58());
  arrow("execute sig", executeSig);
  arrow("scope", "Jupiter only, $400");

  const { pda: auditPda, sig: auditSig } = await fuin.deriveChildIntent({
    parentAgent: orchestrator,
    parent: rootPda,
    childAgent: audit.publicKey,
    predicate: GoalPredicate.readOnly(),
    budget: 50_000_000n,
    expiresAt: researchExp,
    nonce: 3,
  });
  arrow("audit pda", auditPda.toBase58());
  arrow("audit sig", auditSig);
  arrow("scope", "read-only, $50");

  const rootAfter = await fuin.fetchIntent(rootPda);
  arrow("root remaining", `${rootAfter.remainingBudget} (carved-out)`);

  // ── Step 3: orchestrator tries to spawn an out-of-scope 4th sub-agent ──
  box("Step 3 — Boundary attempt: 4th sub-agent on Raydium");
  console.log("  Orchestrator tries to derive a child whose predicate would");
  console.log("  allow Raydium. Derive succeeds (parent attests by signing tx),");
  console.log("  but at action time, parent's DEX=Jupiter rejects Raydium.");

  // Fresh small parent so we have budget for this 4th attempt.
  const subUser = Keypair.generate();
  const subOrch = Keypair.generate();
  const rogue = Keypair.generate();
  for (const k of [subUser, subOrch, rogue]) {
    await fund(connection, deployer, k.publicKey, 0.06);
  }
  const { pda: subRootPda } = await fuin.signRootIntent({
    user: subUser,
    agent: subOrch.publicKey,
    predicate: GoalPredicate.composite().onlyOnDexes([JUPITER]).build(),
    budget: 100_000_000n,
    expiresAt: BigInt(now + 3600),
    nonce: Date.now() + 1,
  });
  const { pda: roguePda } = await fuin.deriveChildIntent({
    parentAgent: subOrch,
    parent: subRootPda,
    childAgent: rogue.publicKey,
    // Empty predicate at child level (would let anything through)
    predicate: GoalPredicate.empty(),
    budget: 50_000_000n,
    expiresAt: BigInt(now + 1800),
    nonce: 1,
  });
  arrow("rogue child pda", roguePda.toBase58());

  // Rogue agent attempts an SPL transfer. Child predicate is empty → would
  // accept. Parent has DEX=Jupiter → SPL_TOKEN_PROGRAM is not Jupiter → rejects.
  const fakeSrc = Keypair.generate().publicKey;
  const fakeDst = Keypair.generate().publicKey;
  const splIx = new TransactionInstruction({
    programId: SPL_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: fakeSrc, isSigner: false, isWritable: true },
      { pubkey: fakeDst, isSigner: false, isWritable: true },
      { pubkey: rogue.publicKey, isSigner: true, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([3]),
      new BN(1).toArrayLike(Buffer, "le", 8),
    ]),
  });

  try {
    await fuin.sendVerifiedAction({
      agent: rogue,
      intent: roguePda,
      ancestors: [subRootPda],
      actionIx: splIx,
    });
    console.log("  ⚠  unexpected success — boundary check missed");
  } catch (e: any) {
    arrow("verify", "REJECTED ✓");
    const msg = (e?.message ?? String(e)).split("\n")[0];
    arrow("reason", msg.slice(0, 80));
  }

  box("Done");
  arrow("explorer", `https://explorer.solana.com/address/${rootPda.toBase58()}?cluster=${cluster === "devnet" ? "devnet" : "custom"}`);
  console.log("");
}

main().catch((e) => {
  console.error("\nFAILED:", e?.message ?? e);
  process.exit(1);
});
