"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useDelegatesByVault } from "../../../_hooks/useDelegates";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { useToast } from "../../../_hooks/useToast";
import { DelegateCard } from "../../../_components/DelegateCard";
import { Button } from "../../../_components/ui/Button";
import { EmptyState } from "../../../_components/ui/EmptyState";
import { Spinner } from "../../../_components/ui/Spinner";
import { COLORS } from "../../../_lib/constants";
import type { PublicKey } from "@solana/web3.js";

interface DelegateListProps {
  vaultPda: PublicKey;
  vaultNonce: number;
}

export function DelegateList({ vaultPda, vaultNonce }: DelegateListProps) {
  const { client } = useFuinClient();
  const { addToast } = useToast();
  const { delegates, loading, refetch } = useDelegatesByVault(vaultPda);
  const [actionLoading, setActionLoading] = useState(false);

  const handleControl = async (delegateNonce: number, status: number, label: string) => {
    if (!client) return;
    setActionLoading(true);
    try {
      await client.delegateControl(vaultNonce, delegateNonce, status);
      addToast(`Delegate ${label}`, "success");
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
              onRevoke={() => handleControl(d.account.nonce.toNumber(), 0, "revoked")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
