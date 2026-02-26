"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ScrollText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useVaultDetail } from "../../../_hooks/useVaultDetail";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { Spinner } from "../../../_components/ui/Spinner";
import { EmptyState } from "../../../_components/ui/EmptyState";
import { Badge } from "../../../_components/ui/Badge";
import { COLORS, GLASS_STYLE } from "../../../_lib/constants";
import { formatAddress } from "../../../_lib/format";
import { fetchAuditLogsByVault } from "../../../_actions/audit";
import { fetchDelegateLabelsByVault } from "../../../_actions/delegates";

type AuditEntry = {
  id: string;
  delegatePda: string;
  vaultPda: string;
  guardian: string;
  action: string;
  txSignature: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_BADGE: Record<string, { variant: "active" | "paused" | "revoked" | "info"; label: string }> = {
  created: { variant: "active", label: "Created" },
  paused: { variant: "paused", label: "Paused" },
  resumed: { variant: "info", label: "Resumed" },
  revoked: { variant: "revoked", label: "Revoked" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AuditLogPage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const nonce = Number(nonceStr);
  const { connected } = useFuinClient();
  const { vault, loading: vaultLoading } = useVaultDetail(nonce);

  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vault) return;
    const vaultPda = vault.publicKey.toBase58();
    setLoading(true);
    Promise.all([
      fetchAuditLogsByVault(vaultPda),
      fetchDelegateLabelsByVault(vaultPda),
    ])
      .then(([logData, labelData]) => {
        setLogs(logData);
        setLabels(labelData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vault?.publicKey.toBase58()]);

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to view audit logs.
      </div>
    );
  }

  if (vaultLoading || loading) {
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
          <Link href="/dashboard/vaults" style={{ textDecoration: "none", color: COLORS.yellow }}>
            Back to Vaults
          </Link>
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: "800px" }}
    >
      <Link
        href={`/dashboard/vaults/${nonce}`}
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
        <ArrowLeft size={16} /> Back to Vault
      </Link>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-0.025em" }}>
          Audit Log
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "6px 0 0" }}>
          Activity history for Vault #{nonce}
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={48} color={COLORS.textDim} />}
          title="No Activity Yet"
          description="Delegate actions (create, pause, resume, revoke) will appear here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {logs.map((log, i) => {
            const badge = ACTION_BADGE[log.action] ?? { variant: "info" as const, label: log.action };
            const delegateLabel = labels[log.delegatePda];

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                style={{
                  ...GLASS_STYLE,
                  borderRadius: i === 0 ? "16px 16px 4px 4px" : i === logs.length - 1 ? "4px 4px 16px 16px" : "4px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                  <Badge variant={badge.variant}>{badge.label}</Badge>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.text, fontSize: "0.9rem", fontWeight: 600 }}>
                      {delegateLabel || formatAddress(log.delegatePda)}
                    </div>
                    {delegateLabel && (
                      <div style={{ color: COLORS.textDim, fontSize: "0.75rem", marginTop: "2px" }}>
                        {formatAddress(log.delegatePda)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  {log.txSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${log.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: COLORS.textDim, display: "flex" }}
                      title="View on Solana Explorer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <span style={{ color: COLORS.textDim, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
