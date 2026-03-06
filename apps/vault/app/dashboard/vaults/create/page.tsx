"use client";
import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { useFuinClient } from "../../_hooks/useFuinClient";
import { useAutoNonce } from "../../_hooks/useAutoNonce";
import { GlassCard } from "../../_components/ui/GlassCard";
import { Input } from "../../_components/ui/Input";
import { TransactionButton } from "../../_components/TransactionButton";
import { COLORS } from "../../_lib/constants";
import { useIsMobile } from "../../_hooks/useMediaQuery";
import { useToast } from "../../_hooks/useToast";
import { saveVault } from "../../_actions/vaults";

export default function CreateVaultPage(): React.JSX.Element {
  const router = useRouter();
  const { client, connected, publicKey } = useFuinClient();
  const { nextNonce } = useAutoNonce();
  const isMobile = useIsMobile();

  const { addToast } = useToast();
  const [nonce, setNonce] = useState("");
  const [dailyCap, setDailyCap] = useState("10");
  const [perTxCap, setPerTxCap] = useState("1");
  const [allowedPrograms, setAllowedPrograms] = useState<string[]>([]);
  const [programInput, setProgramInput] = useState("");
  const [programsExpanded, setProgramsExpanded] = useState(false);

  // Use auto-discovered nonce as default
  const effectiveNonce = nonce === "" ? String(nextNonce) : nonce;

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to create a vault.
      </div>
    );
  }

  const handleAddProgram = () => {
    const addr = programInput.trim();
    if (!addr) return;
    try {
      new PublicKey(addr);
    } catch {
      addToast("Invalid Solana address", "error");
      return;
    }
    if (allowedPrograms.includes(addr)) {
      addToast("Program already added", "error");
      return;
    }
    if (allowedPrograms.length >= 16) {
      addToast("Maximum 16 programs allowed", "error");
      return;
    }
    setAllowedPrograms((prev) => [...prev, addr]);
    setProgramInput("");
  };

  const handleRemoveProgram = (addr: string) => {
    setAllowedPrograms((prev) => prev.filter((p) => p !== addr));
  };

  const handleCreate = async () => {
    if (!client || !publicKey) throw new Error("Client not ready");
    const programKeys = allowedPrograms.map((a) => new PublicKey(a));
    const result = await client.createVault(
      Number(effectiveNonce),
      Number(dailyCap),
      Number(perTxCap),
      programKeys
    );

    // Persist vault to DB (fire-and-forget)
    saveVault({
      pda: result.vault.toBase58(),
      guardian: publicKey.toBase58(),
      nonce: Number(effectiveNonce),
    }).catch(() => {});

    return result.signature;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ width: "100%", maxWidth: "560px", margin: "0 auto" }}
    >
      <Link href="/dashboard/vaults" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: "24px" }}>
        <ArrowLeft size={16} /> Back to Vaults
      </Link>

      
      <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "0 0 32px", lineHeight: 1.6 }}>
        Initialize an on-chain authorization vault with spending policies.
      </p>

      <GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Input
            label="Vault Nonce"
            value={effectiveNonce}
            onChange={setNonce}
            type="number"
            hint="Unique identifier for this vault. Auto-filled with next available."
          />

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
            <Input
              label="Daily Cap (SOL)"
              value={dailyCap}
              onChange={setDailyCap}
              type="number"
              hint="Maximum SOL delegates can spend per epoch"
            />
            <Input
              label="Per-Tx Cap (SOL)"
              value={perTxCap}
              onChange={setPerTxCap}
              type="number"
              hint="Maximum SOL per single transaction"
            />
          </div>

          {/* Allowed Programs (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setProgramsExpanded(!programsExpanded)}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {programsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Allowed Programs (Optional)
              {allowedPrograms.length > 0 && (
                <span style={{ color: COLORS.emerald, fontSize: "0.75rem" }}>
                  {allowedPrograms.length}
                </span>
              )}
            </button>

            {programsExpanded && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={programInput}
                      onChange={setProgramInput}
                      placeholder="Program address (base58)"
                      hint="Restrict vault to only interact with these programs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProgram}
                    style={{
                      background: COLORS.emerald,
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      marginTop: "24px",
                    }}
                  >
                    <Plus size={16} color="#000" />
                  </button>
                </div>

                {allowedPrograms.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {allowedPrograms.map((addr) => (
                      <div
                        key={addr}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.8rem",
                          fontFamily: "var(--font-geist-mono), monospace",
                          color: COLORS.textSecondary,
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {addr}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProgram(addr)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                        >
                          <Trash2 size={14} color={COLORS.red} />
                        </button>
                      </div>
                    ))}
                    <span style={{ fontSize: "0.7rem", color: COLORS.textDim }}>
                      {allowedPrograms.length}/16 programs
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <TransactionButton
            label="Create Vault"
            loadingLabel="Creating..."
            onClick={handleCreate}
            onSuccess={() => router.push(`/dashboard/vaults/${effectiveNonce}`)}
            fullWidth
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}
