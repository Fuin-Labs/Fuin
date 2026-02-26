"use client";

import { useState } from "react";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Input } from "../../../_components/ui/Input";
import { TransactionButton } from "../../../_components/TransactionButton";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { formatSol } from "../../../_lib/format";
import { COLORS } from "../../../_lib/constants";
import { useIsMobile } from "../../../_hooks/useMediaQuery";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface UpdatePoliciesFormProps {
  nonce: number;
  currentDailyCap: number;
  currentPerTxCap: number;
  onSuccess: () => void;
}

export function UpdatePoliciesForm({ nonce, currentDailyCap, currentPerTxCap, onSuccess }: UpdatePoliciesFormProps) {
  const { client } = useFuinClient();
  const isMobile = useIsMobile();
  const [dailyCap, setDailyCap] = useState(String(currentDailyCap / LAMPORTS_PER_SOL));
  const [perTxCap, setPerTxCap] = useState(String(currentPerTxCap / LAMPORTS_PER_SOL));

  const handleUpdate = async () => {
    if (!client) throw new Error("Client not ready");
    return client.updateVault(nonce, Number(dailyCap), Number(perTxCap));
  };

  return (
    <GlassCard>
      <h3 style={{ color: COLORS.text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>
        Update Policies
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <Input
          label="Daily Cap (SOL)"
          value={dailyCap}
          onChange={setDailyCap}
          type="number"
        />
        <Input
          label="Per-Tx Cap (SOL)"
          value={perTxCap}
          onChange={setPerTxCap}
          type="number"
        />
      </div>
      <TransactionButton
        label="Update Policies"
        loadingLabel="Updating..."
        onClick={handleUpdate}
        onSuccess={onSuccess}
        variant="secondary"
        fullWidth
      />
    </GlassCard>
  );
}
