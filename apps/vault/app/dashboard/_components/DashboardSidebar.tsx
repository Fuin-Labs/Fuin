"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Bot, ArrowLeft, X } from "lucide-react";
import { COLORS } from "../_lib/constants";
import { useIsMobile } from "../_hooks/useMediaQuery";

const NAV_ITEMS = [
  { href: "/dashboard/vaults", label: "Vaults", icon: Database },
  { href: "/dashboard/agent", label: "Agent View", icon: Bot },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", padding: "0 8px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: COLORS.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${COLORS.yellowGlow}`,
            }}
          >
            <span style={{ color: COLORS.bg, fontWeight: 900, fontSize: "18px" }}>F</span>
          </div>
          <span style={{ color: COLORS.text, fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.05em" }}>
            Fuin
          </span>
        </Link>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} color={COLORS.textMuted} />
          </button>
        )}
      </div>

      {/* Section Label */}
      <div style={{ padding: "0 12px", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Dashboard
        </span>
      </div>

      {/* Nav Items */}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} onClick={isMobile ? onClose : undefined}>
            <motion.div
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: isActive ? "rgba(250, 204, 21, 0.08)" : "transparent",
                border: isActive ? `1px solid ${COLORS.yellowBorder}` : "1px solid transparent",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
            >
              <Icon size={18} color={isActive ? COLORS.yellow : COLORS.textMuted} />
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? COLORS.yellow : COLORS.textSecondary,
                }}
              >
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Back to landing */}
      <Link href="/" style={{ textDecoration: "none" }} onClick={isMobile ? onClose : undefined}>
        <motion.div
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} color={COLORS.textDim} />
          <span style={{ fontSize: "0.85rem", color: COLORS.textDim }}>Back to Home</span>
        </motion.div>
      </Link>
    </>
  );
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Auto-close on route change (mobile)
  useEffect(() => {
    if (isMobile && onClose) onClose();
  }, [pathname]);

  // Desktop: fixed sidebar
  if (!isMobile) {
    return (
      <aside
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "rgba(5, 5, 5, 0.8)",
          borderRight: `1px solid ${COLORS.border}`,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <SidebarContent />
      </aside>
    );
  }

  // Mobile: overlay sidebar
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              zIndex: 99,
            }}
          />
          {/* Slide-in panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              width: "280px",
              backgroundColor: "rgba(5, 5, 5, 0.95)",
              borderRight: `1px solid ${COLORS.border}`,
              padding: "24px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 100,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
