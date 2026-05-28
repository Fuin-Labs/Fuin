"use client";
import React from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { formatAddress, formatSolShort } from "../_lib/format";
import { useWalletBalance } from "../_hooks/useWalletBalance";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { LogOut } from "lucide-react";

const PILL_BASE = {
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "var(--font-mono-v2), monospace",
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  height: "36px",
  padding: "0 14px",
  border: "1px solid var(--rule-soft)",
  background: "transparent",
  color: "var(--ink-black)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function WalletButton(): React.JSX.Element {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useWalletBalance();
  const isMobile = useIsMobile();

  if (!connected || !publicKey) {
    return (
      <motion.button
        whileHover={{ background: "var(--ink-black)", color: "var(--paper)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setVisible(true)}
        style={{
          ...PILL_BASE,
          height: "40px",
          padding: isMobile ? "0 14px" : "0 18px",
          fontSize: isMobile ? "0.7rem" : "0.74rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontWeight: 600,
        }}
      >
        {isMobile ? "Connect ↗" : "Connect wallet ↗"}
      </motion.button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {balance !== null && (
        <div
          aria-label="Wallet balance"
          style={{
            ...PILL_BASE,
            background: "var(--paper-rise)",
            color: "var(--ink-black)",
            fontWeight: 500,
          }}
        >
          <span aria-hidden style={{ color: "var(--prussian)", marginRight: 6 }}>◇</span>
          <span>{formatSolShort(balance)}</span>
          <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>SOL</span>
        </div>
      )}
      {!isMobile && (
        <motion.button
          whileHover={{ background: "var(--paper-rise)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            navigator.clipboard.writeText(publicKey.toBase58());
          }}
          style={{
            ...PILL_BASE,
            color: "var(--prussian)",
          }}
          title="Copy address"
        >
          {formatAddress(publicKey)}
        </motion.button>
      )}
      <motion.button
        whileHover={{ background: "var(--ink-black)", color: "var(--paper)" }}
        whileTap={{ scale: 0.96 }}
        onClick={() => disconnect()}
        aria-label="Disconnect wallet"
        style={{
          ...PILL_BASE,
          width: "36px",
          padding: 0,
          justifyContent: "center",
          color: "var(--ink-mute)",
        }}
      >
        <LogOut size={14} />
      </motion.button>
    </div>
  );
}
