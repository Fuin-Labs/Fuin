import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";
import { SPRING } from "../springConfig";

export const FuinLogo: React.FC<{
  size?: number;
  animate?: boolean;
  showGlow?: boolean;
}> = ({ size = 120, animate = true, showGlow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = animate
    ? spring({ frame, fps, config: SPRING.snappy })
    : 1;

  const glowOpacity = showGlow
    ? interpolate(frame, [0, 30, 60, 90], [0, 0.6, 0.3, 0.6], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Pulsing outer ring
  const ringScale = interpolate(
    frame % 60,
    [0, 60],
    [1, 1.6],
  );
  const ringOpacity = interpolate(
    frame % 60,
    [0, 60],
    [0.4, 0],
  );

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showGlow && (
        <div
          style={{
            position: "absolute",
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.emerald}40 0%, transparent 70%)`,
            opacity: glowOpacity,
          }}
        />
      )}

      {/* Pulsing outer ring */}
      {showGlow && (
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size * 0.25,
            border: `1px solid ${COLORS.emerald}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: showGlow
            ? `drop-shadow(0 0 ${size * 0.15}px ${COLORS.emerald}60)`
            : undefined,
        }}
      >
        <rect width="40" height="40" rx="10" fill="#0a0e1a" />
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="9.5"
          stroke="white"
          strokeOpacity="0.1"
        />
        <path
          d="M12 10H28V15H18V18H26V23H18V30H12V10Z"
          fill="url(#fuin-logo-grad)"
        />
        <defs>
          <linearGradient
            id="fuin-logo-grad"
            x1="12"
            y1="10"
            x2="28"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor={COLORS.emerald} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
