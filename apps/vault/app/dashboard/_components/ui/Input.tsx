"use client";
import React from "react";

import type { CSSProperties } from "react";
import { COLORS } from "../../_lib/constants";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Input({ value, onChange, placeholder, type = "text", label, hint, error, disabled, style }: InputProps): React.JSX.Element {
  const displayMessage = error || hint;
  const messageColor = error ? COLORS.red : COLORS.textDim;
  const borderColor = error ? COLORS.red : COLORS.border;

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
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          padding: "12px 16px",
          color: COLORS.text,
          fontSize: "1rem",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
          width: "100%",
          opacity: disabled ? 0.5 : 1,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
          ...style,
        } as any}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = COLORS.emeraldBorder;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderColor;
        }}
      />
      {displayMessage && (
        <span style={{ fontSize: "0.75rem", color: messageColor }}>{displayMessage}</span>
      )}
    </div>
  );
}
