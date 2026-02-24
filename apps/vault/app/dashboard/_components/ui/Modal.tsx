"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { COLORS, GLASS_STYLE } from "../../_lib/constants";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
}

export function Modal({ open, onClose, onConfirm, title, children, confirmLabel = "Confirm", confirmVariant = "danger", loading }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...GLASS_STYLE,
              backgroundColor: "rgba(20, 20, 20, 0.95)",
              padding: "32px",
              maxWidth: "440px",
              width: "90%",
            }}
          >
            <h3 style={{ color: COLORS.text, fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>
              {title}
            </h3>
            <div style={{ color: COLORS.textMuted, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {children}
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button variant={confirmVariant} onClick={onConfirm} size="sm" disabled={loading}>
                {loading ? "Processing..." : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
