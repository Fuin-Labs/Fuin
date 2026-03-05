import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../colors";

export const PremiumBackground: React.FC<{
  variant?: "default" | "emerald" | "warm" | "deep";
  children?: React.ReactNode;
}> = ({ variant = "default", children }) => {
  const frame = useCurrentFrame();

  const bgColor =
    variant === "warm"
      ? COLORS.warmGradientStart
      : variant === "deep"
        ? "#060a14"
        : COLORS.bg;

  const glowColor =
    variant === "emerald"
      ? "rgba(52, 211, 153, 0.06)"
      : variant === "warm"
        ? "rgba(212, 168, 83, 0.06)"
        : variant === "deep"
          ? "rgba(96, 165, 250, 0.02)"
          : "rgba(96, 165, 250, 0.04)";

  const isDeep = variant === "deep";

  // Slow breathing glow — subtle scale and opacity pulse (static for deep)
  const breathScale = isDeep ? 1 : 1 + Math.sin(frame * 0.025) * 0.08;
  const breathOpacity = isDeep ? 0.5 : 0.7 + Math.sin(frame * 0.02) * 0.3;

  // Very slow drift (no drift for deep)
  const driftX = isDeep ? 0 : Math.sin(frame * 0.012) * 30;
  const driftY = isDeep ? 0 : Math.cos(frame * 0.015) * 20;

  return (
    <AbsoluteFill style={{ background: bgColor }}>
      {/* Warm variant: subtle bottom gradient */}
      {variant === "warm" && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${COLORS.warmGradientStart} 0%, ${COLORS.warmGradientEnd} 100%)`,
          }}
        />
      )}

      {/* Animated radial glow — breathing + drifting */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "120%",
          height: "100%",
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${glowColor} 0%, transparent 70%)`,
          transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(${breathScale})`,
          opacity: breathOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
