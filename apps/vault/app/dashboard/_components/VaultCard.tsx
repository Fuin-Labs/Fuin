"use client";
import React from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { COLORS } from "../_lib/constants";
import { formatSol, getVaultState } from "../_lib/format";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import type { VaultAccount } from "../_lib/accounts";

interface VaultCardProps {
  vault: VaultAccount;
  delegateCount?: number;
  label?: string | null;
}

/**
 * VaultCard rebuilt to match the landing's editorial language:
 * - No icon-in-rounded-square (skill banned AI feature-card tell).
 * - Flat hairline border, no glassmorphic chrome.
 * - Archivo display title, monospace meta, lime accent on hover only.
 */
export function VaultCard({ vault, delegateCount, label }: VaultCardProps): React.JSX.Element {
  const state = getVaultState(vault.account.state);
  const nonce = vault.account.nonce.toNumber();
  const dailyCap = vault.account.policies.spending.dailyCap.toNumber();
  const dailySpent = vault.account.policies.spending.dailySpent.toNumber();

  return (
    <Link href={`/dashboard/vaults/${nonce}`} style={{ textDecoration: "none" }}>
      <motion.article
        whileHover={{ borderColor: "var(--live)", y: -1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "var(--paper-rise)",
          border: "1px solid var(--rule-soft)",
          padding: "28px 24px 24px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {/* Header: monospace nonce eyebrow + status badge. Title + balance below. */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-mono-v2), monospace",
                fontSize: "0.66rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: COLORS.textMuted,
              }}
            >
              Vault {String(nonce).padStart(3, "0")}
            </span>
            <h3
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "-0.012em",
                lineHeight: 1.15,
                color: COLORS.text,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label || `Vault #${nonce}`}
            </h3>
            <span
              style={{
                fontFamily: "var(--font-mono-v2), monospace",
                fontSize: "0.85rem",
                color: COLORS.text,
                letterSpacing: "0.01em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatSol(vault.balance)} <span style={{ color: COLORS.textMuted }}>SOL</span>
            </span>
          </div>
          <Badge variant={state} dot>
            {state}
          </Badge>
        </div>

        {/* Spending progress, lime fill via ProgressBar default. */}
        <ProgressBar
          value={dailySpent}
          max={dailyCap}
          label={`Daily ${formatSol(dailySpent)} / ${formatSol(dailyCap)} SOL`}
        />

        {/* Footer: monospace meta line, steel-tinted */}
        {delegateCount !== undefined && (
          <div
            style={{
              paddingTop: "14px",
              borderTop: "1px solid var(--rule-soft)",
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.72rem",
              color: COLORS.textMuted,
              letterSpacing: "0.04em",
            }}
          >
            {delegateCount} delegate{delegateCount !== 1 ? "s" : ""}
          </div>
        )}
      </motion.article>
    </Link>
  );
}
