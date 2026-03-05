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

const STATS = [
  { label: "Balance", value: 24.5, suffix: " SOL", decimals: 1, dotColor: COLORS.emerald },
  { label: "Transactions", value: 127, suffix: "", decimals: 0, dotColor: "#60a5fa" },
  { label: "Active Delegates", value: 3, suffix: "", decimals: 0, dotColor: COLORS.emerald },
];

const TRANSACTIONS = [
  { amount: "0.5 SOL", to: "66z2...b7bJ", status: "Policy OK", ok: true },
  { amount: "1.2 SOL", to: "8xM4...qP2r", status: "Policy OK", ok: true },
  { amount: "0.3 SOL", to: "2bK9...nL5w", status: "Limit Hit", ok: false },
];

export const LiveDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title — premium easing
  const titleOpacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const titleY = interpolate(frame, [0, 22], [35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Browser window — horizontal slide from right
  const browserSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: SPRING.gentle,
  });
  const browserX = interpolate(browserSpring, [0, 1], [60, 0]);
  const browserOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Balance counter glow — pulse when counter reaches final value
  const balanceGlow = interpolate(frame, [63, 68, 80], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated cursor
  const cursorOpacity = interpolate(frame, [45, 50, 90, 95], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [45, 70, 85, 95], [200, 350, 600, 700], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const cursorY = interpolate(frame, [45, 70, 85, 95], [80, 120, 260, 280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });

  // Vault Overview header
  const vaultHeaderOpacity = interpolate(frame, [18, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Recent Transactions header
  const recentHeaderOpacity = interpolate(frame, [52, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  return (
    <PremiumBackground>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <AccentHeadline prefix="" accent="Real-time" suffix=" vault monitoring" fontSize={40} />
        </div>

        {/* Browser window mockup */}
        <div
          style={{
            opacity: browserOpacity,
            transform: `translateX(${browserX}px)`,
            width: 1000,
            position: "relative",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
            boxShadow: COLORS.shadowLg,
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "6px 16px",
                fontFamily: FONTS.firaCode,
                fontSize: 13,
                color: COLORS.textMuted,
                textAlign: "center",
              }}
            >
              app.fuin.fun
            </div>
          </div>

          {/* Dashboard content */}
          <div style={{ padding: "24px 32px" }}>
            <div
              style={{
                opacity: vaultHeaderOpacity,
                fontFamily: FONTS.inter,
                fontWeight: 700,
                fontSize: 20,
                color: COLORS.text,
                marginBottom: 16,
              }}
            >
              Vault Overview
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              {STATS.map((stat, i) => {
                const cardDelay = 22 + i * 10;
                const cardSpring = spring({
                  frame: Math.max(0, frame - cardDelay),
                  fps,
                  config: SPRING.snappy,
                  from: 0.9,
                  to: 1,
                });
                const cardOpacity = interpolate(
                  frame,
                  [cardDelay, cardDelay + 16],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const counterProgress = interpolate(
                  frame,
                  [32, 65],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out }
                );
                const displayValue = stat.decimals > 0
                  ? (stat.value * counterProgress).toFixed(stat.decimals)
                  : Math.floor(stat.value * counterProgress);

                // Balance card gets emerald glow when counter finishes
                const isBalance = stat.label === "Balance";
                const glowShadow = isBalance && balanceGlow > 0
                  ? `0 0 20px rgba(52,211,153,${(balanceGlow * 0.3).toFixed(2)})`
                  : "none";

                return (
                  <div
                    key={stat.label}
                    style={{
                      flex: 1,
                      opacity: cardOpacity,
                      transform: `scale(${cardSpring})`,
                      background: COLORS.glassBg,
                      border: `1px solid ${COLORS.glassBorder}`,
                      borderRadius: 12,
                      padding: "20px 20px",
                      boxShadow: glowShadow,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: stat.dotColor,
                          boxShadow: `0 0 6px ${stat.dotColor}80`,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: FONTS.spaceGrotesk,
                          fontSize: 14,
                          color: COLORS.textMuted,
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.inter,
                        fontWeight: 700,
                        fontSize: 28,
                        color: COLORS.text,
                      }}
                    >
                      {displayValue}{stat.suffix}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Transactions */}
            <div
              style={{
                opacity: recentHeaderOpacity,
                fontFamily: FONTS.inter,
                fontWeight: 700,
                fontSize: 18,
                color: COLORS.text,
                marginBottom: 12,
              }}
            >
              Recent Transactions
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRANSACTIONS.map((tx, i) => {
                const rowDelay = 62 + i * 14;
                const rowOpacity = interpolate(
                  frame,
                  [rowDelay, rowDelay + 14],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const rowX = interpolate(
                  frame,
                  [rowDelay, rowDelay + 14],
                  [40, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: EASE.slideOut,
                  }
                );
                // Red flash on "Limit Hit" row (3rd row, i === 2)
                const isLimitHit = i === 2;
                const limitFlash = isLimitHit
                  ? interpolate(frame, [rowDelay + 14, rowDelay + 18, rowDelay + 26], [0, 1, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  : 0;
                const rowBg = isLimitHit && limitFlash > 0
                  ? `rgba(239,68,68,${(limitFlash * 0.08).toFixed(3)})`
                  : "rgba(255,255,255,0.03)";
                const rowBorder = isLimitHit && limitFlash > 0
                  ? `1px solid rgba(239,68,68,${(0.25 + limitFlash * 0.25).toFixed(2)})`
                  : "1px solid rgba(255,255,255,0.06)";

                return (
                  <div
                    key={i}
                    style={{
                      opacity: rowOpacity,
                      transform: `translateX(${rowX}px)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: rowBg,
                      border: rowBorder,
                      borderRadius: 10,
                      padding: "14px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.firaCode,
                        fontSize: 16,
                        color: COLORS.text,
                      }}
                    >
                      {tx.amount}{" "}
                      <span style={{ color: COLORS.textMuted }}>{"\u2192"} {tx.to}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.inter,
                        fontWeight: 600,
                        fontSize: 13,
                        color: tx.ok ? COLORS.emerald : COLORS.red,
                        background: tx.ok ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: `1px solid ${tx.ok ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
                      }}
                    >
                      {tx.status}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animated cursor pointer */}
            {cursorOpacity > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: cursorX,
                  top: cursorY,
                  opacity: cursorOpacity,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                }}
              >
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <path
                    d="M2 1L2 17L6.5 13L10.5 21L13.5 19.5L9.5 11.5L15 11L2 1Z"
                    fill="white"
                    stroke="#1a1a1a"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
