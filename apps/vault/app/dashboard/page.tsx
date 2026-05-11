"use client";
import React from "react";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Database, Bot, Plus, Wallet } from "lucide-react";
import { useFuinClient } from "./_hooks/useFuinClient";
import { useVaults } from "./_hooks/useVaults";
import { useIsMobile } from "./_hooks/useMediaQuery";
import { fetchDelegatesByVault } from "./_lib/accounts";
import { GlassCard } from "./_components/ui/GlassCard";
import { EmptyState } from "./_components/ui/EmptyState";
import { Spinner } from "./_components/ui/Spinner";
import { COLORS } from "./_lib/constants";
import { formatSol } from "./_lib/format";

export default function DashboardPage(): React.JSX.Element {
  const { client, connection, connected } = useFuinClient();
  const { vaults, loading } = useVaults();
  const isMobile = useIsMobile();
  const [activeDelegates, setActiveDelegates] = useState(0);
  const [delegatesLoading, setDelegatesLoading] = useState(false);

  useEffect(() => {
    if (!client || !connection || vaults.length === 0) {
      setActiveDelegates(0);
      return;
    }
    setDelegatesLoading(true);
    Promise.all(
      vaults.map((v) => fetchDelegatesByVault(connection, client.program, v.publicKey))
    )
      .then((results) => {
        const total = results.reduce(
          (sum, delegates) => sum + delegates.filter((d) => d.account.isActive).length,
          0
        );
        setActiveDelegates(total);
      })
      .catch(() => setActiveDelegates(0))
      .finally(() => setDelegatesLoading(false));
  }, [client, connection, vaults]);

  if (!connected) {
    return (
      <EmptyState
        icon={<Wallet size={48} color={COLORS.textDim} />}
        title="Connect Your Wallet"
        description="Connect your wallet to view your dashboard overview."
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

  const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "2px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Database size={18} color={COLORS.emerald} />
            </div>
            <span
              className="t-eyebrow"
              style={{ fontSize: "0.72rem" }}
            >
              vaults
            </span>
          </div>
          <span
            className="font-display"
            style={{ fontSize: "2.4rem", color: COLORS.text, letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            {vaults.length}
          </span>
        </GlassCard>

        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "2px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Wallet size={18} color={COLORS.emerald} />
            </div>
            <span className="t-eyebrow" style={{ fontSize: "0.72rem" }}>balance</span>
          </div>
          <span
            className="font-display"
            style={{ fontSize: "2.4rem", color: COLORS.text, letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            {formatSol(totalBalance)}
          </span>
          <span className="t-small" style={{ marginLeft: "8px", color: COLORS.textMuted }}>SOL</span>
        </GlassCard>

        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "2px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Bot size={18} color={COLORS.emerald} />
            </div>
            <span className="t-eyebrow" style={{ fontSize: "0.72rem" }}>active delegates</span>
          </div>
          <span
            className="font-display"
            style={{ fontSize: "2.4rem", color: COLORS.text, letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            {delegatesLoading ? "—" : activeDelegates}
          </span>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "16px", marginTop: "32px" }}>
        <span className="t-eyebrow">quick actions</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
        <Link href="/dashboard/vaults" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ backgroundColor: COLORS.bgCardHover }}
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "2px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "background-color 0.15s",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "2px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Plus size={18} color={COLORS.emerald} />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: "1.05rem", color: COLORS.text, display: "block", letterSpacing: "-0.005em" }}>
                Manage vaults
              </span>
              <span className="t-small" style={{ color: COLORS.textMuted }}>
                create or manage your vaults
              </span>
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/agent" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ backgroundColor: COLORS.bgCardHover }}
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "2px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "background-color 0.15s",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "2px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Bot size={18} color={COLORS.emerald} />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: "1.05rem", color: COLORS.text, display: "block", letterSpacing: "-0.005em" }}>
                Agent view
              </span>
              <span className="t-small" style={{ color: COLORS.textMuted }}>
                view and use delegate keys
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
