import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { FONTS } from "../fonts";
import { SPRING } from "../springConfig";
import { EASE } from "../easing";
import { PremiumBackground } from "../components/PremiumBackground";

const Card: React.FC<{
  title: string;
  icon: React.ReactNode;
  features: string[];
  startFrame: number;
  side: "left" | "right";
}> = ({ title, icon, features, startFrame, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideFrom = side === "left" ? -80 : 80;
  const opacity = interpolate(frame, [startFrame, startFrame + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const slideSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING.gentle,
  });
  const translateX = interpolate(slideSpring, [0, 1], [slideFrom, 0]);

  // 3D door-swing — smoother
  const doorSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING.flip,
  });
  const doorRotateY = side === "left"
    ? interpolate(doorSpring, [0, 1], [-35, 0])
    : interpolate(doorSpring, [0, 1], [35, 0]);
  const doorZ = interpolate(doorSpring, [0, 1], [-80, 0]);

  // Subtle glow
  const glowOpacity = interpolate(
    frame,
    [startFrame + 24, startFrame + 38],
    [0, 0.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        perspective: 1000,
        perspectiveOrigin: side === "left" ? "0% 50%" : "100% 50%",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateX(${translateX}px) rotateY(${doorRotateY}deg) translateZ(${doorZ}px)`,
          transformOrigin: side === "left" ? "left center" : "right center",
          background: COLORS.glassBg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 20,
          padding: "44px 48px",
          width: 440,
          border: `1px solid ${COLORS.glassBorder}`,
          boxShadow: `${COLORS.shadowMd}, 0 0 ${40 * glowOpacity * 12}px ${COLORS.emerald}15`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top emerald accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.emerald}50, transparent)`,
            opacity: glowOpacity * 10,
          }}
        />
        <div style={{ fontSize: 64, lineHeight: 1 }}>{icon}</div>
        <div
          style={{
            fontFamily: FONTS.inter,
            fontWeight: 700,
            fontSize: 32,
            color: COLORS.text,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          {features.map((f, i) => {
            const fOpacity = interpolate(
              frame,
              [startFrame + 22 + i * 8, startFrame + 36 + i * 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const fY = interpolate(
              frame,
              [startFrame + 22 + i * 8, startFrame + 36 + i * 8],
              [12, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.out,
              }
            );
            return (
              <div
                key={i}
                style={{
                  opacity: fOpacity,
                  transform: `translateY(${fY}px)`,
                  fontFamily: FONTS.spaceGrotesk,
                  fontSize: 22,
                  color: COLORS.textMuted,
                }}
              >
                {f}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ForEveryone: React.FC = () => {
  const frame = useCurrentFrame();

  // "Secured by Fuin" — premium ease
  const convergeOpacity = interpolate(frame, [62, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const convergeScale = interpolate(frame, [62, 85], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Gradient accent line
  const lineWidth = interpolate(frame, [62, 88], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  return (
    <PremiumBackground variant="deep">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
        }}
      >
        <div style={{ display: "flex", gap: 48 }}>
          <Card
            title="AI Agents"
            icon={
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
              >
                <rect
                  x="12"
                  y="8"
                  width="40"
                  height="32"
                  rx="6"
                  stroke={COLORS.emerald}
                  strokeWidth="3"
                  fill="none"
                />
                <circle cx="24" cy="24" r="4" fill={COLORS.emerald} />
                <circle cx="40" cy="24" r="4" fill={COLORS.emerald} />
                <rect
                  x="24"
                  y="44"
                  width="16"
                  height="4"
                  rx="2"
                  fill={COLORS.textMuted}
                />
                <rect
                  x="20"
                  y="52"
                  width="24"
                  height="4"
                  rx="2"
                  fill={COLORS.textMuted}
                />
              </svg>
            }
            features={["Autonomous spending", "Bounded by policy", "Revocable in one click"]}
            startFrame={5}
            side="left"
          />
          <Card
            title="Teenagers"
            icon={
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
              >
                <circle
                  cx="32"
                  cy="20"
                  r="12"
                  stroke={COLORS.emerald}
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M12 56c0-11 9-20 20-20s20 9 20 20"
                  stroke={COLORS.emerald}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            }
            features={["Weekly allowances on-chain", "Instant freeze if needed", "Learn crypto safely"]}
            startFrame={12}
            side="right"
          />
        </div>

        {/* Gradient accent line */}
        <div
          style={{
            width: lineWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${COLORS.emerald}60, transparent)`,
            marginTop: -24,
            boxShadow: `0 0 8px ${COLORS.emerald}20`,
          }}
        />

        <div
          style={{
            opacity: convergeOpacity,
            transform: `scale(${convergeScale})`,
            fontFamily: FONTS.inter,
            fontWeight: 800,
            fontSize: 44,
            color: COLORS.emerald,
          }}
        >
          Secured by Fuin
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
