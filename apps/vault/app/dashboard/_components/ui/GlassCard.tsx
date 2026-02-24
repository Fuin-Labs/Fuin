"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { COLORS, GLASS_STYLE, GLASS_CARD_HOVER } from "../../_lib/constants";

interface GlassCardProps {
  children: ReactNode;
  padding?: string;
  hover?: boolean;
  accent?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function GlassCard({ children, padding = "32px", hover = false, accent, onClick, style }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? GLASS_CARD_HOVER : undefined}
      onClick={onClick}
      style={{
        ...GLASS_STYLE,
        padding,
        cursor: onClick ? "pointer" : "default",
        ...(accent ? { borderColor: accent } : {}),
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
