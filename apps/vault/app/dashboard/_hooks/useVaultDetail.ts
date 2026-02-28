"use client";

import { useCallback, useEffect, useState } from "react";
import { useFuinClient } from "./useFuinClient";
import { findVaultPda } from "@fuin-labs/sdk";
import { BN } from "bn.js";
import type { PublicKey } from "@solana/web3.js";

interface VaultDetail {
  publicKey: PublicKey;
  account: any;
  balance: number;
}

export function useVaultDetail(nonce: number) {
  const { client, publicKey, connection } = useFuinClient();
  const [vault, setVault] = useState<VaultDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !publicKey || !connection) return;
    setLoading(true);
    setError(null);
    try {
      const [pda] = findVaultPda(publicKey, new BN(nonce));
      const account = await (client.program.account as any).vault.fetch(pda);
      const balance = await connection.getBalance(pda);
      setVault({ publicKey: pda, account, balance });
    } catch (e: any) {
      if (e.message?.includes("Account does not exist")) {
        setVault(null);
      } else {
        setError(e.message || "Failed to fetch vault");
      }
    }
    setLoading(false);
  }, [client, publicKey, connection, nonce]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { vault, loading, error, refetch };
}
