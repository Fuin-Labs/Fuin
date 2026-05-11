import { Hono } from "hono";
import type { Context } from "hono";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { z } from "zod";
import { ACTOR_NAMES, Keystore, type ActorName } from "../keystore.js";
import { makeFuin } from "../fuin.js";
import { explainError } from "../errors.js";
import type { RelayerConfig } from "../config.js";
import type { Idl } from "@coral-xyz/anchor";
import type { Fuin } from "@fuin-labs/sdk-v2";

const actorName = z.enum(ACTOR_NAMES as unknown as [ActorName, ...ActorName[]]);

const verifySplBody = z.object({
  as: actorName,
  intent_pda: z.string(),
  mint: z.string(),
  destination: z.string(),
  amount: z.coerce.bigint(),
  token_program: z.string().optional(),
  expect_rejection: z.boolean().optional(),
});

async function walkAncestors(fuin: Fuin, pda: PublicKey): Promise<PublicKey[]> {
  const ancestors: PublicKey[] = [];
  let current = pda;
  while (true) {
    const acc = await fuin.fetchIntent(current);
    if (!acc.parentIntent) break;
    ancestors.push(acc.parentIntent);
    current = acc.parentIntent;
  }
  return ancestors;
}

export function actionsRoutes(config: RelayerConfig, keystore: Keystore, idl: Idl): Hono {
  const r = new Hono();

  r.post("/verify-spl", async (c: Context) => {
    const parsed = verifySplBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json({ error: "bad_request", issues: parsed.error.issues }, 400);
    const { as, intent_pda, mint, destination, amount, token_program, expect_rejection } = parsed.data;

    let intentPda: PublicKey, mintPk: PublicKey, dest: PublicKey, tokenProgram: PublicKey;
    try {
      intentPda = new PublicKey(intent_pda);
      mintPk = new PublicKey(mint);
      dest = new PublicKey(destination);
      tokenProgram = token_program ? new PublicKey(token_program) : TOKEN_PROGRAM_ID;
    } catch (e: any) {
      return c.json({ error: "bad_pubkey", message: e?.message ?? String(e) }, 400);
    }

    const agent = keystore.getKeypair(as);
    const fuin = makeFuin(config.connection, agent, idl, config.programId);

    // confirm agent matches intent
    let intent;
    try {
      intent = await fuin.fetchIntent(intentPda);
    } catch (e: any) {
      return c.json({ error: "intent_fetch_failed", message: e?.message ?? String(e) }, 404);
    }
    if (!intent.agent.equals(agent.publicKey)) {
      return c.json(
        {
          error: "agent_mismatch",
          message: `intent ${intentPda.toBase58()} is assigned to ${intent.agent.toBase58()}, but actor '${as}' is ${agent.publicKey.toBase58()}.`,
        },
        400
      );
    }

    let ancestors: PublicKey[];
    try {
      ancestors = await walkAncestors(fuin, intentPda);
    } catch (e: any) {
      return c.json({ error: "ancestor_walk_failed", message: e?.message ?? String(e) }, 500);
    }

    let decimals: number;
    try {
      const mintInfo = await getMint(config.connection, mintPk, "confirmed", tokenProgram);
      decimals = mintInfo.decimals;
    } catch (e: any) {
      return c.json(
        {
          error: "mint_fetch_failed",
          message: `Could not fetch mint ${mint} (token_program=${tokenProgram.toBase58()}): ${e?.message ?? e}`,
        },
        400
      );
    }

    const sourceAta = getAssociatedTokenAddressSync(mintPk, agent.publicKey, false, tokenProgram);
    const destAta = getAssociatedTokenAddressSync(mintPk, dest, false, tokenProgram);

    const actionIx = createTransferCheckedInstruction(
      sourceAta,
      mintPk,
      destAta,
      agent.publicKey,
      amount,
      decimals,
      [],
      tokenProgram
    );

    try {
      const sig = await fuin.sendVerifiedAction({
        agent,
        intent: intentPda,
        ancestors,
        actionIx,
      });
      return c.json({
        ok: true,
        sig,
        intent: intentPda.toBase58(),
        agent_actor: as,
        ancestors: ancestors.map((a) => a.toBase58()),
        sourceAta: sourceAta.toBase58(),
        destAta: destAta.toBase58(),
      });
    } catch (e) {
      const err = explainError(e);
      return c.json(
        {
          rejected: true,
          reason: err.reason,
          raw: err.raw,
          intent: intentPda.toBase58(),
          agent_actor: as,
          ancestors: ancestors.map((a) => a.toBase58()),
          expected: !!expect_rejection,
        },
        200
      );
    }
  });

  return r;
}
