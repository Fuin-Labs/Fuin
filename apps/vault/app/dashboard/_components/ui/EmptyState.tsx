"use client";

import { COLORS } from "../../_lib/constants";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 32px",
        textAlign: "center",
        gap: "16px",
      }}
    >
      {icon && (
        <div style={{ opacity: 0.3, marginBottom: "8px" }}>{icon}</div>
      )}
      <h3 style={{ color: COLORS.text, fontSize: "1.25rem", fontWeight: 700 }}>{title}</h3>
      <p style={{ color: COLORS.textMuted, fontSize: "0.95rem", maxWidth: "400px", lineHeight: 1.6 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
