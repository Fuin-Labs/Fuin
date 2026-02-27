"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { COLORS } from "../../_lib/constants";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: COLORS.emerald,
    color: COLORS.bg,
    boxShadow: `0 0 20px ${COLORS.emeraldGlow}`,
  },
  secondary: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: COLORS.text,
    border: `1px solid ${COLORS.borderLight}`,
  },
  danger: {
    backgroundColor: COLORS.redSubtle,
    color: COLORS.red,
    border: `1px solid ${COLORS.redBorder}`,
  },
  ghost: {
    backgroundColor: "transparent",
    color: COLORS.textMuted,
    border: "1px solid transparent",
  },
};

const SIZE_STYLES: Record<string, CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px" },
  md: { padding: "12px 24px", fontSize: "1rem", borderRadius: "10px" },
  lg: { padding: "16px 32px", fontSize: "1.1rem", borderRadius: "12px" },
};

export function Button({ children, onClick, variant = "primary", disabled, fullWidth, size = "md", style }: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      style={{
        border: "none",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        fontFamily: "inherit",
        transition: "opacity 0.2s",
        ...SIZE_STYLES[size],
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
