"use client";
import React from "react";

import { useEffect, useState, useCallback } from "react";
import { Check, X, Clock } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { COLORS } from "../../../_lib/constants";
import { formatAddress } from "../../../_lib/format";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { useToast } from "../../../_hooks/useToast";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import {
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
} from "../../../_actions/program-requests";

interface ProgramRequest {
  id: string;
  vaultPda: string;
  delegatePda: string;
  programAddress: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface ProgramRequestsProps {
  vaultPda: string;
  nonce: number;
  currentAllowList: string[];
  onSuccess: () => void;
}

export function ProgramRequests({ vaultPda, nonce, currentAllowList, onSuccess }: ProgramRequestsProps): React.JSX.Element | null {
  const { addToast } = useToast();
  const { client } = useFuinClient();
  const [requests, setRequests] = useState<ProgramRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchPendingRequests(vaultPda);
      setRequests(data.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [vaultPda]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (req: ProgramRequest) => {
    if (!client) {
      addToast("Wallet not connected", "error");
      return;
    }
    setActing(req.id);
    try {
      // Build new allow list with the requested program appended
      const newAllowList = [...currentAllowList];
      if (!newAllowList.includes(req.programAddress)) {
        if (newAllowList.length >= 16) {
          addToast("Allow list is full (max 16)", "error");
          setActing(null);
          return;
        }
        newAllowList.push(req.programAddress);
      }

      // On-chain: update vault allow list
      await client.updateVault(
        nonce,
        undefined,
        undefined,
        newAllowList.map((a) => new PublicKey(a)),
      );

      // DB: mark as approved
      await approveRequest(req.id);
      addToast("Program added to allow list", "success");
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      onSuccess();
    } catch (err: any) {
      addToast(err?.message || "Failed to approve", "error");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      await rejectRequest(id);
      addToast("Request rejected", "info");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      addToast("Failed to reject", "error");
    } finally {
      setActing(null);
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <GlassCard>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Clock size={16} color={COLORS.amber} />
        <h3 style={{ color: COLORS.text, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
          Program Requests ({requests.length})
        </h3>
      </div>
      <p style={{ fontSize: "0.8rem", color: COLORS.textDim, margin: "0 0 16px" }}>
        Agents are requesting access to these programs. Approving will add the program to the vault&apos;s on-chain allow list.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8rem", color: COLORS.textDim, marginBottom: "4px" }}>
                  Program
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: COLORS.textSecondary,
                    wordBreak: "break-all",
                  }}
                >
                  {req.programAddress}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginLeft: "12px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  disabled={acting === req.id}
                  style={{
                    background: COLORS.emerald,
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    cursor: acting === req.id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#000",
                    opacity: acting === req.id ? 0.5 : 1,
                  }}
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(req.id)}
                  disabled={acting === req.id}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: `1px solid ${COLORS.redBorder}`,
                    borderRadius: "8px",
                    padding: "6px 12px",
                    cursor: acting === req.id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.red,
                    opacity: acting === req.id ? 0.5 : 1,
                  }}
                >
                  <X size={12} /> Reject
                </button>
              </div>
            </div>

            <div style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
              <span style={{ fontWeight: 600 }}>Reason:</span> {req.reason}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "0.7rem", color: COLORS.textDim }}>
              <span>Delegate: {formatAddress(req.delegatePda)}</span>
              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
