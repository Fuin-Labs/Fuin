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

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: COLORS.bg, fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : "260px", display: "flex", flexDirection: "column" }}>
        <DashboardHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: isMobile ? "16px" : "32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <FuinProvider>
        <ToastProvider>
          <DashboardShell>{children}</DashboardShell>
          <ToastContainer />
        </ToastProvider>
      </FuinProvider>
    </WalletProviders>
  );
}
