"use client";

import { COLORS } from "../_lib/constants";
import { WalletButton } from "./WalletButton";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: "rgba(5, 5, 5, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <h1 style={{ color: COLORS.text, fontSize: "1.2rem", fontWeight: 700 }}>
        {title || "Dashboard"}
      </h1>
      <WalletButton />
    </header>
  );
}
