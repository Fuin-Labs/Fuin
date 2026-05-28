"use client";
import React from "react";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { useFuinClient } from "./_hooks/useFuinClient";
import { useVaults } from "./_hooks/useVaults";
import { useIsMobile } from "./_hooks/useMediaQuery";
import { fetchDelegatesByVault } from "./_lib/accounts";
import { EmptyState } from "./_components/ui/EmptyState";
import { Spinner } from "./_components/ui/Spinner";
import { AnimatedNumber } from "../components/ui/animated-number";

const LAMPORTS_PER_SOL = 1_000_000_000;

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  unit?: string;
};

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--paper-rise)",
        border: "1px solid var(--rule-soft)",
        padding: "24px 22px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        minHeight: "138px",
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-v2), monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(2.4rem, 4vw, 3rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.024em",
            color: "var(--ink-black)",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

type ActionCardProps = {
  label: string;
  description: string;
  href: string;
};

function ActionCard({ label, description, href }: ActionCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
        whileHover={{
          background: "color-mix(in oklch, var(--ink-black) 4%, var(--paper-rise))",
        }}
        style={{
          background: "var(--paper-rise)",
          border: "1px solid var(--rule-soft)",
          padding: "22px 24px",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: "16px",
          transition: "background-color 0.15s",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.66rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--ink-black)",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.96rem",
              color: "var(--ink-soft)",
              lineHeight: 1.4,
            }}
          >
            {description}
          </span>
        </div>
        <span
          aria-hidden
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "1.1rem",
            color: "var(--crimson)",
          }}
        >
          →
        </span>
      </motion.div>
    </Link>
  );
}

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
      vaults.map((v) =>
        fetchDelegatesByVault(connection, client.program, v.publicKey),
      ),
    )
      .then((results) => {
        const total = results.reduce(
          (sum, delegates) =>
            sum + delegates.filter((d) => d.account.isActive).length,
          0,
        );
        setActiveDelegates(total);
      })
      .catch(() => setActiveDelegates(0))
      .finally(() => setDelegatesLoading(false));
  }, [client, connection, vaults]);

  if (!connected) {
    return (
      <EmptyState
        icon={<Wallet size={36} color="var(--ink-mute)" />}
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: "20px",
          marginBottom: "44px",
        }}
      >
        <StatCard
          label="Vaults"
          value={<AnimatedNumber value={vaults.length} />}
        />
        <StatCard
          label="Balance"
          value={
            <AnimatedNumber
              value={totalBalance / LAMPORTS_PER_SOL}
              precision={4}
              format={(n) => n.toFixed(4)}
            />
          }
          unit="SOL"
        />
        <StatCard
          label="Active delegates"
          value={<AnimatedNumber value={delegatesLoading ? 0 : activeDelegates} />}
        />
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
          }}
        >
          Quick actions
        </span>
        <span
          aria-hidden
          style={{
            flex: 1,
            height: 1,
            background: "var(--ink-black)",
            opacity: 0.18,
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <ActionCard
          label="Manage vaults"
          description="Create a new vault or inspect the ones you already hold."
          href="/dashboard/vaults"
        />
        <ActionCard
          label="Agent view"
          description="Inspect the delegate keys your wallet has been issued."
          href="/dashboard/agent"
        />
      </div>
    </motion.div>
  );
}
