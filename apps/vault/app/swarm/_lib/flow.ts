import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Fuin } from "@fuin-labs/sdk-v2";
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
  } catch (e: any) {
    yield { id: "fund", status: "failed", error: e?.message ?? String(e) };
    throw e;
  }
  yield { id: "fund", status: "ok", sig: fundSig };

  // ── Steps 2–4 are added in subsequent tasks ─────────────────────────────
  throw new Error("flow not yet implemented past funding");
}
