import React from "react";
import { COLORS } from "../colors";
import { FONTS } from "../fonts";

export const TerminalWindow: React.FC<{
  children: React.ReactNode;
  title?: string;
  width?: number;
  style?: React.CSSProperties;
}> = ({ children, title = "Claude Code", width = 900, style = {} }) => {
  return (
    <div
      style={{
        width,
        background: COLORS.terminalBg,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: [
          "0 25px 60px rgba(0,0,0,0.35)",
          "0 8px 20px rgba(0,0,0,0.25)",
          `0 0 80px rgba(52,211,153,0.15)`,
          "0 1px 0 rgba(255,255,255,0.05)",
        ].join(", "),
        border: "1px solid rgba(255,255,255,0.10)",
        position: "relative",
        ...style,
      }}
    >
      {/* Top light reflection overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
          borderRadius: "16px 16px 0 0",
          pointerEvents: "none",
        }}
      />

      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#febc2e",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#28c840",
            }}
          />
        </div>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: FONTS.firaCode,
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {title}
        </div>
      </div>
      {/* Content */}
      <div
        style={{
          padding: "28px 32px",
          fontFamily: FONTS.firaCode,
          fontSize: 22,
          lineHeight: 1.7,
          color: COLORS.terminalText,
        }}
      >
        {children}
      </div>
    </div>
  );
};
