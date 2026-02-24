"use client";

import { useState } from "react";
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { GlassCard } from "../../../_components/ui/GlassCard";
import { Input } from "../../../_components/ui/Input";
import { TransactionButton } from "../../../_components/TransactionButton";
import { COLORS } from "../../../_lib/constants";
import type { PublicKey } from "@solana/web3.js";

interface DepositSectionProps {
  vaultPda: PublicKey;
  onSuccess: () => void;
}

export function DepositSection({ vaultPda, onSuccess }: DepositSectionProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState("1");

  const handleDeposit = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) throw new Error("Wallet not connected");

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: vaultPda,
        lamports: Number(amount) * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig);
    return sig;
  };

  return (
    <GlassCard>
      <h3 style={{ color: COLORS.text, fontSize: "1rem", fontWeight: 700, margin: "0 0 16px" }}>
        Deposit SOL
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
          label="Deposit"
          loadingLabel="Sending..."
          onClick={handleDeposit}
          onSuccess={onSuccess}
          size="md"
        />
      </div>
    </GlassCard>
  );
}
