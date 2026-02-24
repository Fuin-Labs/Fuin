"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { CAN_TRANSFER } from "@fuin/sdk";
import { useFuinClient } from "../../../../_hooks/useFuinClient";
import { GlassCard } from "../../../../_components/ui/GlassCard";
import { Input } from "../../../../_components/ui/Input";
import { PermissionCheckboxes } from "../../../../_components/PermissionCheckboxes";
import { TransactionButton } from "../../../../_components/TransactionButton";
import { COLORS } from "../../../../_lib/constants";

export default function CreateDelegatePage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const vaultNonce = Number(nonceStr);
  const router = useRouter();
  const { client, connected } = useFuinClient();

  const [agentKey, setAgentKey] = useState("");
  const [permissions, setPermissions] = useState(CAN_TRANSFER);
  const [dailyLimit, setDailyLimit] = useState("1");
  const [maxUses, setMaxUses] = useState("0");
  const [validityHours, setValidityHours] = useState("24");

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to issue a delegate.
      </div>
    );
  }

  const handleIssue = async () => {
    if (!client) throw new Error("Client not ready");
    if (!agentKey) throw new Error("Agent public key required");

    let agentPubkey: PublicKey;
    try {
      agentPubkey = new PublicKey(agentKey);
    } catch {
      throw new Error("Invalid public key format");
    }

    const delegateNonce = Math.floor(Math.random() * 1000000);
    const validitySeconds = Number(validityHours) * 3600;

    const result = await client.issueDelegate(
      vaultNonce,
      delegateNonce,
      agentPubkey,
      permissions,
      Number(dailyLimit),
      Number(maxUses),
      validitySeconds
    );
    return result.signature;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: "560px" }}
    >
      <Link
        href={`/dashboard/vaults/${vaultNonce}`}
        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: "24px" }}
      >
        <ArrowLeft size={16} /> Back to Vault #{vaultNonce}
      </Link>

      <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.025em" }}>
        Issue Delegate
      </h2>
      <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "0 0 32px", lineHeight: 1.6 }}>
        Authorize an AI agent or teenager with scoped permissions and spending limits.
      </p>

      <GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Input
            label="Agent / Teenager Public Key"
            value={agentKey}
            onChange={setAgentKey}
            placeholder="Solana public key (base58)"
            hint="The wallet address that will use this delegate key"
          />

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: "10px" }}>
              Permissions
            </label>
            <PermissionCheckboxes value={permissions} onChange={setPermissions} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <Input
              label="Daily Limit (SOL)"
              value={dailyLimit}
              onChange={setDailyLimit}
              type="number"
              hint="Max SOL per epoch"
            />
            <Input
              label="Max Uses"
              value={maxUses}
              onChange={setMaxUses}
              type="number"
              hint="0 = unlimited"
            />
            <Input
              label="Validity (hours)"
              value={validityHours}
              onChange={setValidityHours}
              type="number"
              hint="Expiry duration"
            />
          </div>

          <TransactionButton
            label="Issue Delegate Key"
            loadingLabel="Issuing..."
            onClick={handleIssue}
            onSuccess={() => router.push(`/dashboard/vaults/${vaultNonce}`)}
            fullWidth
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}
