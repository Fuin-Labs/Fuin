"use client";

import { motion } from "framer-motion";
import { COLORS } from "../../_lib/constants";

interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 24 }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{
        width: size,
        height: size,
        border: `2px solid ${COLORS.border}`,
        borderTopColor: COLORS.emerald,
        borderRadius: "50%",
      }}
    />
  );
}
