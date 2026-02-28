"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Check, X, ScrollText } from "lucide-react";
import Link from "next/link";
import { useVaultDetail } from "../../_hooks/useVaultDetail";
import { useFuinClient } from "../../_hooks/useFuinClient";
import { Spinner } from "../../_components/ui/Spinner";
import { EmptyState } from "../../_components/ui/EmptyState";
import { VaultOverview } from "./_components/VaultOverview";
import { DepositSection } from "./_components/DepositSection";
import { WithdrawSection } from "./_components/WithdrawSection";
import { FreezeToggle } from "./_components/FreezeToggle";
import { UpdatePoliciesForm } from "./_components/UpdatePoliciesForm";
import { DelegateList } from "./_components/DelegateList";
import { getVaultState } from "../../_lib/format";
import { COLORS } from "../../_lib/constants";
import { useIsMobile } from "../../_hooks/useMediaQuery";
import { fetchVaultLabel, setVaultLabel, saveVault } from "../../_actions/vaults";

export default function VaultDetailPage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const nonce = Number(nonceStr);
  const { connected, publicKey } = useFuinClient();
  const isMobile = useIsMobile();
  const { vault, loading, refetch } = useVaultDetail(nonce);

  const [vaultLabel, setVaultLabelState] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Fetch label from DB and ensure vault record exists
  useEffect(() => {
    if (!vault || !publicKey) return;
    const pda = vault.publicKey.toBase58();
    // Ensure vault is in DB
    saveVault({ pda, guardian: publicKey.toBase58(), nonce }).catch(() => {});
    fetchVaultLabel(pda).then(setVaultLabelState).catch(() => {});
  }, [vault?.publicKey.toBase58(), publicKey?.toBase58()]);

  const handleSaveLabel = async () => {
    if (!vault) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    await setVaultLabel(vault.publicKey.toBase58(), trimmed);
    setVaultLabelState(trimmed);
    setEditing(false);
  };

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to view this vault.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!vault) {
    return (
      <EmptyState
        title="Vault Not Found"
        description={`No vault found with nonce ${nonce} for your wallet.`}
        action={
          <Link href="/dashboard/vaults" style={{ textDecoration: "none", color: COLORS.emerald }}>
            Back to Vaults
          </Link>
        }
      />
    );
  }

  const state = getVaultState(vault.account.state);
  const isFrozen = state === "frozen";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
    >
      <Link
        href="/dashboard/vaults"
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: COLORS.textMuted,
          fontSize: "0.9rem",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} /> Back to Vaults
      </Link>

      <div style={{ marginBottom: "32px" }}>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveLabel(); if (e.key === "Escape") setEditing(false); }}
              placeholder="Vault name..."
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.emeraldBorder}`,
                borderRadius: "8px",
                padding: "6px 12px",
                color: COLORS.text,
                fontSize: "1.8rem",
                fontWeight: 800,
                fontFamily: "inherit",
                outline: "none",
                letterSpacing: "-0.025em",
                width: "300px",
              }}
            />
            <button type="button" onClick={handleSaveLabel} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <Check size={20} color={COLORS.green} />
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
              <X size={20} color={COLORS.textDim} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-0.025em" }}>
              {vaultLabel || `Vault #${nonce}`}
            </h2>
            <button
              type="button"
              onClick={() => { setEditValue(vaultLabel || ""); setEditing(true); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", opacity: 0.5 }}
              title="Rename vault"
            >
              <Pencil size={16} color={COLORS.textMuted} />
            </button>
            {vaultLabel && (
              <span style={{ fontSize: "0.85rem", color: COLORS.textDim }}>
                (#{nonce})
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <VaultOverview vault={vault.account} vaultPda={vault.publicKey} balance={vault.balance} />

        <FreezeToggle nonce={nonce} isFrozen={isFrozen} onSuccess={refetch} />

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          <DepositSection vaultPda={vault.publicKey} onSuccess={refetch} />
          <WithdrawSection nonce={nonce} onSuccess={refetch} />
        </div>

        <UpdatePoliciesForm
          nonce={nonce}
          currentDailyCap={vault.account.policies.spending.dailyCap.toNumber()}
          currentPerTxCap={vault.account.policies.spending.perTxCap.toNumber()}
          onSuccess={refetch}
        />

        <DelegateList vaultPda={vault.publicKey} vaultNonce={nonce} />

      </div>
    </motion.div>
  );
}
