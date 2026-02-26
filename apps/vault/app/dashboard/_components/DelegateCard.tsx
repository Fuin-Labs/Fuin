"use client";

import { motion } from "framer-motion";
import { User, Clock, Zap } from "lucide-react";
import { COLORS, GLASS_STYLE } from "../_lib/constants";
import { formatAddress, formatSol, formatTimestamp } from "../_lib/format";
import { parsePermissions } from "../_lib/permissions";
import { getDelegateLabel } from "../_lib/delegateLabels";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import { Button } from "./ui/Button";
import type { DelegateAccount } from "../_lib/accounts";

interface DelegateCardProps {
  delegate: DelegateAccount;
  onPause?: () => void;
  onResume?: () => void;
  onRevoke?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

function getDelegateStatus(d: DelegateAccount["account"]): { label: string; variant: "active" | "paused" | "revoked" | "expired" } {
  if (!d.isActive) {
    // Revoke sets expiry=0; pause leaves expiry unchanged (>0)
    return d.expiry.toNumber() === 0
      ? { label: "Revoked", variant: "revoked" }
      : { label: "Paused", variant: "paused" };
  }
  const now = Date.now() / 1000;
  if (d.expiry.toNumber() > 0 && d.expiry.toNumber() < now) return { label: "Expired", variant: "expired" };
  return { label: "Active", variant: "active" };
}

export function DelegateCard({ delegate, onPause, onResume, onRevoke, loading, readOnly }: DelegateCardProps) {
  const d = delegate.account;
  const status = getDelegateStatus(d);
  const label = getDelegateLabel(delegate.publicKey.toBase58());
  const perms = parsePermissions(d.permissions);
  const dailyLimit = d.dailyLimit.toNumber();
  const dailySpent = d.dailySpent.toNumber();
  const maxUses = d.maxUses;
  const uses = d.uses;
  const expiry = d.expiry.toNumber();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...GLASS_STYLE,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <User size={18} color={COLORS.textMuted} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {label && (
              <span style={{ color: COLORS.yellow, fontWeight: 600, fontSize: "0.85rem" }}>
                {label}
              </span>
            )}
            <span style={{ color: COLORS.text, fontWeight: 600, fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.9rem" }}>
              {formatAddress(d.authority)}
            </span>
          </div>
        </div>
        <Badge variant={status.variant} dot>{status.label}</Badge>
      </div>

      {/* Permissions */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {perms.map((p) => (
          <Badge key={p} variant="info">{p}</Badge>
        ))}
      </div>

      {/* Limits */}
      <ProgressBar
        value={dailySpent}
        max={dailyLimit}
        label={`Limit: ${formatSol(dailySpent)} / ${formatSol(dailyLimit)} SOL`}
      />

      {/* Meta */}
      <div style={{ display: "flex", gap: "24px", fontSize: "0.8rem", color: COLORS.textMuted }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Zap size={12} />
          {uses}/{maxUses || "\u221E"} uses
        </span>
        {expiry > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} />
            {formatTimestamp(expiry)}
          </span>
        )}
      </div>

      {/* Actions */}
      {!readOnly && status.variant === "active" && (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" size="sm" onClick={onPause} disabled={loading}>
            Pause
          </Button>
          <Button variant="danger" size="sm" onClick={onRevoke} disabled={loading}>
            Revoke
          </Button>
        </div>
      )}
      {!readOnly && status.variant === "paused" && (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="primary" size="sm" onClick={onResume} disabled={loading}>
            Resume
          </Button>
          <Button variant="danger" size="sm" onClick={onRevoke} disabled={loading}>
            Revoke
          </Button>
        </div>
      )}
    </motion.div>
  );
}
