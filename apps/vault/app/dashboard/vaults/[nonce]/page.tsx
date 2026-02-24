"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useVaultDetail } from "../../_hooks/useVaultDetail";
import { useFuinClient } from "../../_hooks/useFuinClient";
import { Spinner } from "../../_components/ui/Spinner";
import { EmptyState } from "../../_components/ui/EmptyState";
import { VaultOverview } from "./_components/VaultOverview";
import { DepositSection } from "./_components/DepositSection";
import { WithdrawSection } from "./_components/WithdrawSection";
import { FreezeToggle } from "./_components/FreezeToggle";
import { UpdatePoliciesForm } from "./_components/UpdatePoliciesForm";
import { DelegateList } from "./_components/DelegateList";
import { getVaultState } from "../../_lib/format";
import { COLORS } from "../../_lib/constants";

export default function VaultDetailPage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const nonce = Number(nonceStr);
  const { connected } = useFuinClient();
  const { vault, loading, refetch } = useVaultDetail(nonce);

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to view this vault.
      </div>
    );
  }

  if (loading) {
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

  const state = getVaultState(vault.account.state);
  const isFrozen = state === "frozen";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: "800px" }}
    >
      <Link
        href="/dashboard/vaults"
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
        <ArrowLeft size={16} /> Back to Vaults
      </Link>

      <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: "0 0 32px", letterSpacing: "-0.025em" }}>
        Vault #{nonce}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <VaultOverview vault={vault.account} vaultPda={vault.publicKey} balance={vault.balance} />

        <FreezeToggle nonce={nonce} isFrozen={isFrozen} onSuccess={refetch} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <DepositSection vaultPda={vault.publicKey} onSuccess={refetch} />
          <WithdrawSection nonce={nonce} onSuccess={refetch} />
        </div>

        <UpdatePoliciesForm
          nonce={nonce}
          currentDailyCap={vault.account.policies.spending.dailyCap.toNumber()}
          currentPerTxCap={vault.account.policies.spending.perTxCap.toNumber()}
          onSuccess={refetch}
        />

        <DelegateList vaultPda={vault.publicKey} vaultNonce={nonce} />
      </div>
    </motion.div>
  );
}
