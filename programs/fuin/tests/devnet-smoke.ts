// Devnet smoke — sign root, derive one child, no airdrops (deployer funds).
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Fuin } from "../target/types/fuin";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { assert } from "chai";

const PRED_DEX = 0b0010;
const PRED_TIME = 0b0100;
const PRED_READ_ONLY = 0b1000;
const JUPITER = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

function emptyPredicate() {
  return {
    flags: 0,
    priceToken: PublicKey.default,
    priceThresholdUsdMicros: new anchor.BN(0),
    priceOracle: PublicKey.default,
    allowedDexes: [] as PublicKey[],
    timeStartTs: new anchor.BN(0),
    timeEndTs: new anchor.BN(0),
  };
}

function deriveIntentPda(
  programId: PublicKey,
  user: PublicKey,
  agent: PublicKey,
  nonce: anchor.BN
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("intent"),
      user.toBuffer(),
      agent.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
}

async function fundFromDeployer(
  provider: anchor.AnchorProvider,
  to: PublicKey,
  lamports: number
) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: to,
      lamports,
    })
  );
  return provider.sendAndConfirm(tx);
}

describe("fuin v2 — devnet smoke", function () {
  this.timeout(180_000);
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Fuin as Program<Fuin>;

  it("signs root intent + derives 1 child on devnet", async () => {
    const user = Keypair.generate();
    const orchestrator = Keypair.generate();
    const research = Keypair.generate();

    // Each agent needs ~0.05 SOL for rent + tx fees.
    await fundFromDeployer(provider, user.publicKey, 0.06 * LAMPORTS_PER_SOL);
    await fundFromDeployer(provider, orchestrator.publicKey, 0.06 * LAMPORTS_PER_SOL);

    const now = Math.floor(Date.now() / 1000);
    const rootNonce = new anchor.BN(Date.now()); // unique
    const [rootIntent] = deriveIntentPda(
      program.programId,
      user.publicKey,
      orchestrator.publicKey,
      rootNonce
    );

    const sigRoot = await program.methods
      .signRootIntent(
        rootNonce,
        {
          ...emptyPredicate(),
          flags: PRED_DEX | PRED_TIME,
          allowedDexes: [JUPITER],
          timeStartTs: new anchor.BN(now - 3600),
          timeEndTs: new anchor.BN(now + 24 * 3600),
        },
        new anchor.BN(500_000_000),
        new anchor.BN(now + 24 * 3600)
      )
      .accountsStrict({
        user: user.publicKey,
        agent: orchestrator.publicKey,
        intent: rootIntent,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    console.log("    root sig:", sigRoot);

    const root = await program.account.intent.fetch(rootIntent);
    assert.equal(root.user.toBase58(), user.publicKey.toBase58());
    assert.equal(root.budget.toString(), "500000000");
    assert.equal(root.depth, 0);

    // Child: read-only, $50.
    const childNonce = new anchor.BN(1);
    const [childIntent] = deriveIntentPda(
      program.programId,
      user.publicKey,
      research.publicKey,
      childNonce
    );

    const sigChild = await program.methods
      .deriveChildIntent(
        childNonce,
        { ...emptyPredicate(), flags: PRED_READ_ONLY },
        new anchor.BN(50_000_000),
        new anchor.BN(now + 23 * 3600)
      )
      .accountsStrict({
        parentAgent: orchestrator.publicKey,
        parentIntent: rootIntent,
        childAgent: research.publicKey,
        childIntent,
        systemProgram: SystemProgram.programId,
      })
      .signers([orchestrator])
      .rpc();
    console.log("    child sig:", sigChild);

    const child = await program.account.intent.fetch(childIntent);
    assert.equal(child.depth, 1);
    assert.equal(child.parentIntent!.toBase58(), rootIntent.toBase58());
    assert.equal(child.budget.toString(), "50000000");

    const rootAfter = await program.account.intent.fetch(rootIntent);
    assert.equal(rootAfter.remainingBudget.toString(), "450000000");

    console.log("    root pda:", rootIntent.toBase58());
    console.log("    child pda:", childIntent.toBase58());
    console.log(
      `    explorer: https://explorer.solana.com/address/${rootIntent.toBase58()}?cluster=devnet`
    );
  });
});
