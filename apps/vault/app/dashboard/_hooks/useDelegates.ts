"use client";

import { useCallback, useEffect, useState } from "react";
import { useFuinClient } from "./useFuinClient";
import { fetchDelegatesByVault, fetchDelegatesByAuthority, type DelegateAccount } from "../_lib/accounts";
import type { PublicKey } from "@solana/web3.js";

export function useDelegatesByVault(vaultPda: PublicKey | null) {
  const { client, connection } = useFuinClient();
  const [delegates, setDelegates] = useState<DelegateAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!client || !connection || !vaultPda) return;
    setLoading(true);
    try {
      const results = await fetchDelegatesByVault(connection, client.program, vaultPda);
      setDelegates(results);
    } catch {
      setDelegates([]);
    }
    setLoading(false);
  }, [client, connection, vaultPda?.toBase58()]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { delegates, loading, refetch };
}

export function useDelegatesByAuthority() {
  const { client, publicKey, connection } = useFuinClient();
  const [delegates, setDelegates] = useState<DelegateAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!client || !connection || !publicKey) return;
    setLoading(true);
    try {
      const results = await fetchDelegatesByAuthority(connection, client.program, publicKey);
      setDelegates(results);
    } catch {
      setDelegates([]);
    }
    setLoading(false);
  }, [client, publicKey, connection]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { delegates, loading, refetch };
}
