"use client";
import React from "react";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { CAN_TRANSFER, findVaultPda, findDelegatePda } from "@fuin-labs/sdk";
import { useFuinClient } from "../../../../_hooks/useFuinClient";
import { useIsMobile } from "../../../../_hooks/useMediaQuery";
import { useToast } from "../../../../_hooks/useToast";
import { GlassCard } from "../../../../_components/ui/GlassCard";
import { Input } from "../../../../_components/ui/Input";
import { PermissionCheckboxes } from "../../../../_components/PermissionCheckboxes";
import { TransactionButton } from "../../../../_components/TransactionButton";
import { COLORS } from "../../../../_lib/constants";
import { copyToClipboard, formatAddress } from "../../../../_lib/format";
import { parsePermissions } from "../../../../_lib/permissions";
import { saveDelegateLabel } from "../../../../_actions/delegates";
import { logDelegateControlAction } from "../../../../_actions/audit";

// Inline base58 encoder (Bitcoin alphabet) — avoids adding bs58 to vault deps.
// The byte-level math is the standard "big-int -> base58 with leading-zero
// preservation" algorithm used by every base58 library.
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  // Count leading zero bytes — each becomes a leading "1" in base58.
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  // Allocate enough output digits: log(256)/log(58) ~= 1.37, round up.
  const size = Math.floor(((bytes.length - zeros) * 138) / 100) + 1;
  const b58 = new Uint8Array(size);

  let length = 0;
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]!;
    let j = 0;
    // Apply the digit to the output buffer, propagating carries.
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * b58[k]!;
      b58[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    length = j;
  }

  // Skip leading zero-bytes in the result buffer.
  let it = size - length;
  while (it < size && b58[it] === 0) it++;

  let result = "1".repeat(zeros);
  for (; it < size; it++) result += BASE58_ALPHABET[b58[it]!];
  return result;
}

interface CreatedSession {
  pda: string;
  sessionPubkey: string;
  sessionSecret: string;
  vaultNonce: number;
  delegateNonce: number;
  permissions: number;
  dailyLimit: string;
  maxUses: string;
  validityHours: string;
  txSignature: string;
}

export default function SessionDelegatePage({ params }: { params: Promise<{ nonce: string }> }): React.JSX.Element {
  const { nonce: nonceStr } = use(params);
  const vaultNonce = Number(nonceStr);
  const router = useRouter();
  const { client, connected, publicKey } = useFuinClient();
  const isMobile = useIsMobile();
  const { addToast } = useToast();

  const [permissions, setPermissions] = useState<number>(CAN_TRANSFER);
  const [dailyLimit, setDailyLimit] = useState("1");
  const [maxUses, setMaxUses] = useState("0");
  const [validityHours, setValidityHours] = useState("24");
  const [created, setCreated] = useState<CreatedSession | null>(null);

  if (!connected) {
    return (
      <div style={{ color: COLORS.textMuted, textAlign: "center", paddingTop: "80px" }}>
        Connect your wallet to create an AI agent session.
      </div>
    );
  }

  const handleCopy = async (text: string, label?: string) => {
    if (await copyToClipboard(text)) addToast(label ? `${label} copied` : "Copied", "info");
  };

  const handleIssue = async () => {
    if (!client || !publicKey) throw new Error("Client not ready");

    // 1. Generate session keypair in the browser. The secret never leaves
    //    this React state — we display it, the user copies it, and the
    //    component unmounts after navigation.
    const sessionKp = Keypair.generate();

    // 2. Issue delegate via the existing SDK call — Phantom signs the tx.
    const delegateNonce = Math.floor(Math.random() * 1_000_000);
    const validitySeconds = Number(validityHours) * 3600;

    const result = await client.issueDelegate(
      vaultNonce,
      delegateNonce,
      sessionKp.publicKey,
      permissions,
      Number(dailyLimit),
      Number(maxUses),
      validitySeconds
    );

    // 3. Derive PDAs for display + DB save.
    const [vaultPda] = findVaultPda(publicKey, new BN(vaultNonce));
    const [delegatePda] = findDelegatePda(vaultPda, new BN(delegateNonce));
    const pdaStr = delegatePda.toBase58();
    const vaultPdaStr = vaultPda.toBase58();
    const guardianStr = publicKey.toBase58();
    const sessionPubkeyStr = sessionKp.publicKey.toBase58();

    // 4. Save label to DB + audit log (fire-and-forget).
    await saveDelegateLabel({
      delegatePda: pdaStr,
      vaultPda: vaultPdaStr,
      guardian: guardianStr,
      label: `Session ${sessionPubkeyStr.slice(0, 6)}`,
      kind: "openclaw",
    });
    logDelegateControlAction({
      delegatePda: pdaStr,
      vaultPda: vaultPdaStr,
      guardian: guardianStr,
      action: "created",
      txSignature: result.signature,
    }).catch(() => {});

    setCreated({
      pda: pdaStr,
      sessionPubkey: sessionPubkeyStr,
      sessionSecret: encodeBase58(sessionKp.secretKey),
      vaultNonce,
      delegateNonce,
      permissions,
      dailyLimit,
      maxUses,
      validityHours,
      txSignature: result.signature,
    });

    return result.signature;
  };

  if (created) {
    const perms = parsePermissions(created.permissions);
    const mcpSnippet = `"DELEGATE_PRIVATE_KEY": "${created.sessionSecret}",
"FUIN_RELAYER_URL": "http://127.0.0.1:8788"`;
    const explorerBase = "https://explorer.solana.com";
    const delegateExplorer = `${explorerBase}/address/${created.pda}?cluster=devnet`;
    const txExplorer = `${explorerBase}/tx/${created.txSignature}?cluster=devnet`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "640px", margin: "0 auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", marginBottom: "24px" }}>
          <CheckCircle2 size={48} color={COLORS.green} />
          <h2 style={{ color: COLORS.text, fontSize: "1.4rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Session Created
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: "0.9rem", margin: 0, maxWidth: "440px", lineHeight: 1.5 }}>
            Your AI agent session is live on-chain. Copy the secret below — it&apos;s only shown once.
          </p>
        </div>

        {/* Block 1 — Session Secret (DANGER copy-once) */}
        <div
          style={{
            border: `1px solid ${COLORS.redBorder}`,
            backgroundColor: COLORS.redSubtle,
            borderRadius: "2px",
            padding: "18px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <AlertTriangle size={18} color={COLORS.red} />
            <h3 style={{ color: COLORS.red, fontSize: "0.95rem", fontWeight: 700, margin: 0, letterSpacing: "0.01em" }}>
              Save this secret now
            </h3>
          </div>
          <p style={{ color: COLORS.textSecondary, fontSize: "0.82rem", margin: "0 0 12px", lineHeight: 1.5 }}>
            This is the only time you&apos;ll see the secret. We don&apos;t store it. Lose it = lose the session.
          </p>
          <CodeBlock value={created.sessionSecret} onCopy={() => handleCopy(created.sessionSecret, "Secret")} />
        </div>

        {/* Block 2 — MCP env snippet */}
        <GlassCard>
          <h3 style={{ color: COLORS.text, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px" }}>
            Paste into <code style={{ color: COLORS.emerald, fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.85rem" }}>.mcp.json</code> env block
          </h3>
          <p style={{ color: COLORS.textMuted, fontSize: "0.82rem", margin: "0 0 12px", lineHeight: 1.5 }}>
            Replace the existing <code style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace" }}>env</code> block in your Claude config, then restart Claude.
          </p>
          <CodeBlock value={mcpSnippet} onCopy={() => handleCopy(mcpSnippet, "MCP snippet")} />
        </GlassCard>

        {/* Block 3 — Session summary */}
        <div style={{ marginTop: "16px" }}>
          <GlassCard>
            <h3 style={{ color: COLORS.text, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px" }}>
              Session Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <DetailRow
                label="Session Pubkey"
                value={created.sessionPubkey}
                onCopy={() => handleCopy(created.sessionPubkey, "Pubkey")}
                mono
              />
              <DetailRow
                label="Delegate PDA"
                value={created.pda}
                onCopy={() => handleCopy(created.pda, "Delegate PDA")}
                mono
                externalHref={delegateExplorer}
              />
              <DetailRow label="Vault Nonce" value={String(created.vaultNonce)} />
              <DetailRow label="Delegate Nonce" value={String(created.delegateNonce)} />
              <DetailRow label="Permissions" value={perms.join(", ") || "None"} />
              <DetailRow label="Daily Limit" value={`${created.dailyLimit} SOL`} />
              <DetailRow label="Max Uses" value={created.maxUses === "0" ? "Unlimited" : created.maxUses} />
              <DetailRow label="Validity" value={`${created.validityHours} hours`} />
              <DetailRow
                label="Tx Signature"
                value={created.txSignature}
                onCopy={() => handleCopy(created.txSignature, "Signature")}
                mono
                externalHref={txExplorer}
              />
            </div>
          </GlassCard>
        </div>

        {/* Block 4 — Next steps */}
        <div style={{ marginTop: "16px" }}>
          <GlassCard>
            <h3 style={{ color: COLORS.text, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px" }}>
              Next Steps
            </h3>
            <ol style={{ color: COLORS.textMuted, fontSize: "0.88rem", lineHeight: 1.8, margin: 0, paddingLeft: "22px" }}>
              <li>Copy the MCP env snippet above</li>
              <li>
                Replace the existing <code style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace" }}>env</code> block in <code style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace" }}>.mcp.json</code> (project root)
              </li>
              <li>Restart Claude Code</li>
              <li>
                Ask the agent: <em>&ldquo;Send 0.01 SOL via transfer-sol from vault nonce {created.vaultNonce} to &lt;some address&gt;&rdquo;</em>
              </li>
            </ol>
          </GlassCard>
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/vaults/${vaultNonce}`)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "2px",
              border: `1px solid ${COLORS.emeraldBorder}`,
              backgroundColor: COLORS.emeraldSubtle,
              color: COLORS.emerald,
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to Vault
          </button>
        </div>
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

      <h2 style={{ color: COLORS.text, fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        Create AI Agent Session
      </h2>
      <p style={{ color: COLORS.textMuted, fontSize: "0.92rem", margin: "0 0 28px", lineHeight: 1.6 }}>
        Generates a fresh keypair in this browser. The session pubkey is committed on-chain via your wallet&apos;s signature. The secret stays in your browser — you&apos;ll paste it into your AI agent&apos;s config below.
      </p>

      <GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label
              style={{
                fontFamily: "var(--font-mono-v2), monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Permissions
            </label>
            <PermissionCheckboxes value={permissions} onChange={setPermissions} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px" }}>
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

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "2px",
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bgCard,
              color: COLORS.textMuted,
              fontSize: "0.82rem",
              lineHeight: 1.6,
            }}
          >
            A new <code style={{ color: COLORS.textSecondary, fontFamily: "var(--font-geist-mono), monospace" }}>ed25519</code> keypair is generated locally. The public key gets committed on-chain as a delegate; the secret is shown once, then discarded by this page.
          </div>

          <TransactionButton
            label="Generate Session & Issue Delegate"
            loadingLabel="Issuing..."
            onClick={handleIssue}
            fullWidth
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  onCopy,
  externalHref,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  externalHref?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "0.78rem", color: COLORS.textDim, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
        <span
          style={{
            fontSize: "0.85rem",
            color: COLORS.textSecondary,
            fontFamily: mono ? "var(--font-geist-mono), monospace" : "inherit",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {mono ? formatAddress(value) : value}
        </span>
        {onCopy && (
          <Copy
            size={12}
            color={COLORS.textDim}
            style={{ cursor: "pointer", flexShrink: 0 }}
            onClick={onCopy}
          />
        )}
        {externalHref && (
          <a
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textDim, display: "inline-flex", alignItems: "center" }}
            aria-label={`Open ${label} in Solana Explorer`}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ value, onCopy }: { value: string; onCopy: () => void }) {
  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: "2px",
          padding: "14px 44px 14px 14px",
          margin: 0,
          fontSize: "0.78rem",
          fontFamily: "var(--font-geist-mono), monospace",
          color: COLORS.textSecondary,
          overflowX: "auto",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {value}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "rgba(0, 0, 0, 0.6)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: "2px",
          padding: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.textMuted,
        }}
        aria-label="Copy"
      >
        <Copy size={12} />
      </button>
    </div>
  );
}
