"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Database, ChevronRight } from "lucide-react";
import { COLORS, GLASS_STYLE, GLASS_CARD_HOVER } from "../_lib/constants";
import { formatSol, getVaultState } from "../_lib/format";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import type { VaultAccount } from "../_lib/accounts";

interface VaultCardProps {
  vault: VaultAccount;
  delegateCount?: number;
  label?: string | null;
}

export function VaultCard({ vault, delegateCount, label }: VaultCardProps) {
  const state = getVaultState(vault.account.state);
  const nonce = vault.account.nonce.toNumber();
  const dailyCap = vault.account.policies.spending.dailyCap.toNumber();
  const dailySpent = vault.account.policies.spending.dailySpent.toNumber();

  return (
    <Link href={`/dashboard/vaults/${nonce}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={GLASS_CARD_HOVER}
        style={{
          ...GLASS_STYLE,
          padding: "28px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: COLORS.emeraldSubtle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.emeraldBorder}`,
              }}
            >
              <Database size={20} color={COLORS.emerald} />
            </div>
            <div>
              <h3 style={{ color: COLORS.text, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                {label || `Vault #${nonce}`}
              </h3>
              <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>
                {formatSol(vault.balance)} SOL
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge variant={state} dot>{state}</Badge>
            <ChevronRight size={16} color={COLORS.textDim} />
          </div>
        </div>

        <ProgressBar
          value={dailySpent}
          max={dailyCap}
          label={`Daily: ${formatSol(dailySpent)} / ${formatSol(dailyCap)} SOL`}
        />

        {delegateCount !== undefined && (
          <div style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
            {delegateCount} delegate{delegateCount !== 1 ? "s" : ""}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
