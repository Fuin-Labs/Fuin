"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Database } from "lucide-react";
import { useVaults } from "../_hooks/useVaults";
import { useFuinClient } from "../_hooks/useFuinClient";
import { VaultCard } from "../_components/VaultCard";
import { Button } from "../_components/ui/Button";
import { Spinner } from "../_components/ui/Spinner";
import { EmptyState } from "../_components/ui/EmptyState";
import { COLORS } from "../_lib/constants";

export default function VaultsPage() {
  const { connected } = useFuinClient();
  const { vaults, loading } = useVaults();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: "900px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-0.025em" }}>
            Your Vaults
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "6px 0 0" }}>
            Manage authorization vaults for your agents and juniors.
          </p>
        </div>
        <Link href="/dashboard/vaults/create" style={{ textDecoration: "none" }}>
          <Button>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={18} /> Create Vault
            </span>
          </Button>
        </Link>
      </div>

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
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
          {vaults.map((v) => (
            <VaultCard key={v.publicKey.toBase58()} vault={v} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
