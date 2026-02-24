import type { CSSProperties } from "react";

export const COLORS = {
  bg: "#050505",
  bgCard: "rgba(255, 255, 255, 0.02)",
  bgCardHover: "rgba(255, 255, 255, 0.04)",
  bgInput: "rgba(255, 255, 255, 0.05)",
  yellow: "#FACC15",
  yellowGlow: "rgba(250, 204, 21, 0.4)",
  yellowSubtle: "rgba(250, 204, 21, 0.1)",
  yellowBorder: "rgba(250, 204, 21, 0.2)",
  text: "#ffffff",
  textSecondary: "#d1d5db",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
  border: "rgba(255, 255, 255, 0.08)",
  borderLight: "rgba(255, 255, 255, 0.15)",
  green: "#22c55e",
  greenSubtle: "rgba(34, 197, 94, 0.1)",
  greenBorder: "rgba(34, 197, 94, 0.3)",
  red: "#ef4444",
  redSubtle: "rgba(239, 68, 68, 0.1)",
  redBorder: "rgba(239, 68, 68, 0.3)",
  blue: "#3b82f6",
  blueSubtle: "rgba(59, 130, 246, 0.1)",
  amber: "#f59e0b",
  purple: "#a855f7",
  purpleSubtle: "rgba(168, 85, 247, 0.1)",
};

export const GLASS_STYLE: CSSProperties = {
  backgroundColor: COLORS.bgCard,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "24px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

export const GLASS_CARD_HOVER = {
  y: -4,
  boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px ${COLORS.yellowBorder}`,
  backgroundColor: COLORS.bgCardHover,
};

export const MOTION_FADE_IN = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

export const MOTION_STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.1 } },
};
