import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";
import { FONTS } from "../fonts";
import { SPRING } from "../springConfig";
import { EASE } from "../easing";

export const FeatureHighlight: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  startFrame: number;
  endFrame: number;
}> = ({ title, subtitle, icon, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [startFrame, startFrame + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  const fadeOut = interpolate(frame, [endFrame - 14, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });

  const opacity = Math.min(fadeIn, fadeOut);

  const scaleSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING.snappy,
    from: 0.9,
    to: 1,
  });

  // Icon glow pulse — slower
  const isActive = frame >= startFrame + 16 && frame <= endFrame - 14;
  const iconGlow = isActive
    ? 0.12 + Math.sin((frame - startFrame) * 0.1) * 0.06
    : 0;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleSpring})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}
    >
      {/* Glassmorphic card wrapper */}
      <div
        style={{
          background: COLORS.glassBg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${COLORS.glassBorder}`,
          borderRadius: 24,
          padding: "48px 64px",
          boxShadow: `${COLORS.shadowLg}, 0 0 ${40 * iconGlow}px ${COLORS.emerald}30`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.emerald}40, transparent)`,
          }}
        />

        {/* Icon with emerald backing circle */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: COLORS.emeraldGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${30 + iconGlow * 200}px ${COLORS.emerald}${Math.round(iconGlow * 255).toString(16).padStart(2, "0")}`,
          }}
        >
          <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONTS.inter,
            fontWeight: 700,
            fontSize: 48,
            color: COLORS.text,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: FONTS.spaceGrotesk,
              fontWeight: 400,
              fontSize: 24,
              color: COLORS.textMuted,
              textAlign: "center",
              marginTop: -12,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
