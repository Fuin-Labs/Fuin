"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { CAN_TRANSFER, findVaultPda, findDelegatePda } from "@fuin/sdk";
import { useFuinClient } from "../../../../_hooks/useFuinClient";
import { useToast } from "../../../../_hooks/useToast";
import { GlassCard } from "../../../../_components/ui/GlassCard";
import { Input } from "../../../../_components/ui/Input";
import { PermissionCheckboxes } from "../../../../_components/PermissionCheckboxes";
import { TransactionButton } from "../../../../_components/TransactionButton";
import { COLORS, GLASS_STYLE } from "../../../../_lib/constants";
import { copyToClipboard, formatAddress } from "../../../../_lib/format";
import { parsePermissions } from "../../../../_lib/permissions";
import { saveDelegateLabel } from "../../../../_actions/delegates";
import { logDelegateControlAction } from "../../../../_actions/audit";

interface CreatedDelegate {
  pda: string;
  agentKey: string;
  vaultNonce: number;
  delegateNonce: number;
  permissions: number;
  dailyLimit: string;
  maxUses: string;
  validityHours: string;
}

export default function OpenClawDelegatePage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const vaultNonce = Number(nonceStr);
  const router = useRouter();
  const { client, connected, publicKey } = useFuinClient();
  const { addToast } = useToast();

  const [agentKey, setAgentKey] = useState("");
  const [permissions, setPermissions] = useState(CAN_TRANSFER);
  const [dailyLimit, setDailyLimit] = useState("1");
  const [maxUses, setMaxUses] = useState("0");
  const [validityHours, setValidityHours] = useState("24");
  const [created, setCreated] = useState<CreatedDelegate | null>(null);
  const [showFull, setShowFull] = useState(false);

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to issue a delegate.
      </div>
    );
  }

  const handleCopy = async (text: string) => {
    if (await copyToClipboard(text)) addToast("Copied", "info");
  };

  const handleIssue = async () => {
    if (!client || !publicKey) throw new Error("Client not ready");
    if (!agentKey) throw new Error("Agent public key required");

    let agentPubkey: PublicKey;
    try {
      agentPubkey = new PublicKey(agentKey);
    } catch {
      throw new Error("Invalid public key format");
    }

    const delegateNonce = Math.floor(Math.random() * 1000000);
    const validitySeconds = Number(validityHours) * 3600;
    const limitLamports = Math.floor(Number(dailyLimit) * LAMPORTS_PER_SOL);

    const result = await client.issueDelegate(
      vaultNonce,
      delegateNonce,
      agentPubkey,
      permissions,
      limitLamports,
      Number(maxUses),
      validitySeconds
    );

    const [vaultPda] = findVaultPda(publicKey, new BN(vaultNonce));
    const [delegatePda] = findDelegatePda(vaultPda, new BN(delegateNonce));

    const pdaStr = delegatePda.toBase58();
    const vaultPdaStr = vaultPda.toBase58();
    const guardianStr = publicKey.toBase58();

    // Save label to DB
    await saveDelegateLabel({
      delegatePda: pdaStr,
      vaultPda: vaultPdaStr,
      guardian: guardianStr,
      label: `Agent ${agentKey.slice(0, 6)}`,
      kind: "openclaw",
    });

    // Audit log (fire-and-forget)
    logDelegateControlAction({
      delegatePda: pdaStr,
      vaultPda: vaultPdaStr,
      guardian: guardianStr,
      action: "created",
      txSignature: result.signature,
    }).catch(() => {});

    setCreated({
      pda: pdaStr,
      agentKey,
      vaultNonce,
      delegateNonce,
      permissions,
      dailyLimit,
      maxUses,
      validityHours,
    });

    return result.signature;
  };

  if (created) {
    const guardianStr = publicKey?.toBase58() ?? "";
    const perms = parsePermissions(created.permissions);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: "600px" }}
      >
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "8px 0" }}>
            <CheckCircle2 size={48} color={COLORS.green} />
            <h2 style={{ color: COLORS.text, fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
              Agent Delegate Created
            </h2>
            <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: 0, lineHeight: 1.6 }}>
              Your AI agent is authorized with {perms.join(", ")} permissions.
            </p>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
            <DetailRow label="Delegate PDA" value={created.pda} onCopy={() => handleCopy(created.pda)} mono />
            <DetailRow label="Agent Public Key" value={created.agentKey} onCopy={() => handleCopy(created.agentKey)} mono />
            <DetailRow label="Vault Nonce" value={String(created.vaultNonce)} />
            <DetailRow label="Delegate Nonce" value={String(created.delegateNonce)} />
            <DetailRow label="Permissions" value={perms.join(", ")} />
            <DetailRow label="Daily Limit" value={`${created.dailyLimit} SOL`} />
            <DetailRow label="Max Uses" value={created.maxUses === "0" ? "Unlimited" : created.maxUses} />
            <DetailRow label="Validity" value={`${created.validityHours} hours`} />
          </div>

          {/* Quick Start */}
          <div style={{ marginTop: "24px" }}>
            <h4 style={{ color: COLORS.text, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px" }}>
              Quick Start
            </h4>
            <CodeBlock>{`npm install @fuin/sdk`}</CodeBlock>
            <CodeBlock>{`import { FuinClient } from "@fuin/sdk";

const client = new FuinClient(connection, agentWallet);
await client.transferSol(
  "${formatAddress(guardianStr)}",  // guardian
  ${created.vaultNonce},              // vault nonce
  ${created.delegateNonce},              // delegate nonce
  destination,
  amount,
  agentKeypair
);`}</CodeBlock>
          </div>

          {/* Full Instructions (collapsible) */}
          <button
            type="button"
            onClick={() => setShowFull(!showFull)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "16px",
              background: "none",
              border: "none",
              color: COLORS.purple,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            {showFull ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showFull ? "Hide" : "Full"} Instructions
          </button>

          {showFull && (
            <ol style={{ color: COLORS.textMuted, fontSize: "0.85rem", lineHeight: 1.8, margin: "12px 0 0", paddingLeft: "20px" }}>
              <li>Install the SDK: <code style={{ color: COLORS.purple }}>npm install @fuin/sdk @solana/web3.js @coral-xyz/anchor bn.js</code></li>
              <li>Set up connection to Solana (devnet/mainnet)</li>
              <li>Load your agent keypair (the public key you registered above)</li>
              <li>Initialize FuinClient with connection + wallet</li>
              <li>Available methods based on permissions:
                <ul style={{ marginTop: "4px", paddingLeft: "16px" }}>
                  <li><code style={{ color: COLORS.textSecondary }}>transferSol(guardian, vaultNonce, delegateNonce, destination, amountSol, agentKeypair)</code></li>
                  <li><code style={{ color: COLORS.textSecondary }}>transferSpl(guardian, vaultNonce, delegateNonce, mint, destination, amount, agentKeypair)</code></li>
                </ul>
              </li>
              <li>Error handling: catch <code style={{ color: COLORS.textSecondary }}>DailyLimitExceeded</code>, <code style={{ color: COLORS.textSecondary }}>PermissionDenied</code>, <code style={{ color: COLORS.textSecondary }}>DelegateInactive</code></li>
              <li>Spending resets each Solana epoch (~2-3 days), not daily</li>
            </ol>
          )}

          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/vaults/${vaultNonce}`)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                backgroundColor: COLORS.purpleSubtle,
                color: COLORS.purple,
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: "560px" }}
    >
      <Link
        href={`/dashboard/vaults/${vaultNonce}/delegate/create`}
        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: "24px" }}
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <h2 style={{ color: COLORS.text, fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.025em" }}>
        OpenClaw / AI Agent
      </h2>
      <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "0 0 32px", lineHeight: 1.6 }}>
        Authorize an AI agent with granular permissions and policy constraints.
      </p>

      <GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Input
            label="Agent Public Key"
            value={agentKey}
            onChange={setAgentKey}
            placeholder="Solana public key (base58)"
            hint="The agent wallet that will use this delegate key"
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
            fullWidth
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

function DetailRow({ label, value, mono, onCopy }: { label: string; value: string; mono?: boolean; onCopy?: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ fontSize: "0.8rem", color: COLORS.textDim }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "0.85rem", color: COLORS.textSecondary, fontFamily: mono ? "var(--font-geist-mono), monospace" : "inherit" }}>
          {mono ? formatAddress(value) : value}
        </span>
        {onCopy && (
          <Copy size={12} color={COLORS.textDim} style={{ cursor: "pointer" }} onClick={onCopy} />
        )}
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "10px",
        padding: "14px 16px",
        margin: "8px 0",
        fontSize: "0.8rem",
        fontFamily: "var(--font-geist-mono), monospace",
        color: COLORS.textSecondary,
        overflowX: "auto",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {children}
    </pre>
  );
}
