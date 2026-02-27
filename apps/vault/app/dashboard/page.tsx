"use client";

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

export default function DashboardPage() {
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
                borderRadius: "10px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.emeraldBorder}`,
              }}
            >
              <Database size={18} color={COLORS.emerald} />
            </div>
            <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>Total Vaults</span>
          </div>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: COLORS.text }}>
            {vaults.length}
          </span>
        </GlassCard>

        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: COLORS.greenSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.greenBorder}`,
              }}
            >
              <Wallet size={18} color={COLORS.green} />
            </div>
            <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>Total Balance</span>
          </div>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: COLORS.text }}>
            {formatSol(totalBalance)}
          </span>
          <span style={{ fontSize: "0.85rem", color: COLORS.textDim, marginLeft: "6px" }}>SOL</span>
        </GlassCard>

        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: COLORS.purpleSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid rgba(168, 85, 247, 0.3)`,
              }}
            >
              <Bot size={18} color={COLORS.purple} />
            </div>
            <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>Active Delegates</span>
          </div>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: COLORS.text }}>
            {delegatesLoading ? "\u2014" : activeDelegates}
          </span>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Quick Actions
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
        <Link href="/dashboard/vaults" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", y: -2 }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
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
                borderRadius: "10px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.emeraldBorder}`,
              }}
            >
              <Plus size={18} color={COLORS.emerald} />
            </div>
            <div>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: COLORS.text, display: "block" }}>
                Manage Vaults
              </span>
              <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>
                Create or manage your vaults
              </span>
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/agent" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", y: -2 }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
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
                borderRadius: "10px",
                backgroundColor: COLORS.purpleSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid rgba(168, 85, 247, 0.3)`,
              }}
            >
              <Bot size={18} color={COLORS.purple} />
            </div>
            <div>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: COLORS.text, display: "block" }}>
                Agent View
              </span>
              <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>
                View and use delegate keys
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
