"use client";

import { useState } from "react";
import { WalletProviders } from "./_providers/WalletProviders";
import { FuinProvider } from "./_providers/FuinProvider";
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: COLORS.bg, fontFamily: "'Geist', sans-serif" }}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : (isCollapsed ? "80px" : "260px"), transition: "margin-left 0.2s ease", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Decorative elements */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", WebkitMaskImage: "radial-gradient(circle at center top, black 10%, transparent 80%)" }} />
        <div style={{ position: "fixed", top: 0, right: 0, width: "600px", height: "600px", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
