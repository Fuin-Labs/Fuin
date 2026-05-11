// Curated map of known Solana program IDs → human labels.
// Used by the audit page predicate panel.
export const KNOWN_PROGRAMS: Record<string, string> = {
  // DEX aggregators
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: "Jupiter v6",
  // AMM venues
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: "Whirlpool",
  LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo: "Meteora DLMM",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM v4",
  // Token program
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token",
};

export function labelFor(pubkey: string): string | null {
  return KNOWN_PROGRAMS[pubkey] ?? null;
}

// --- inline runtime self-check ---
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  console.assert(
    labelFor("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4") === "Jupiter v6",
    "labelFor: Jupiter v6 should resolve"
  );
  console.assert(
    labelFor("notarealpubkey") === null,
    "labelFor: unknown program should return null"
  );
}
