"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Bot, ArrowLeft, Shield } from "lucide-react";
import { COLORS } from "../_lib/constants";

const NAV_ITEMS = [
  { href: "/dashboard/vaults", label: "Vaults", icon: Database },
  { href: "/dashboard/agent", label: "Agent View", icon: Bot },
];

export function DashboardSidebar() {
  const pathname = usePathname();

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
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px", padding: "0 8px" }}>
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
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
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
      <Link href="/" style={{ textDecoration: "none" }}>
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
    </aside>
  );
}
