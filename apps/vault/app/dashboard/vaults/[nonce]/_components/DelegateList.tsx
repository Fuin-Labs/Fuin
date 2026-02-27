"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useDelegatesByVault } from "../../../_hooks/useDelegates";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { useToast } from "../../../_hooks/useToast";
import { useIsMobile } from "../../../_hooks/useMediaQuery";
import { DelegateCard } from "../../../_components/DelegateCard";
import { Button } from "../../../_components/ui/Button";
import { Modal } from "../../../_components/ui/Modal";
import { EmptyState } from "../../../_components/ui/EmptyState";
import { Spinner } from "../../../_components/ui/Spinner";
import { COLORS } from "../../../_lib/constants";
import { setLabelCache } from "../../../_lib/delegateLabels";
import { fetchDelegateLabelsByVault } from "../../../_actions/delegates";
import { logDelegateControlAction } from "../../../_actions/audit";
import type { PublicKey } from "@solana/web3.js";
import type { DelegateAccount } from "../../../_lib/accounts";

type StatusFilter = "all" | "active" | "paused" | "revoked" | "expired";

function getDelegateStatus(d: DelegateAccount["account"]): StatusFilter {
  if (!d.isActive) {
    return d.expiry.toNumber() === 0 ? "revoked" : "paused";
  }
  const now = Date.now() / 1000;
  if (d.expiry.toNumber() > 0 && d.expiry.toNumber() < now) return "expired";
  return "active";
}

interface DelegateListProps {
  vaultPda: PublicKey;
  vaultNonce: number;
}

export function DelegateList({ vaultPda, vaultNonce }: DelegateListProps) {
  const { client, publicKey } = useFuinClient();
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const { delegates, loading, refetch } = useDelegatesByVault(vaultPda);
  const [actionLoading, setActionLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<number | null>(null);
  const [labelsLoaded, setLabelsLoaded] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");

  // Fetch delegate labels from DB and populate client cache
  useEffect(() => {
    if (!vaultPda) return;
    fetchDelegateLabelsByVault(vaultPda.toBase58())
      .then((labels) => {
        setLabelCache(labels);
        setLabelsLoaded(true);
      })
      .catch(() => setLabelsLoaded(true));
  }, [vaultPda?.toBase58(), delegates.length]);

  const handleControl = async (delegateNonce: number, status: number, label: string) => {
    if (!client) return;
    setActionLoading(true);
    try {
      const tx = await client.delegateControl(vaultNonce, delegateNonce, status);
      addToast(`Delegate ${label}`, "success");

      // Log to audit trail (fire-and-forget)
      const actionMap: Record<number, "revoked" | "paused" | "resumed"> = {
        0: "revoked",
        1: "paused",
        2: "resumed",
      };
      if (publicKey && actionMap[status]) {
        logDelegateControlAction({
          delegatePda: "", // we don't have it readily here
          vaultPda: vaultPda.toBase58(),
          guardian: publicKey.toBase58(),
          action: actionMap[status]!,
          txSignature: tx ?? undefined,
        }).catch(() => {}); // best-effort
      }

      refetch();
    } catch (e: any) {
      addToast(e.message?.slice(0, 100) || `Failed to ${label.toLowerCase()}`, "error");
    }
    setActionLoading(false);
  };

  // Compute counts per status
  const counts = { all: delegates.length, active: 0, paused: 0, revoked: 0, expired: 0 };
  for (const d of delegates) {
    counts[getDelegateStatus(d.account)]++;
  }

  const filteredDelegates = filter === "all"
    ? delegates
    : delegates.filter((d) => getDelegateStatus(d.account) === filter);

  const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "revoked", label: "Revoked" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ color: COLORS.text, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
          Delegates ({delegates.length})
        </h3>
        <Link href={`/dashboard/vaults/${vaultNonce}/delegate/create`} style={{ textDecoration: "none" }}>
          <Button size="sm">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={14} /> Issue Delegate
            </span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      {delegates.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.key;
            const count = counts[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                style={{
                  padding: isMobile ? "8px 14px" : "6px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${isActive ? COLORS.emeraldBorder : COLORS.border}`,
                  backgroundColor: isActive ? COLORS.emeraldSubtle : "transparent",
                  color: isActive ? COLORS.emerald : COLORS.textMuted,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Spinner />
        </div>
      ) : delegates.length === 0 ? (
        <EmptyState
          icon={<Users size={40} color={COLORS.textDim} />}
          title="No Delegates"
          description="Issue a delegate key to authorize an AI agent or teenager."
          action={
            <Link href={`/dashboard/vaults/${vaultNonce}/delegate/create`} style={{ textDecoration: "none" }}>
              <Button size="sm">Issue First Delegate</Button>
            </Link>
          }
        />
      ) : filteredDelegates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: COLORS.textMuted, fontSize: "0.9rem" }}>
          No {filter} delegates
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredDelegates.map((d) => (
            <DelegateCard
              key={d.publicKey.toBase58()}
              delegate={d}
              loading={actionLoading}
              onPause={() => handleControl(d.account.nonce.toNumber(), 1, "paused")}
              onResume={() => handleControl(d.account.nonce.toNumber(), 2, "resumed")}
              onRevoke={() => setRevokeTarget(d.account.nonce.toNumber())}
            />
          ))}
        </div>
      )}

      <Modal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={async () => {
          if (revokeTarget !== null) {
            await handleControl(revokeTarget, 0, "revoked");
            setRevokeTarget(null);
          }
        }}
        title="Revoke Delegate"
        confirmLabel="Revoke"
        confirmVariant="danger"
        loading={actionLoading}
      >
        This action is <strong>permanent</strong> and cannot be undone. The delegate will lose all access to this vault immediately.
      </Modal>
    </div>
  );
}
