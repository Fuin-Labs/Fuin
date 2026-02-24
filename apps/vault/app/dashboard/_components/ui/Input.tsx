"use client";

import type { CSSProperties } from "react";
import { COLORS } from "../../_lib/constants";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Input({ value, onChange, placeholder, type = "text", label, hint, disabled, style }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: COLORS.textSecondary }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          backgroundColor: COLORS.bgInput,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          padding: "12px 16px",
          color: COLORS.text,
          fontSize: "1rem",
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color 0.2s",
          width: "100%",
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = COLORS.yellowBorder;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = COLORS.border;
        }}
      />
      {hint && (
        <span style={{ fontSize: "0.75rem", color: COLORS.textDim }}>{hint}</span>
      )}
    </div>
  );
}
