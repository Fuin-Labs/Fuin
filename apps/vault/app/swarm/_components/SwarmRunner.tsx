"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { runSwarmDemo } from "../_lib/flow";
import { StepCard } from "./StepCard";
import type { StepEvent, StepId } from "../_lib/types";

const STEP_ORDER: StepId[] = [
  "fund",
  "sign-root",
  "derive-research",
  "derive-execute",
  "derive-audit",
  "rogue-reject",
];

function initialEvents(): Record<StepId, StepEvent> {
  return {
    "fund": { id: "fund", status: "pending" },
    "sign-root": { id: "sign-root", status: "pending" },
    "derive-research": { id: "derive-research", status: "pending" },
    "derive-execute": { id: "derive-execute", status: "pending" },
    "derive-audit": { id: "derive-audit", status: "pending" },
    "rogue-reject": { id: "rogue-reject", status: "pending" },
  };
}

export function SwarmRunner() {
  useEffect(() => {
    document.body.classList.add("v2");
    document.body.classList.remove("fuin-manifesto");
    return () => {
      document.body.classList.remove("v2");
      document.body.classList.add("fuin-manifesto");
    };
  }, []);

  const { connection } = useConnection();
  const wallet = useWallet();
  const [events, setEvents] = useState<Record<StepId, StepEvent>>(initialEvents);
  const [running, setRunning] = useState(false);
  const [rootPda, setRootPda] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const canRun = wallet.connected && !running;

  async function onRun() {
    setEvents(initialEvents());
    setRootPda(null);
    setFatal(null);
    setRunning(true);
    try {
      const gen = runSwarmDemo({ connection, funder: wallet });
      let result: { rootPda: string } | undefined;
      while (true) {
        const next = await gen.next();
        if (next.done) {
          result = next.value;
          break;
        }
        const ev = next.value;
        setEvents((prev) => ({ ...prev, [ev.id]: ev }));
      }
      if (result) setRootPda(result.rootPda);
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      setFatal(msg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="t-display">Fuin v2 — swarm demo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--cream-soft)" }}>
          Connect a devnet wallet. One funding tx, eight ephemeral keypairs,
          then watch the proof-of-intent flow land on-chain — ending with the
          rogue ix bouncing off <code>verify_authorizes</code>.
        </p>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <WalletMultiButton />
        <button
          onClick={onRun}
          disabled={!canRun}
          className="px-4 py-2 border rounded-md disabled:opacity-40"
          style={{ borderColor: "var(--cream)" }}
        >
          {running ? "Running…" : "▶ Run swarm demo"}
        </button>
      </div>

      {!wallet.connected && (
        <p className="text-xs mb-4" style={{ color: "var(--cream-soft)" }}>
          Connect a devnet wallet to begin.
        </p>
      )}

      <section>
        {STEP_ORDER.map((id) => (
          <StepCard key={id} event={events[id]} />
        ))}
      </section>

      {fatal && (
        <div
          className="mt-4 text-xs"
          style={{ color: "var(--accent-danger, #e07a7a)" }}
        >
          fatal: {fatal}
        </div>
      )}

      {rootPda && (
        <div className="mt-8">
          <Link
            href={`/audit/${rootPda}`}
            className="underline"
            style={{ color: "var(--cream)" }}
          >
            Open audit view →
          </Link>
        </div>
      )}
    </main>
  );
}
