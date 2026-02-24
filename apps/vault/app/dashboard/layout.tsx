"use client";

import { WalletProviders } from "./_providers/WalletProviders";
import { FuinProvider } from "./_providers/FuinProvider";
import { ToastProvider } from "./_providers/ToastProvider";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardHeader } from "./_components/DashboardHeader";
import { ToastContainer } from "./_components/Toast";
import { COLORS } from "./_lib/constants";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <FuinProvider>
        <ToastProvider>
          <div style={{ display: "flex", minHeight: "100vh", backgroundColor: COLORS.bg, fontFamily: "var(--font-geist-sans), sans-serif" }}>
            <DashboardSidebar />
            <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" }}>
              <DashboardHeader />
              <main style={{ flex: 1, padding: "32px" }}>
                {children}
              </main>
            </div>
          </div>
          <ToastContainer />
        </ToastProvider>
      </FuinProvider>
    </WalletProviders>
  );
}
