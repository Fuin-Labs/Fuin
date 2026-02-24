"use client";

import { useState } from "react";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Input } from "../../../_components/ui/Input";
import { TransactionButton } from "../../../_components/TransactionButton";
import { useFuinClient } from "../../../_hooks/useFuinClient";
import { COLORS } from "../../../_lib/constants";

interface WithdrawSectionProps {
  nonce: number;
  onSuccess: () => void;
}

export function WithdrawSection({ nonce, onSuccess }: WithdrawSectionProps) {
  const { client } = useFuinClient();
  const [amount, setAmount] = useState("1");

  const handleWithdraw = async () => {
    if (!client) throw new Error("Client not ready");
    return client.withdraw(nonce, Number(amount));
  };

  return (
    <GlassCard>
      <h3 style={{ color: COLORS.text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>
        Withdraw SOL
      </h3>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Amount (SOL)"
            value={amount}
            onChange={setAmount}
            type="number"
            placeholder="1.0"
          />
        </div>
        <TransactionButton
          label="Withdraw"
          loadingLabel="Withdrawing..."
          onClick={handleWithdraw}
          onSuccess={onSuccess}
          variant="secondary"
          size="md"
        />
      </div>
    </GlassCard>
  );
}
