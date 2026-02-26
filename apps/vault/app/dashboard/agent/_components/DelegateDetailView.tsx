"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Zap, Wallet, Copy } from "lucide-react";
import { GlassCard } from "../../_components/ui/GlassCard";
import { Badge } from "../../_components/ui/Badge";
import { ProgressBar } from "../../_components/ui/ProgressBar";
import { COLORS } from "../../_lib/constants";
import { formatSol, formatAddress, formatTimestamp, copyToClipboard, getVaultState } from "../../_lib/format";
import { parsePermissions } from "../../_lib/permissions";
import { useToast } from "../../_hooks/useToast";
import { useFuinClient } from "../../_hooks/useFuinClient";
import type { DelegateAccount } from "../../_lib/accounts";

interface DelegateDetailViewProps {
  delegate: DelegateAccount;
}

function getDelegateStatus(d: DelegateAccount["account"]) {
  if (!d.isActive) {
    return d.expiry.toNumber() === 0
      ? { label: "Revoked", variant: "revoked" as const }
      : { label: "Paused", variant: "paused" as const };
  }
  const now = Date.now() / 1000;
  if (d.expiry.toNumber() > 0 && d.expiry.toNumber() < now) return { label: "Expired", variant: "expired" as const };
  return { label: "Active", variant: "active" as const };
}

export function DelegateDetailView({ delegate }: DelegateDetailViewProps) {
  const d = delegate.account;
  const { connection } = useFuinClient();
  const { addToast } = useToast();
  const status = getDelegateStatus(d);
  const perms = parsePermissions(d.permissions);
  const dailyLimit = d.dailyLimit.toNumber();
  const dailySpent = d.dailySpent.toNumber();
  const maxUses = d.maxUses;
  const uses = d.uses;
  const expiry = d.expiry.toNumber();

  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [vaultState, setVaultState] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;
    connection.getBalance(d.vault).then(setVaultBalance).catch(() => {});
    // Try to fetch vault account for state
    // We don't have the program here so just skip detailed vault state
  }, [connection, d.vault]);

  const handleCopy = async (text: string) => {
    if (await copyToClipboard(text)) addToast("Copied", "info");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <GlassCard>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: status.variant === "active" ? COLORS.greenSubtle : COLORS.redSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${status.variant === "active" ? COLORS.greenBorder : COLORS.redBorder}`,
              }}
            >
              <Shield size={20} color={status.variant === "active" ? COLORS.green : COLORS.red} />
            </div>
            <div>
              <h3 style={{ color: COLORS.text, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Delegate #{d.nonce.toNumber()}
              </h3>
              <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>
                Nonce: {d.nonce.toNumber()}
              </span>
            </div>
          </div>
          <Badge variant={status.variant} dot>{status.label}</Badge>
        </div>

        {/* Vault Info */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Wallet size={14} color={COLORS.textDim} />
            <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>Vault</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.9rem" }}>
              {formatAddress(d.vault)}
            </span>
            <Copy
              size={12}
              color={COLORS.textDim}
              style={{ cursor: "pointer" }}
              onClick={() => handleCopy(d.vault.toBase58())}
            />
            {vaultBalance !== null && (
              <span style={{ color: COLORS.yellow, fontSize: "0.85rem", fontWeight: 600, marginLeft: "auto" }}>
                {formatSol(vaultBalance)} SOL
              </span>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: COLORS.textDim, display: "block", marginBottom: "8px" }}>Permissions</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {perms.length > 0 ? (
              perms.map((p) => <Badge key={p} variant="info">{p}</Badge>)
            ) : (
              <span style={{ fontSize: "0.85rem", color: COLORS.textMuted }}>None</span>
            )}
          </div>
        </div>

        {/* Spending Limit */}
        <div style={{ marginBottom: "20px" }}>
          <ProgressBar
            value={dailySpent}
            max={dailyLimit}
            label={`Spending: ${formatSol(dailySpent)} / ${formatSol(dailyLimit)} SOL`}
          />
        </div>

        {/* Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Zap size={12} color={COLORS.textDim} />
              <span style={{ fontSize: "0.75rem", color: COLORS.textDim }}>Uses</span>
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.text }}>
              {uses} / {maxUses || "\u221E"}
            </span>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Clock size={12} color={COLORS.textDim} />
              <span style={{ fontSize: "0.75rem", color: COLORS.textDim }}>Expiry</span>
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: expiry > 0 && expiry < Date.now() / 1000 ? COLORS.red : COLORS.text }}>
              {expiry > 0 ? formatTimestamp(expiry) : "Never"}
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
