"use client";
import React from "react";

import type { CSSProperties } from "react";

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

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  label,
  hint,
  error,
  disabled,
  style,
}: InputProps): React.JSX.Element {
  const displayMessage = error || hint;
  const errorState = !!error;
  const baseBorder = errorState ? "var(--crimson)" : "var(--ink-black)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {label && (
        <label
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={errorState || undefined}
        aria-describedby={displayMessage ? `${label ?? "field"}-msg` : undefined}
        style={{
          background: "var(--paper)",
          border: `1px solid ${baseBorder}`,
          padding: "11px 14px",
          color: "var(--ink-black)",
          fontFamily: "var(--font-mono-v2), monospace",
          fontSize: "0.88rem",
          letterSpacing: "0.02em",
          lineHeight: 1.4,
          transition: "border-color 0.18s ease, background-color 0.18s ease",
          width: "100%",
          opacity: disabled ? 0.45 : 1,
          outline: "none",
          ...style,
        }}
        onFocus={(e) => {
          if (!errorState) {
            e.currentTarget.style.borderColor = "var(--crimson)";
            e.currentTarget.style.background = "var(--paper-rise)";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = baseBorder;
          e.currentTarget.style.background = "var(--paper)";
        }}
      />
      {displayMessage && (
        <span
          id={`${label ?? "field"}-msg`}
          style={
            errorState
              ? {
                  fontFamily: "var(--font-mono-v2), monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--crimson)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }
              : {
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.86rem",
                  lineHeight: 1.4,
                  color: "var(--ink-mute)",
                }
          }
        >
          {errorState && <span aria-hidden>✗</span>}
          {displayMessage}
        </span>
      )}
    </div>
  );
}
