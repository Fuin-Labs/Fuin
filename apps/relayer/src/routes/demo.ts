import { Hono } from "hono";
import type { Context } from "hono";
import { ACTOR_NAMES, Keystore } from "../keystore.js";
import { fundActors } from "../fuin.js";
import type { RelayerConfig } from "../config.js";

export function demoRoutes(config: RelayerConfig, keystore: Keystore): Hono {
  const r = new Hono();

  r.post("/init", async (c: Context) => {
    const body = await c.req.json().catch(() => ({})) as { fund_sol_per_actor?: number };
    const sol = body.fund_sol_per_actor ?? 0.06;
    if (keystore.isInitialized()) {
      return c.json(
        {
          error: "already_initialized",
          message: "Call /demo/reset first or use /demo/state to inspect.",
          state: keystore.getState(),
        },
        409
      );
    }
    const state = keystore.generate();
    const targets = ACTOR_NAMES.map((n) => keystore.getPubkey(n));
    try {
      const sig = await fundActors(config.connection, config.funder, targets, sol);
      keystore.setFundingSig(sig);
      return c.json({
        ok: true,
        actors: state.actors,
        fundingSig: sig,
        fundedPerActor: sol,
      });
    } catch (e: any) {
      keystore.reset();
      return c.json({ error: "funding_failed", message: e?.message ?? String(e) }, 500);
    }
  });

  r.post("/reset", (c: Context) => {
    keystore.reset();
    return c.json({ ok: true });
  });

  r.get("/state", (c: Context) => {
    if (!keystore.isInitialized()) {
      return c.json({ initialized: false }, 200);
    }
    const s = keystore.getState();
    return c.json({
      initialized: true,
      actors: Object.fromEntries(
        Object.entries(s.actors).map(([k, v]) => [k, { pubkey: v.pubkey }])
      ),
      intents: s.intents,
      fundingSig: s.fundingSig,
    });
  });

  return r;
}
