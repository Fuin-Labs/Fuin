"use client";

import { useCallback, useEffect, useState } from "react";
import { useFuinClient } from "./useFuinClient";
import { findVaultPda } from "@fuin-labs/sdk";
import { BN } from "bn.js";

export function useAutoNonce() {
  const { publicKey, connection } = useFuinClient();
  const [nextNonce, setNextNonce] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const probe = useCallback(async () => {
    if (!publicKey || !connection) return;
    setLoading(true);
    for (let i = 0; i < 20; i++) {
      const [pda] = findVaultPda(publicKey, new BN(i));
      const info = await connection.getAccountInfo(pda);
      if (!info) {
        setNextNonce(i);
        setLoading(false);
        return;
      }
    }
    setNextNonce(20);
    setLoading(false);
  }, [publicKey, connection]);

  useEffect(() => {
    probe();
  }, [probe]);

  return { nextNonce, loading };
}
