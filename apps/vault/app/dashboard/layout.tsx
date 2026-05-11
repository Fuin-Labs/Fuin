"use client";
import React from "react";

import { useState, useEffect } from "react";
import { WalletProviders } from "../_providers/WalletProviders";
import { FuinProvider } from "../_providers/FuinProvider";
import { ToastProvider } from "./_providers/ToastProvider";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardHeader } from "./_components/DashboardHeader";
import { ToastContainer } from "./_components/Toast";
import { COLORS } from "./_lib/constants";
import { useIsMobile } from "./_hooks/useMediaQuery";
import { HeaderProvider } from "./_providers/HeaderProvider";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: COLORS.bg }}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : (isCollapsed ? "80px" : "260px"), transition: "margin-left 0.2s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
          <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main style={{ flex: 1, padding: isMobile ? "16px" : "32px" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <WalletProviders>
      <FuinProvider>
        <ToastProvider>
          <HeaderProvider>
            <DashboardShell>{children}</DashboardShell>
            <ToastContainer />
          </HeaderProvider>
        </ToastProvider>
      </FuinProvider>
    </WalletProviders>
  );
}
