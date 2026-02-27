"use client";

import { COLORS } from "../../_lib/constants";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
}

export function ProgressBar({ value, max, label, color = COLORS.emerald }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverHalf = pct > 75;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
          <span style={{ color: COLORS.textMuted }}>{label}</span>
          <span style={{ color: isOverHalf ? COLORS.red : COLORS.textSecondary, fontWeight: 600 }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "3px",
            backgroundColor: isOverHalf ? COLORS.red : color,
            transition: "width 0.5s ease, background-color 0.3s",
          }}
        />
      </div>
    </div>
  );
}
