"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { CAN_TRANSFER, findVaultPda, findDelegatePda } from "@fuin-labs/sdk";
import { useFuinClient } from "../../../../_hooks/useFuinClient";
import { useToast } from "../../../../_hooks/useToast";
import { GlassCard } from "../../../../_components/ui/GlassCard";
import { Input } from "../../../../_components/ui/Input";
import { TransactionButton } from "../../../../_components/TransactionButton";
import { COLORS, GLASS_STYLE } from "../../../../_lib/constants";
import { useIsMobile } from "../../../../_hooks/useMediaQuery";
import { copyToClipboard, formatAddress } from "../../../../_lib/format";
import { setSingleLabelCache } from "../../../../_lib/delegateLabels";
import { saveDelegateLabel } from "../../../../_actions/delegates";
import { logDelegateControlAction } from "../../../../_actions/audit";

interface CreatedDelegate {
  pda: string;
  walletAddress: string;
  dailyAllowance: string;
  validityDays: string;
  delegateNonce: number;
}

export default function KidDelegatePage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const vaultNonce = Number(nonceStr);
  const router = useRouter();
  const { client, connected, publicKey } = useFuinClient();
  const { addToast } = useToast();
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [dailyAllowance, setDailyAllowance] = useState("0.5");
  const [validityDays, setValidityDays] = useState("30");
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
    if (!walletAddress) throw new Error("Wallet address required");
    if (!name.trim()) throw new Error("Name required");

    let kidPubkey: PublicKey;
    try {
      kidPubkey = new PublicKey(walletAddress);
    } catch {
      throw new Error("Invalid public key format");
    }

    const delegateNonce = Math.floor(Math.random() * 1000000);
    const validitySeconds = Number(validityDays) * 86400;

    const result = await client.issueDelegate(
      vaultNonce,
      delegateNonce,
      kidPubkey,
      CAN_TRANSFER,
      Number(dailyAllowance),
      0, // unlimited uses
      validitySeconds
    );

    // Compute delegate PDA for label storage
    const [vaultPda] = findVaultPda(publicKey, new BN(vaultNonce));
    const [delegatePda] = findDelegatePda(vaultPda, new BN(delegateNonce));

    // Save label to DB and update client cache
    const pdaStr = delegatePda.toBase58();
    const vaultPdaStr = vaultPda.toBase58();
    const guardianStr = publicKey.toBase58();

    await saveDelegateLabel({
      delegatePda: pdaStr,
      vaultPda: vaultPdaStr,
      guardian: guardianStr,
      label: name.trim(),
      kind: "kid",
    });
    setSingleLabelCache(pdaStr, name.trim());

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
      walletAddress,
      dailyAllowance,
      validityDays,
      delegateNonce,
    });

    return result.signature;
  };

  if (created) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "560px", margin: "0 auto" }}
      >
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "8px 0" }}>
            <CheckCircle2 size={48} color={COLORS.green} />
            
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
            <DetailRow label="Delegate PDA" value={created.pda} onCopy={() => handleCopy(created.pda)} mono />
            <DetailRow label="Wallet Address" value={created.walletAddress} onCopy={() => handleCopy(created.walletAddress)} mono />
            <DetailRow label="Daily Allowance" value={`${created.dailyAllowance} SOL`} />
            <DetailRow label="Valid For" value={`${created.validityDays} days`} />
          </div>

          {/* Quick Start */}
          <div style={{ marginTop: "24px" }}>
            <h4 style={{ color: COLORS.text, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px" }}>
              Quick Start
            </h4>
            <ol style={{ color: COLORS.textMuted, fontSize: "0.9rem", lineHeight: 1.8, margin: 0, paddingLeft: "20px" }}>
              <li>Ask your kid to install the Fuin Wallet extension from Chrome Web Store</li>
              <li>Open the extension and import their wallet using the address you just added</li>
              <li>They&apos;re ready to spend within the limits you set</li>
            </ol>
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
              color: COLORS.emerald,
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
              <li>Install Fuin Wallet from the Chrome Web Store</li>
              <li>Click the extension icon &rarr; &ldquo;Import Existing Wallet&rdquo;</li>
              <li>Enter or scan the wallet private key (the kid&apos;s own wallet, not yours)</li>
              <li>The wallet auto-detects delegate permissions from the vault</li>
              <li>Your kid can now send SOL transfers up to {created.dailyAllowance} SOL per epoch</li>
              <li>To adjust limits: go back to the vault dashboard &rarr; find this delegate &rarr; Update</li>
              <li>To pause/revoke: click Pause or Revoke on the delegate card</li>
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
                border: `1px solid ${COLORS.emeraldBorder}`,
                backgroundColor: COLORS.emeraldSubtle,
                color: COLORS.emerald,
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
      style={{ width: "100%", maxWidth: "560px", margin: "0 auto" }}
    >
      <Link
        href={`/dashboard/vaults/${vaultNonce}/delegate/create`}
        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: "24px" }}
      >
        <ArrowLeft size={16} /> Back
      </Link>

      
      <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", margin: "0 0 32px", lineHeight: 1.6 }}>
        Set up a simple spending allowance with transfer-only access.
      </p>

      <GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Alex"
            hint="A label to identify this delegate"
          />

          <Input
            label="Wallet Address"
            value={walletAddress}
            onChange={setWalletAddress}
            placeholder="Solana public key (base58)"
            hint="Your kid's wallet address"
          />

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
            <Input
              label="Daily Allowance (SOL)"
              value={dailyAllowance}
              onChange={setDailyAllowance}
              type="number"
              hint="Max SOL per epoch"
            />
            <Input
              label="Valid For (days)"
              value={validityDays}
              onChange={setValidityDays}
              type="number"
              hint="How long access lasts"
            />
          </div>

          {/* Info box */}
          <div
            style={{
              ...GLASS_STYLE,
              backgroundColor: COLORS.emeraldSubtle,
              borderColor: COLORS.emeraldBorder,
              padding: "14px 16px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              color: COLORS.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Your kid can send transfers up to {dailyAllowance || "0"} SOL per epoch (~2-3 days).
            You can pause or revoke access anytime.
          </div>

          <TransactionButton
            label="Create Allowance"
            loadingLabel="Creating..."
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
