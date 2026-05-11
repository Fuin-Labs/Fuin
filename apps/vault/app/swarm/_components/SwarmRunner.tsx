"use client";

import React, { useEffect } from "react";

export function SwarmRunner() {
  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <h1 className="t-display">Fuin v2 — swarm demo</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--cream-soft)" }}>
        Connect a devnet wallet, click Run, watch each step land on-chain.
      </p>
    </main>
  );
}
