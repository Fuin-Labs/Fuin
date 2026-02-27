"use client";

import { Menu } from "lucide-react";
import { COLORS } from "../_lib/constants";
import { WalletButton } from "./WalletButton";
import { usePathname } from "next/navigation";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { useHeader } from "../_providers/HeaderProvider";

interface DashboardHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function DashboardHeader({ title, onMenuToggle }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const headerCtx = useHeader();

  let defaultTitle = "Dashboard";
  let defaultSubtitle = "";

  if (pathname === "/dashboard") {
    defaultTitle = "Overview";
    defaultSubtitle = "Your vault dashboard at a glance.";
  } else if (pathname === "/dashboard/vaults") {
    defaultTitle = "Vaults";
    defaultSubtitle = "Manage your delegated vaults.";
  } else if (pathname === "/dashboard/vaults/create") {
    defaultTitle = "Deploy Vault";
    defaultSubtitle = "Create a new smart account vault.";
  } else if (pathname === "/dashboard/agent") {
    defaultTitle = "Agent View";
    defaultSubtitle = "Delegate keys issued to your wallet.";
  } else if (pathname.startsWith("/dashboard/vaults/")) {
    const parts = pathname.split("/");
    const nonce = parts[3];
    if (parts[4] === "audit") {
      defaultTitle = `Audit Logs`;
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "create") {
      defaultTitle = `New Delegate`;
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "openclaw") {
      defaultTitle = `OpenClaw Policy`;
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "kid") {
      defaultTitle = `Kid Policy`;
      defaultSubtitle = `Vault #${nonce}`;
    } else {
      defaultTitle = `Vault #${nonce}`;
    }
  }

  const displayTitle = headerCtx.title || title || defaultTitle;
  const displaySubtitle = headerCtx.subtitle !== null ? headerCtx.subtitle : defaultSubtitle;

  return (
    <header
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 32px",
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
        {displayTitle && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ color: COLORS.text, fontSize: isMobile ? "1rem" : "1.2rem", fontWeight: 700, margin: 0 }}>
                {displayTitle}
              </h1>
            </div>
            {!isMobile && displaySubtitle && (
              <span style={{ color: COLORS.textDim, fontSize: "0.75rem", marginTop: "2px" }}>
                {displaySubtitle}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {headerCtx.action}
        <WalletButton />
      </div>
    </header>
  );
}
