"use client";
import React from "react";

import { Menu } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { usePathname } from "next/navigation";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { useHeader } from "../_providers/HeaderProvider";

interface DashboardHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function DashboardHeader({ title, onMenuToggle }: DashboardHeaderProps): React.JSX.Element {
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
    defaultTitle = "Deploy vault";
    defaultSubtitle = "Create a new smart-account vault.";
  } else if (pathname === "/dashboard/agent") {
    defaultTitle = "Agent view";
    defaultSubtitle = "Delegate keys issued to your wallet.";
  } else if (pathname.startsWith("/dashboard/vaults/")) {
    const parts = pathname.split("/");
    const nonce = parts[3];
    if (parts[4] === "audit") {
      defaultTitle = "Audit logs";
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "create") {
      defaultTitle = "New delegate";
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "openclaw") {
      defaultTitle = "AI agent policy";
      defaultSubtitle = `Vault #${nonce}`;
    } else if (parts[4] === "delegate" && parts[5] === "kid") {
      defaultTitle = "Kid policy";
      defaultSubtitle = `Vault #${nonce}`;
    } else {
      defaultTitle = `Vault #${nonce}`;
    }
  }

  const displayTitle = headerCtx.title || title || defaultTitle;
  const displaySubtitle =
    headerCtx.subtitle !== null ? headerCtx.subtitle : defaultSubtitle;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in oklch, var(--paper) 96%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      {/* Hairline rule above — matches landing masthead */}
      <div
        aria-hidden
        style={{
          height: "1px",
          background: "var(--rule)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          height: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 32px",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isMobile && onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Toggle navigation menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "11px",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-black)",
              }}
            >
              <Menu size={22} />
            </button>
          )}
          {displayTitle && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h1
                style={{
                  color: "var(--ink-black)",
                  fontFamily: "var(--font-archivo), sans-serif",
                  fontSize: isMobile ? "1.15rem" : "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.012em",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {displayTitle}
              </h1>
              {!isMobile && displaySubtitle && (
                <span
                  style={{
                    color: "var(--ink-mute)",
                    fontFamily: "var(--font-mono-v2), monospace",
                    fontSize: "0.64rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
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
      </div>
    </header>
  );
}
