"use client";

import { Send, ArrowLeftRight, Landmark, Droplets } from "lucide-react";
import { COLORS } from "../_lib/constants";
import { PERMISSION_LIST, hasPermission } from "../_lib/permissions";

const ICONS: Record<string, React.ReactNode> = {
  Send: <Send size={16} />,
  ArrowLeftRight: <ArrowLeftRight size={16} />,
  Landmark: <Landmark size={16} />,
  Droplets: <Droplets size={16} />,
};

interface PermissionCheckboxesProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function PermissionCheckboxes({ value, onChange, disabled }: PermissionCheckboxesProps) {
  const toggle = (perm: number) => {
    onChange(value ^ perm);
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {PERMISSION_LIST.map((p) => {
        const active = hasPermission(value, p.value);
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => !disabled && toggle(p.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              border: `1px solid ${active ? COLORS.emeraldBorder : COLORS.border}`,
              backgroundColor: active ? COLORS.emeraldSubtle : "transparent",
              color: active ? COLORS.emerald : COLORS.textMuted,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {ICONS[p.icon]}
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
