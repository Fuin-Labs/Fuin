import { Hono } from "hono";
import type { Context } from "hono";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { ACTOR_NAMES, Keystore, type ActorName } from "../keystore.js";
import { makeFuin } from "../fuin.js";
import { buildPredicate, describePredicate, type PredicateInput } from "../predicate.js";
import { explainError } from "../errors.js";
import type { RelayerConfig } from "../config.js";
import type { Idl } from "@coral-xyz/anchor";

const actorName = z.enum(ACTOR_NAMES as unknown as [ActorName, ...ActorName[]]);
const predicateSchema = z
  .object({
    dex: z.array(z.string()).optional(),
    time_window_hours: z.number().nonnegative().optional(),
    read_only: z.boolean().optional(),
    max_price_usd: z.number().nonnegative().optional(),
    price_token: z.string().optional(),
    price_oracle: z.string().optional(),
  })
  .strict()
  .optional();

const signRootBody = z.object({
  as: actorName,
  agent_actor: actorName,
  predicate: predicateSchema,
  budget: z.coerce.bigint(),
  expires_in_hours: z.number().positive(),
  nonce: z.coerce.bigint().optional(),
});

const deriveChildBody = z.object({
  as: actorName,
  parent_pda: z.string(),
  child_actor: actorName,
  predicate: predicateSchema,
  budget: z.coerce.bigint(),
  expires_in_hours: z.number().positive(),
  nonce: z.coerce.bigint().optional(),
});

const ROLE_BY_CHILD: Record<ActorName, "root" | "research" | "execute" | "audit" | "rogue"> = {
  user: "root",
  orchestrator: "root",
  research: "research",
  executeAgent: "execute",
  audit: "audit",
  rogue: "rogue",
};

export function intentsRoutes(config: RelayerConfig, keystore: Keystore, idl: Idl): Hono {
  const r = new Hono();

  r.post("/sign-root", async (c: Context) => {
    const parsed = signRootBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json({ error: "bad_request", issues: parsed.error.issues }, 400);
    const { as, agent_actor, predicate, budget, expires_in_hours, nonce } = parsed.data;

    const userKp = keystore.getKeypair(as);
    const agentPk = keystore.getPubkey(agent_actor);
    const fuin = makeFuin(config.connection, userKp, idl, config.programId);
    const predicateData = buildPredicate(predicate as PredicateInput | undefined);
    const now = Math.floor(Date.now() / 1000);

    try {
      const out = await fuin.signRootIntent({
        user: userKp,
        agent: agentPk,
        predicate: predicateData,
        budget,
        expiresAt: BigInt(now + expires_in_hours * 3600),
        nonce: nonce ?? BigInt(Date.now()),
      });
      keystore.recordIntent({
        pda: out.pda.toBase58(),
        role: "root",
        agent_actor,
      });
      return c.json({
        pda: out.pda.toBase58(),
        sig: out.sig,
        scope: describePredicate(predicate as PredicateInput | undefined),
        user_actor: as,
        agent_actor,
      });
    } catch (e) {
      const err = explainError(e);
      return c.json({ error: "sign_root_failed", reason: err.reason, raw: err.raw }, 500);
    }
  });

  r.post("/derive-child", async (c: Context) => {
    const parsed = deriveChildBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json({ error: "bad_request", issues: parsed.error.issues }, 400);
    const { as, parent_pda, child_actor, predicate, budget, expires_in_hours, nonce } = parsed.data;

    let parent: PublicKey;
    try {
      parent = new PublicKey(parent_pda);
    } catch {
      return c.json({ error: "bad_request", message: "parent_pda is not a valid pubkey" }, 400);
    }

    const parentAgentKp = keystore.getKeypair(as);
    const childAgentPk = keystore.getPubkey(child_actor);
    const fuin = makeFuin(config.connection, parentAgentKp, idl, config.programId);
    const predicateData = buildPredicate(predicate as PredicateInput | undefined);
    const now = Math.floor(Date.now() / 1000);

    try {
      const out = await fuin.deriveChildIntent({
        parentAgent: parentAgentKp,
        parent,
        childAgent: childAgentPk,
        predicate: predicateData,
        budget,
        expiresAt: BigInt(now + expires_in_hours * 3600),
        nonce: nonce ?? BigInt(Date.now()),
      });
      keystore.recordIntent({
        pda: out.pda.toBase58(),
        role: ROLE_BY_CHILD[child_actor],
        agent_actor: child_actor,
      });
      return c.json({
        pda: out.pda.toBase58(),
        sig: out.sig,
        scope: describePredicate(predicate as PredicateInput | undefined),
        parent: parent.toBase58(),
        child_actor,
      });
    } catch (e) {
      const err = explainError(e);
      return c.json({ error: "derive_child_failed", reason: err.reason, raw: err.raw }, 500);
    }
  });

  r.get("/by-agent/:pubkey", async (c: Context) => {
    const pubkeyStr = c.req.param("pubkey");
    let agentPk: PublicKey;
    try {
      agentPk = new PublicKey(pubkeyStr);
    } catch {
      return c.json({ error: "bad_pubkey" }, 400);
    }
    const fuin = makeFuin(config.connection, config.funder, idl, config.programId);
    const allIntents = keystore.isInitialized() ? keystore.getState().intents : [];
    const results: any[] = [];
    for (const rec of allIntents) {
      try {
        const acc = await fuin.fetchIntent(new PublicKey(rec.pda));
        if (acc.agent.equals(agentPk)) {
          results.push({
            pda: rec.pda,
            role: rec.role,
            agent_actor: rec.agent_actor,
            user: acc.user.toBase58(),
            parent: acc.parentIntent?.toBase58() ?? null,
            budget: acc.budget.toString(),
            remaining: acc.remainingBudget.toString(),
            expiresAt: acc.expiresAt.toString(),
            depth: acc.depth,
            revoked: acc.revoked,
          });
        }
      } catch {
        // intent maybe wiped on-chain; skip
      }
    }
    return c.json({ count: results.length, intents: results });
  });

  r.get("/:pda", async (c: Context) => {
    const pdaStr = c.req.param("pda");
    let pda: PublicKey;
    try {
      pda = new PublicKey(pdaStr);
    } catch {
      return c.json({ error: "bad_pubkey" }, 400);
    }
    const fuin = makeFuin(config.connection, config.funder, idl, config.programId);
    try {
      const acc = await fuin.fetchIntent(pda);
      const agentName = keystore.isInitialized() ? keystore.resolveAgentName(acc.agent) : null;
      return c.json({
        pda: pda.toBase58(),
        user: acc.user.toBase58(),
        agent: acc.agent.toBase58(),
        agent_actor: agentName,
        parent: acc.parentIntent?.toBase58() ?? null,
        budget: acc.budget.toString(),
        remaining: acc.remainingBudget.toString(),
        expiresAt: acc.expiresAt.toString(),
        depth: acc.depth,
        revoked: acc.revoked,
      });
    } catch (e: any) {
      return c.json({ error: "fetch_failed", message: e?.message ?? String(e) }, 404);
    }
  });

  return r;
}
