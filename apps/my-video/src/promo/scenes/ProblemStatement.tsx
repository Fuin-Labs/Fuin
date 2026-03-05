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
import { AccentHeadline } from "../components/AccentHeadline";

const RISKS = [
  {
    label: "Leaked Seed Phrase",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 3L3 25h22L14 3z"
          stroke={COLORS.red}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="14" y1="11" x2="14" y2="17" stroke={COLORS.red} strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="21" r="1.5" fill={COLORS.red} />
      </svg>
    ),
  },
  {
    label: "Unlimited Token Approvals",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke={COLORS.red} strokeWidth="2" fill="none" />
        <path d="M9 9l10 10M19 9L9 19" stroke={COLORS.red} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Drained in Seconds",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="14" rx="3" stroke={COLORS.red} strokeWidth="2" fill="none" />
        <path d="M4 13h20" stroke={COLORS.red} strokeWidth="2" />
        <path d="M14 18l3 -2 -3 -2" stroke={COLORS.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M9 18h5" stroke={COLORS.red} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const ProblemStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main headline — scale from center entrance
  const headlineOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const headlineScale = interpolate(frame, [0, 30], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Screen shake — softer, shorter
  const shakeIntensity = interpolate(frame, [52, 56, 64], [0, 2.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(frame * 2.5) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.1) * shakeIntensity * 0.7;

  // Subtitle
  const subOpacity = interpolate(frame, [64, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const subY = interpolate(frame, [64, 85], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  return (
    <PremiumBackground>
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
        }}
      >
        <div
          style={{
            opacity: headlineOpacity,
            transform: `scale(${headlineScale})`,
            textAlign: "center",
            maxWidth: 1200,
          }}
        >
          <AccentHeadline prefix="One wrong" accent="signature." />{" "}
          <span
            style={{
              fontFamily: FONTS.inter,
              fontWeight: 700,
              fontSize: 52,
              color: COLORS.textMuted,
              lineHeight: 1.3,
            }}
          >
            That&apos;s all it takes to lose everything.
          </span>
        </div>

        {/* Risk cards */}
        <div style={{ display: "flex", gap: 28, perspective: 1000 }}>
          {RISKS.map((risk, i) => {
            const cardDelay = 22 + i * 12;
            const cardOpacity = interpolate(
              frame,
              [cardDelay, cardDelay + 18],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const cardScale = spring({
              frame: Math.max(0, frame - cardDelay),
              fps,
              config: SPRING.snappy,
              from: 0.88,
              to: 1,
            });
            const tiltSpring = spring({
              frame: Math.max(0, frame - cardDelay),
              fps,
              config: SPRING.flip,
            });
            const rotateX = interpolate(tiltSpring, [0, 1], [-12, 0]);
            const cardZ = interpolate(tiltSpring, [0, 1], [-60, 0]);
            const glowOpacity = interpolate(
              frame,
              [cardDelay, cardDelay + 8, cardDelay + 25],
              [0, 0.55, 0.15],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={risk.label}
                style={{
                  opacity: cardOpacity,
                  transform: `scale(${cardScale}) rotateX(${rotateX}deg) translateZ(${cardZ}px)`,
                  background: COLORS.glassBg,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: `1px solid rgba(239,68,68,0.25)`,
                  borderRadius: 16,
                  padding: "28px 32px",
                  width: 280,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: `${COLORS.shadowMd}, 0 0 ${35 * glowOpacity}px ${COLORS.red}40`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Red top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "15%",
                    right: "15%",
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${COLORS.red}80, transparent)`,
                  }}
                />
                {/* Red bottom glow */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: "20%",
                    right: "20%",
                    height: 40,
                    background: COLORS.red,
                    opacity: glowOpacity * 0.3,
                    filter: "blur(20px)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {risk.icon}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.inter,
                    fontWeight: 600,
                    fontSize: 20,
                    color: COLORS.text,
                    textAlign: "center",
                  }}
                >
                  {risk.label}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontFamily: FONTS.spaceGrotesk,
            fontWeight: 500,
            fontSize: 30,
            color: COLORS.textMuted,
            textAlign: "center",
          }}
        >
          No spending limits. No permissions. No safety net.
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
