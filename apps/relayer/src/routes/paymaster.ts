import { Hono } from "hono";
import type { Context } from "hono";
import { Transaction } from "@solana/web3.js";
import { z } from "zod";
import { explainError } from "../errors.js";
import type { RelayerConfig } from "../config.js";

const signAndSubmitBody = z.object({
  serializedTx: z.string(),
});

function clusterFromEndpoint(endpoint: string): "devnet" | "mainnet-beta" | "custom" {
  if (endpoint.includes("devnet")) return "devnet";
  if (endpoint.includes("mainnet")) return "mainnet-beta";
  return "custom";
}

export function paymasterRoutes(config: RelayerConfig): Hono {
  const r = new Hono();

  r.get("/info", (c: Context) => {
    return c.json({
      feePayer: config.funder.publicKey.toBase58(),
      programId: config.programId.toBase58(),
      cluster: clusterFromEndpoint(config.connection.rpcEndpoint),
    });
  });

  r.post("/sign-and-submit", async (c: Context) => {
    const parsed = signAndSubmitBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: "bad_request", issues: parsed.error.issues }, 400);
    }
    const { serializedTx } = parsed.data;

    let tx: Transaction;
    try {
      const buf = Buffer.from(serializedTx, "base64");
      tx = Transaction.from(buf);
    } catch (e: any) {
      return c.json(
        { error: "bad_serialized_tx", message: e?.message ?? String(e) },
        400
      );
    }

    if (!tx.feePayer || !tx.feePayer.equals(config.funder.publicKey)) {
      return c.json(
        {
          error: "fee_payer_mismatch",
          message: `Expected feePayer ${config.funder.publicKey.toBase58()}, got ${tx.feePayer?.toBase58() ?? "none"}`,
        },
        400
      );
    }

    const funderSlot = tx.signatures.find((s) =>
      s.publicKey.equals(config.funder.publicKey)
    );
    if (!funderSlot) {
      return c.json(
        {
          error: "funder_not_required_signer",
          message: `Funder ${config.funder.publicKey.toBase58()} is not in the tx's required-signers list`,
        },
        400
      );
    }

    try {
      tx.partialSign(config.funder);
    } catch (e: any) {
      return c.json(
        { error: "partial_sign_failed", message: e?.message ?? String(e) },
        500
      );
    }

    let sig: string;
    try {
      sig = await config.connection.sendRawTransaction(tx.serialize());
      await config.connection.confirmTransaction(sig, "confirmed");
    } catch (e) {
      const err = explainError(e);
      return c.json(
        { error: "submit_failed", reason: err.reason, raw: err.raw },
        500
      );
    }

    return c.json({ sig });
  });

  return r;
}
