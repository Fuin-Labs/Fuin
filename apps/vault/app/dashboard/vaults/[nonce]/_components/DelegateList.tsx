"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useDelegatesByVault } from "../../../_hooks/useDelegates";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { useToast } from "../../../_hooks/useToast";
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

interface DelegateListProps {
  vaultPda: PublicKey;
  vaultNonce: number;
}

export function DelegateList({ vaultPda, vaultNonce }: DelegateListProps) {
  const { client, publicKey } = useFuinClient();
  const { addToast } = useToast();
  const { delegates, loading, refetch } = useDelegatesByVault(vaultPda);
  const [actionLoading, setActionLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<number | null>(null);
  const [labelsLoaded, setLabelsLoaded] = useState(false);

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {delegates.map((d) => (
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
