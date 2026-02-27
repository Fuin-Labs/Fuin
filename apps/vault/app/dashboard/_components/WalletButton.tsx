"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { COLORS } from "../_lib/constants";
import { formatAddress, formatSolShort } from "../_lib/format";
import { useWalletBalance } from "../_hooks/useWalletBalance";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useWalletBalance();
  const isMobile = useIsMobile();

  if (!connected || !publicKey) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setVisible(true)}
        style={{
          backgroundColor: COLORS.emerald,
          color: COLORS.bg,
          border: "none",
          padding: isMobile ? "8px 14px" : "10px 20px",
          borderRadius: "10px",
          fontSize: isMobile ? "0.8rem" : "0.9rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "inherit",
          boxShadow: `0 0 15px ${COLORS.emeraldGlow}`,
        }}
      >
        <Wallet size={16} />
        {isMobile ? "Connect" : "Connect Wallet"}
      </motion.button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {balance !== null && (
        <div
          style={{
            backgroundColor: COLORS.emeraldSubtle,
            border: `1px solid ${COLORS.emeraldBorder}`,
            borderRadius: "10px",
            padding: isMobile ? "8px 10px" : "10px 14px",
            color: COLORS.emerald,
            fontSize: "0.85rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {formatSolShort(balance)} SOL
        </div>
      )}
      {!isMobile && (
        <motion.div
          whileHover={{ scale: 1.02, backgroundColor: COLORS.bgCardHover }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            navigator.clipboard.writeText(publicKey.toBase58());
          }}
          style={{
            backgroundColor: COLORS.bgInput,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "10px",
            padding: "10px 16px",
            color: COLORS.text,
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
          title="Copy Address"
        >
          {formatAddress(publicKey)}
        </motion.div>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => disconnect()}
        style={{
          backgroundColor: "transparent",
          border: `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          padding: "10px",
          color: COLORS.textMuted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <LogOut size={16} />
      </motion.button>
    </div>
  );
}
