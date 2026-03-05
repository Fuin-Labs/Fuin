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

const POLICIES = [
  {
    label: "Spending Caps",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke={COLORS.emeraldDark} strokeWidth="1.5" fill="none" />
        <path d="M11 6v6l4 2" stroke={COLORS.emeraldDark} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    label: "Program Whitelist",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="14" rx="2" stroke={COLORS.emeraldDark} strokeWidth="1.5" fill="none" />
        <path d="M7 9h8M7 13h5" stroke={COLORS.emeraldDark} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Time Windows",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="13" rx="2" stroke={COLORS.emeraldDark} strokeWidth="1.5" fill="none" />
        <path d="M3 9h16" stroke={COLORS.emeraldDark} strokeWidth="1.5" />
        <rect x="6" y="12" width="3" height="3" rx="0.5" fill={COLORS.emeraldDark} />
      </svg>
    ),
  },
  {
    label: "Risk Thresholds",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2L2 9v5c0 4 3.5 7.5 9 9 5.5-1.5 9-5 9-9V9L11 2z"
          stroke={COLORS.emeraldDark}
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M8 11l2.5 2.5L15 9" stroke={COLORS.emeraldDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

export const SolutionVault: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline — faster entrance
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const headlineY = interpolate(frame, [0, 18], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Subtitle — earlier
  const subOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Vault card 3D flip entrance — starts earlier with faster spring
  const vaultFlip = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: SPRING.flip,
  });
  const vaultRotateY = interpolate(vaultFlip, [0, 1], [-90, 0]);
  const vaultZ = interpolate(vaultFlip, [0, 1], [-200, 0]);
  const vaultScale = interpolate(vaultFlip, [0, 1], [0.88, 1]);

  // Border draw — earlier
  const borderProgress = interpolate(frame, [12, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Shield pulse
  const shieldPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.15, 0.3, 0.15],
  );

  // Shimmer sweep — earlier
  const shimmerX = interpolate(frame, [25, 60], [-100, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const shimmerOpacity = interpolate(frame, [25, 35, 50, 60], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PremiumBackground variant="emerald">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        {/* Gradient text headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          <AccentHeadline prefix="Meet your" accent="vault." fontSize={56} />
        </div>

        <div
          style={{
            opacity: subOpacity,
            fontFamily: FONTS.spaceGrotesk,
            fontWeight: 400,
            fontSize: 28,
            color: COLORS.textMuted,
          }}
        >
          On-chain vaults with built-in guardrails
        </div>

        {/* Vault card — 3D flip */}
        <div style={{ perspective: 1400 }}>
          <div
            style={{
              transform: `rotateY(${vaultRotateY}deg) translateZ(${vaultZ}px) scale(${vaultScale})`,
              backfaceVisibility: "hidden",
              background: COLORS.glassBg,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: 24,
              padding: "36px 52px 40px",
              width: 680,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              boxShadow: `${COLORS.shadowLg}, 0 0 60px ${COLORS.emerald}10`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated border overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: `2px solid ${COLORS.emerald}`,
                borderRadius: 24,
                opacity: borderProgress,
                clipPath: `inset(0 ${(1 - borderProgress) * 100}% 0 0)`,
                pointerEvents: "none",
              }}
            />

            {/* Shimmer sweep overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(105deg, transparent ${shimmerX - 15}%, rgba(255,255,255,0.15) ${shimmerX}%, transparent ${shimmerX + 15}%)`,
                opacity: shimmerOpacity,
                pointerEvents: "none",
                borderRadius: 24,
              }}
            />

            {/* Inner glow line at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${COLORS.emerald}60, transparent)`,
              }}
            />

            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS.emeraldGlow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${COLORS.emerald}${Math.round(shieldPulse * 255).toString(16).padStart(2, "0")}`,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path
                    d="M13 2L3 8v6c0 6 4 10.5 10 13 6-2.5 10-7 10-13V8L13 2z"
                    fill={COLORS.emerald}
                    stroke={COLORS.emeraldDark}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 13l3 3 5-6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONTS.inter,
                    fontWeight: 700,
                    fontSize: 24,
                    color: COLORS.text,
                    letterSpacing: "0.04em",
                  }}
                >
                  VAULT
                </div>
                <div
                  style={{
                    fontFamily: FONTS.firaCode,
                    fontSize: 13,
                    color: COLORS.textMuted,
                    marginTop: 2,
                  }}
                >
                  7xK9...mQ4r
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${COLORS.cardBorder}, transparent)`,
                margin: "16px 0",
              }}
            />

            {/* 2x2 Policy grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {POLICIES.map((policy, i) => {
                const pillDelay = 28 + i * 8;
                const pillSpring = spring({
                  frame: Math.max(0, frame - pillDelay),
                  fps,
                  config: SPRING.smooth,
                });
                const pillScale = interpolate(pillSpring, [0, 1], [0, 1]);
                const pillRotateX = interpolate(pillSpring, [0, 1], [-8, 0]);
                const pillOpacity = interpolate(
                  frame,
                  [pillDelay, pillDelay + 16],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div
                    key={policy.label}
                    style={{
                      opacity: pillOpacity,
                      transform: `scale(${pillScale}) rotateX(${pillRotateX}deg)`,
                      background: COLORS.glassBg,
                      border: `1px solid ${COLORS.emerald}30`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: COLORS.emeraldGlow,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {policy.icon}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.spaceGrotesk,
                        fontWeight: 500,
                        fontSize: 18,
                        color: COLORS.emerald,
                      }}
                    >
                      {policy.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
