"use client";

import { COLORS } from "../../_lib/constants";

type BadgeVariant = "active" | "frozen" | "draining" | "paused" | "revoked" | "expired" | "info";

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  active: { bg: COLORS.greenSubtle, color: COLORS.green, border: COLORS.greenBorder },
  frozen: { bg: COLORS.blueSubtle, color: COLORS.blue, border: "rgba(59, 130, 246, 0.3)" },
  draining: { bg: "rgba(245, 158, 11, 0.1)", color: COLORS.amber, border: "rgba(245, 158, 11, 0.3)" },
  paused: { bg: "rgba(107, 114, 128, 0.1)", color: COLORS.textDim, border: "rgba(107, 114, 128, 0.3)" },
  revoked: { bg: COLORS.redSubtle, color: COLORS.red, border: COLORS.redBorder },
  expired: { bg: "rgba(107, 114, 128, 0.1)", color: COLORS.textDim, border: "rgba(107, 114, 128, 0.3)" },
  info: { bg: COLORS.purpleSubtle, color: COLORS.purple, border: "rgba(168, 85, 247, 0.3)" },
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ variant, children, dot }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "99px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: s.color,
          }}
        />
      )}
      {children}
    </span>
  );
}
