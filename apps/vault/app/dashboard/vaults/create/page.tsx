"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useFuinClient } from "../../_hooks/useFuinClient";
import { useAutoNonce } from "../../_hooks/useAutoNonce";
import { GlassCard } from "../../_components/ui/GlassCard";
import { Input } from "../../_components/ui/Input";
import { TransactionButton } from "../../_components/TransactionButton";
import { COLORS } from "../../_lib/constants";
import { useIsMobile } from "../../_hooks/useMediaQuery";
import { saveVault } from "../../_actions/vaults";

export default function CreateVaultPage() {
  const router = useRouter();
  const { client, connected, publicKey } = useFuinClient();
  const { nextNonce } = useAutoNonce();
  const isMobile = useIsMobile();

  const [nonce, setNonce] = useState("");
  const [dailyCap, setDailyCap] = useState("10");
  const [perTxCap, setPerTxCap] = useState("1");

  // Use auto-discovered nonce as default
  const effectiveNonce = nonce === "" ? String(nextNonce) : nonce;

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to create a vault.
      </div>
    );
  }

  const handleCreate = async () => {
    if (!client || !publicKey) throw new Error("Client not ready");
    const result = await client.createVault(
      Number(effectiveNonce),
      Number(dailyCap),
      Number(perTxCap),
      []
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
