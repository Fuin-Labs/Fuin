"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserRound, Bot } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "../../../../_components/ui/GlassCard";
import { COLORS } from "../../../../_lib/constants";

export default function CreateDelegatePage({ params }: { params: Promise<{ nonce: string }> }) {
  const { nonce: nonceStr } = use(params);
  const vaultNonce = Number(nonceStr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: "600px" }}
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
        Choose who you want to authorize with scoped permissions and spending limits.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Link href={`/dashboard/vaults/${vaultNonce}/delegate/kid`} style={{ textDecoration: "none" }}>
          <GlassCard hover accent={COLORS.yellowBorder} style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "16px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: COLORS.yellowSubtle,
                  border: `1px solid ${COLORS.yellowBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserRound size={28} color={COLORS.yellow} />
              </div>
              <div>
                <h3 style={{ color: COLORS.text, fontSize: "1.15rem", fontWeight: 700, margin: "0 0 6px" }}>
                  Kid Allowance
                </h3>
                <p style={{ color: COLORS.textMuted, fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                  Set up a simple spending allowance for your teenager with transfer-only access.
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>

        <Link href={`/dashboard/vaults/${vaultNonce}/delegate/openclaw`} style={{ textDecoration: "none" }}>
          <GlassCard hover accent="rgba(168, 85, 247, 0.2)" style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", padding: "16px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: COLORS.purpleSubtle,
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={28} color={COLORS.purple} />
              </div>
              <div>
                <h3 style={{ color: COLORS.text, fontSize: "1.15rem", fontWeight: 700, margin: "0 0 6px" }}>
                  OpenClaw / AI Agent
                </h3>
                <p style={{ color: COLORS.textMuted, fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                  Authorize an AI agent with granular permissions, limits, and policy constraints.
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>
      </div>
    </motion.div>
  );
}
