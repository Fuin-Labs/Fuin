"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Database, Bot, ArrowLeft, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { COLORS } from "../_lib/constants";
import { useIsMobile } from "../_hooks/useMediaQuery";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/vaults", label: "Vaults", icon: Database },
  { href: "/dashboard/agent", label: "Agent View", icon: Bot },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ onClose, isCollapsed, onToggleCollapse }: { onClose?: () => void; isCollapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Logo & Toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: "32px", padding: isCollapsed ? "0" : "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", pointerEvents: isCollapsed ? "none" : "auto" }}>
            <iconify-icon icon="solar:shield-keyhole-linear" class="text-2xl text-emerald-400" style={{ color: COLORS.emerald, fontSize: "1.5rem" }}></iconify-icon>
            {!isCollapsed && (
              <span style={{ color: COLORS.text, fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.025em" }}>
                Fuin
              </span>
            )}
          </Link>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {isMobile && onClose && !isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              <X size={20} color={COLORS.textMuted} />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: COLORS.textMuted,
                padding: "4px",
                opacity: 0.7,
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Section Label */}
      {!isCollapsed && (
        <div style={{ padding: "0 12px", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Dashboard
          </span>
        </div>
      )}

      {/* Nav Items */}
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} onClick={isMobile ? onClose : undefined}>
            <motion.div
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: "12px",
                padding: isCollapsed ? "12px 0" : "12px 16px",
                borderRadius: "12px",
                backgroundColor: isActive ? "rgba(52, 211, 153, 0.08)" : "transparent",
                border: isActive ? `1px solid ${COLORS.emeraldBorder}` : "1px solid transparent",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
            >
              <Icon size={18} color={isActive ? COLORS.emerald : COLORS.textMuted} />
              {!isCollapsed && (
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? COLORS.emerald : COLORS.textSecondary,
                  }}
                >
                  {item.label}
                </span>
              )}
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
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "10px",
            padding: isCollapsed ? "12px 0" : "12px 16px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} color={COLORS.textDim} />
          {!isCollapsed && <span style={{ fontSize: "0.85rem", color: COLORS.textDim }}>Back to Home</span>}
        </motion.div>
      </Link>
    </>
  );
}

export function DashboardSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
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
          width: isCollapsed ? "80px" : "260px",
          transition: "width 0.2s ease",
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
        <SidebarContent isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
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
