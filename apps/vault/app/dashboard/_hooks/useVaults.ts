"use client";

import { useCallback, useEffect, useState } from "react";
import { useFuinClient } from "./useFuinClient";
import { fetchVaultsByGuardian, type VaultAccount } from "../_lib/accounts";
import type { Idl } from "@coral-xyz/anchor";

export function useVaults() {
  const { client, publicKey, connection } = useFuinClient();
  const [vaults, setVaults] = useState<VaultAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !publicKey || !connection) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchVaultsByGuardian(connection, client.program, publicKey);
      setVaults(results);
    } catch (e: any) {
      setError(e.message || "Failed to fetch vaults");
    }
    setLoading(false);
  }, [client, publicKey, connection]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { vaults, loading, error, refetch };
}
