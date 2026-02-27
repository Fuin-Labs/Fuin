"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Database, Search } from "lucide-react";
import { useVaults } from "../_hooks/useVaults";
import { useFuinClient } from "../_hooks/useFuinClient";
import { VaultCard } from "../_components/VaultCard";
import { Button } from "../_components/ui/Button";
import { Spinner } from "../_components/ui/Spinner";
import { EmptyState } from "../_components/ui/EmptyState";
import { COLORS } from "../_lib/constants";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { PageHeader } from "../_components/PageHeader";
import { fetchVaultLabelsByGuardian } from "../_actions/vaults";
import { fetchDelegatesByVault } from "../_lib/accounts";

export default function VaultsPage() {
  const { connected, publicKey, connection, client } = useFuinClient();
  const { vaults, loading } = useVaults();
  const isMobile = useIsMobile();
  const [vaultLabels, setVaultLabels] = useState<Record<string, string>>({});
  const [delegateCounts, setDelegateCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!publicKey) return;
    fetchVaultLabelsByGuardian(publicKey.toBase58())
      .then(setVaultLabels)
      .catch(() => { });
  }, [publicKey?.toBase58(), vaults.length]);

  // Fetch delegate counts for each vault
  useEffect(() => {
    if (!client || !connection || vaults.length === 0) return;
    const counts: Record<string, number> = {};
    Promise.all(
      vaults.map(async (v) => {
        try {
          const delegates = await fetchDelegatesByVault(connection, client.program, v.publicKey);
          counts[v.publicKey.toBase58()] = delegates.length;
        } catch {
          counts[v.publicKey.toBase58()] = 0;
        }
      })
    ).then(() => setDelegateCounts(counts));
  }, [client, connection, vaults.length]);

  if (!connected) {
    return (
      <EmptyState
        icon={<Database size={48} color={COLORS.textDim} />}
        title="Connect Your Wallet"
        description="Connect a Solana wallet to view and manage your authorization vaults."
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const filteredVaults = vaults.filter((v) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const nonce = v.account.nonce.toNumber();
    const label = vaultLabels[v.publicKey.toBase58()] || "";
    return (
      label.toLowerCase().includes(q) ||
      String(nonce).includes(q) ||
      `vault #${nonce}`.includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
    >
      <PageHeader
        action={
          <Link href="/dashboard/vaults/create" style={{ textDecoration: "none" }}>
            <Button size="sm">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={16} /> Create Vault
              </span>
            </Button>
          </Link>
        }
      />

      {/* Search */}
      {vaults.length > 0 && (
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <Search
            size={16}
            color={COLORS.textDim}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or nonce..."
            style={{
              width: "100%",
              padding: "12px 14px 12px 40px",
              borderRadius: "12px",
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bgInput,
              color: COLORS.text,
              fontSize: "0.9rem",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Vault Grid */}
      {vaults.length === 0 ? (
        <EmptyState
          icon={<Database size={48} color={COLORS.textDim} />}
          title="No Vaults Yet"
          description="Create your first authorization vault to start managing delegate keys for AI agents or teenagers."
          action={
            <Link href="/dashboard/vaults/create" style={{ textDecoration: "none" }}>
              <Button>Create Your First Vault</Button>
            </Link>
          }
        />
      ) : filteredVaults.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textMuted, fontSize: "0.95rem" }}>
          No vaults match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
          {filteredVaults.map((v) => (
            <VaultCard
              key={v.publicKey.toBase58()}
              vault={v}
              label={vaultLabels[v.publicKey.toBase58()]}
              delegateCount={delegateCounts[v.publicKey.toBase58()]}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
