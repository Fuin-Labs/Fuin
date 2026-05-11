"use client";

import React from "react";
import Link from "next/link";
import type { StepEvent, StepId } from "../_lib/types";

const EXPLORER_ADDR = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;
const EXPLORER_TX = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const TITLES: Record<StepId, string> = {
  "fund": "① Fund 8 keypairs",
  "sign-root": "② User signs ROOT intent",
  "derive-research": "③a Spawn sub-agent: research (read-only)",
  "derive-execute": "③b Spawn sub-agent: execute (Jupiter only)",
  "derive-audit": "③c Spawn sub-agent: audit (read-only)",
  "rogue-reject": "④ Rogue Raydium / out-of-scope attempt",
};

function shortAddr(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function StatusBadge({ event }: { event: StepEvent }) {
  if (event.id === "rogue-reject" && event.status === "ok") {
    return <span style={{ color: "var(--accent-success, #5bd17a)" }}>✓ REJECTED (boundary held)</span>;
  }
  if (event.status === "ok") return <span style={{ color: "var(--accent-success, #5bd17a)" }}>✓ ok</span>;
  if (event.status === "failed") return <span style={{ color: "var(--accent-danger, #e07a7a)" }}>✗ failed</span>;
  if (event.status === "running") return <span style={{ color: "var(--cream-soft)" }}>…running</span>;
  return <span style={{ color: "var(--cream-soft, #999)", opacity: 0.6 }}>pending</span>;
}

export function StepCard({ event }: { event: StepEvent }) {
  const title = TITLES[event.id];
  const pda = "pda" in event ? event.pda : undefined;
  const sig = "sig" in event ? event.sig : undefined;
  const scope = "scope" in event ? event.scope : undefined;
  const reason = "reason" in event ? event.reason : undefined;

  return (
    <div
      className="border rounded-md p-4 my-2"
      style={{ borderColor: "color-mix(in oklch, var(--cream) 12%, transparent)" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{title}</span>
        <StatusBadge event={event} />
      </div>

      {scope && (
        <div className="text-xs mt-1" style={{ color: "var(--cream-soft)" }}>
          {scope}
        </div>
      )}

      {pda && (
        <div className="text-xs mt-1 font-mono">
          pda:{" "}
          <Link href={EXPLORER_ADDR(pda)} target="_blank" rel="noreferrer" className="underline">
            {shortAddr(pda)}
          </Link>
        </div>
      )}

      {sig && (
        <div className="text-xs mt-1 font-mono">
          sig:{" "}
          <Link href={EXPLORER_TX(sig)} target="_blank" rel="noreferrer" className="underline">
            {shortAddr(sig)}
          </Link>
        </div>
      )}

      {reason && (
        <div className="text-xs mt-1" style={{ color: "var(--cream-soft)" }}>
          reason: {reason}
        </div>
      )}

      {event.error && (
        <div className="text-xs mt-1" style={{ color: "var(--accent-danger, #e07a7a)" }}>
          error: {event.error}
        </div>
      )}
    </div>
  );
}
