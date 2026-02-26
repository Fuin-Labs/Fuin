"use client";

import { Menu } from "lucide-react";
import { COLORS } from "../_lib/constants";
import { WalletButton } from "./WalletButton";
import { useIsMobile } from "../_hooks/useMediaQuery";

interface DashboardHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function DashboardHeader({ title, onMenuToggle }: DashboardHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 32px",
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: "rgba(5, 5, 5, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isMobile && onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={22} color={COLORS.text} />
          </button>
        )}
        <h1 style={{ color: COLORS.text, fontSize: isMobile ? "1rem" : "1.2rem", fontWeight: 700, margin: 0 }}>
          {title || "Dashboard"}
        </h1>
      </div>
      <WalletButton />
    </header>
  );
}
