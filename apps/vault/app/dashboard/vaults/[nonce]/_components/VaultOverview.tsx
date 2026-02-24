"use client";

import { Copy, ExternalLink } from "lucide-react";
import { COLORS } from "../../../_lib/constants";
import { formatSol, formatAddress, copyToClipboard, getVaultState } from "../../../_lib/format";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Badge } from "../../../_components/ui/Badge";
import { ProgressBar } from "../../../_components/ui/ProgressBar";
import { useToast } from "../../../_hooks/useToast";
import type { PublicKey } from "@solana/web3.js";

interface VaultOverviewProps {
  vault: any;
  vaultPda: PublicKey;
  balance: number;
}

export function VaultOverview({ vault, vaultPda, balance }: VaultOverviewProps) {
  const { addToast } = useToast();
  const state = getVaultState(vault.state);
  const spending = vault.policies.spending;
  const dailyCap = spending.dailyCap.toNumber();
  const dailySpent = spending.dailySpent.toNumber();
  const perTxCap = spending.perTxCap.toNumber();

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) addToast("Copied to clipboard", "info");
  };

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ color: COLORS.text, fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
          Vault Overview
        </h3>
        <Badge variant={state} dot>{state}</Badge>
      </div>

      {/* Balance */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "0.8rem", color: COLORS.textMuted, display: "block", marginBottom: "4px" }}>Balance</span>
        <span style={{ fontSize: "2rem", fontWeight: 800, color: COLORS.yellow }}>
          {formatSol(balance)} <span style={{ fontSize: "1rem", color: COLORS.textMuted }}>SOL</span>
        </span>
      </div>

      {/* Spending Progress */}
      <div style={{ marginBottom: "24px" }}>
        <ProgressBar
          value={dailySpent}
          max={dailyCap}
          label={`Epoch Spending: ${formatSol(dailySpent)} / ${formatSol(dailyCap)} SOL`}
        />
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
          <span style={{ fontSize: "0.75rem", color: COLORS.textDim, display: "block", marginBottom: "4px" }}>Daily Cap</span>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.text }}>{formatSol(dailyCap)} SOL</span>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
          <span style={{ fontSize: "0.75rem", color: COLORS.textDim, display: "block", marginBottom: "4px" }}>Per-Tx Cap</span>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.text }}>{formatSol(perTxCap)} SOL</span>
        </div>
      </div>

      {/* Address */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
        <span style={{ color: COLORS.textDim }}>Address:</span>
        <span style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace" }}>
          {formatAddress(vaultPda)}
        </span>
        <Copy
          size={14}
          color={COLORS.textDim}
          style={{ cursor: "pointer" }}
          onClick={() => handleCopy(vaultPda.toBase58())}
        />
      </div>
    </GlassCard>
  );
}
