"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { ToastContext, type Toast as ToastType } from "../_providers/ToastProvider";
import { COLORS } from "../_lib/constants";
import { X } from "lucide-react";

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  success: { bg: "rgba(34, 197, 94, 0.1)", border: COLORS.greenBorder, color: COLORS.green },
  error: { bg: "rgba(239, 68, 68, 0.1)", border: COLORS.redBorder, color: COLORS.red },
  info: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", color: COLORS.blue },
};

export function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "400px",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const s = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info!;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              style={{
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: "12px",
                padding: "14px 18px",
                color: s.color,
                fontSize: "0.9rem",
                fontWeight: 500,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span style={{ flex: 1 }}>{toast.message}</span>
              <X
                size={14}
                style={{ cursor: "pointer", opacity: 0.6, flexShrink: 0 }}
                onClick={() => removeToast(toast.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
