"use client";
import React from "react";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useIsMobile } from "../_hooks/useMediaQuery";
import { Mark } from "../../components/Mark";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/vaults", label: "Vaults" },
  { href: "/dashboard/agent", label: "Agent view" },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function Wordmark({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Fuin home"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        color: "var(--ink-black)",
        textDecoration: "none",
      }}
    >
      <Mark size={28} />
      {!collapsed && (
        <span
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Fuin
        </span>
      )}
    </Link>
  );
}

function SidebarContent({
  onClose,
  isCollapsed,
  onToggleCollapse,
}: {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Wordmark + toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          marginBottom: "32px",
          padding: isCollapsed ? "0" : "0 8px",
          height: "48px",
        }}
      >
        <Wordmark collapsed={isCollapsed} />

        <div style={{ display: "flex", gap: "8px" }}>
          {isMobile && onClose && !isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--ink-mute)",
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          )}

          {!isMobile && onToggleCollapse && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              aria-label="Collapse sidebar"
              style={{
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--ink-mute)",
                padding: "4px",
                opacity: 0.7,
                transition: "opacity 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.color = "var(--ink-black)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.color = "var(--ink-mute)";
              }}
              title="Collapse sidebar"
            >
              <ChevronsLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Hairline rule under the wordmark */}
      {!isCollapsed && (
        <div
          aria-hidden
          style={{
            height: 1,
            background: "var(--ink-black)",
            opacity: 0.18,
            margin: "0 8px 20px",
          }}
        />
      )}

      {/* Section eyebrow */}
      {!isCollapsed && (
        <div style={{ padding: "0 12px", marginBottom: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.62rem",
              fontWeight: 500,
              color: "var(--ink-mute)",
              textTransform: "uppercase",
              letterSpacing: "0.24em",
            }}
          >
            Dashboard
          </span>
        </div>
      )}

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: "none" }}
            onClick={isMobile ? onClose : undefined}
          >
            <motion.div
              whileHover={{
                background: "color-mix(in oklch, var(--ink-black) 5%, transparent)",
              }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: "12px",
                padding: isCollapsed ? "12px 0" : "11px 14px",
                background: isActive
                  ? "color-mix(in oklch, var(--ink-black) 6%, transparent)"
                  : "transparent",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
            >
              {!isCollapsed && (
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--ink-black)" : "var(--ink-soft)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.label}
                </span>
              )}
              {isCollapsed && (
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--ink-black)" : "var(--ink-mute)",
                  }}
                  title={item.label}
                >
                  {item.label.charAt(0)}
                </span>
              )}
            </motion.div>
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Back to landing */}
      <Link
        href="/"
        style={{ textDecoration: "none" }}
        onClick={isMobile ? onClose : undefined}
      >
        <motion.div
          whileHover={{ color: "var(--ink-black)" }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "10px",
            padding: isCollapsed ? "12px 0" : "12px 16px",
            color: "var(--ink-mute)",
            fontFamily: "var(--font-archivo), sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "-0.005em",
          }}
        >
          {!isCollapsed && <span>← back to landing</span>}
          {isCollapsed && <span aria-hidden style={{ fontFamily: "var(--font-mono-v2), monospace" }}>←</span>}
        </motion.div>
      </Link>
    </>
  );
}

export function DashboardSidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isMobile) {
    return (
      <aside
        onClick={isCollapsed && onToggleCollapse ? onToggleCollapse : undefined}
        style={{
          width: isCollapsed ? "80px" : "260px",
          transition: "width 0.2s ease",
          minHeight: "100vh",
          background: "var(--paper)",
          borderRight: "1px solid var(--rule-soft)",
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          cursor: isCollapsed ? "pointer" : "default",
        }}
        title={isCollapsed ? "Click to expand sidebar" : undefined}
      >
        {/* Hairline rule along the top edge — matches the masthead colophon */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background: "var(--ink-black)",
            opacity: 0.35,
          }}
        />
        <SidebarContent isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      </aside>
    );
  }

  // Mobile overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "color-mix(in oklch, var(--ink-black) 35%, transparent)",
              zIndex: 99,
            }}
          />
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
              background: "var(--paper)",
              borderRight: "1px solid var(--rule-soft)",
              padding: "24px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              zIndex: 100,
            }}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
