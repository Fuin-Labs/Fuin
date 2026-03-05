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
import { TerminalWindow } from "../components/TerminalWindow";
import { PremiumBackground } from "../components/PremiumBackground";
import { AccentHeadline } from "../components/AccentHeadline";

const COMMAND = "fuin transfer 0.5 SOL to 66z2F9...b7bJ1U";

const RESPONSE_LINES = [
  { text: "\u2713 Policy check passed", color: COLORS.emerald, frame: 90 },
  {
    text: "\u2713 Spending limit: 0.5 / 2.0 SOL",
    color: COLORS.emerald,
    frame: 105,
  },
  { text: "\u2713 Transfer executed", color: COLORS.emerald, frame: 120 },
  {
    text: "Signature: 4xK7...mP2q",
    color: "rgba(255,255,255,0.4)",
    frame: 135,
  },
];

// Floating decorative dots
const DOTS = [
  { x: 140, y: 180, size: 6, delay: 0 },
  { x: 1720, y: 250, size: 8, delay: 10 },
  { x: 200, y: 750, size: 5, delay: 20 },
  { x: 1680, y: 800, size: 7, delay: 5 },
  { x: 960, y: 140, size: 5, delay: 15 },
  { x: 400, y: 400, size: 4, delay: 25 },
  { x: 1500, y: 600, size: 6, delay: 8 },
];

export const TerminalDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal entrance — smooth
  const tiltSpring = spring({
    frame,
    fps,
    config: SPRING.heavyFlip,
  });
  const termRotateX = interpolate(tiltSpring, [0, 1], [10, 0]);
  const termRotateY = interpolate(tiltSpring, [0, 1], [-6, 0]);
  const termZ = interpolate(tiltSpring, [0, 1], [-120, 0]);

  const terminalOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Title above terminal
  const titleOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const titleY = interpolate(frame, [0, 24], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Typing animation
  const typedLength = Math.max(
    0,
    Math.floor(
      interpolate(frame, [18, 80], [0, COMMAND.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );
  const typedCommand = COMMAND.slice(0, typedLength);
  const showCursor = frame >= 18 && frame <= 85;
  const cursorBlink = Math.sin(frame * 0.4) > 0;

  // Scanline
  const scanlineY = (frame * 3) % 100;
  const scanlineOpacity = interpolate(frame, [10, 25], [0, 0.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PremiumBackground variant="deep">
      {/* Floating decorative dots */}
      {DOTS.map((dot, i) => {
        const dotY = interpolate(
          frame,
          [dot.delay, dot.delay + 155],
          [0, -25],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const dotOpacity = interpolate(
          frame,
          [dot.delay, dot.delay + 20, 140, 155],
          [0, 0.3, 0.3, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const dotScale = 1 + Math.sin((frame + i * 10) * 0.04) * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: COLORS.emerald,
              opacity: dotOpacity,
              transform: `translateY(${dotY}px) scale(${dotScale})`,
              boxShadow: `0 0 ${dot.size * 3}px ${COLORS.emerald}40`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          <AccentHeadline prefix="Policy-checked in" accent="real time." fontSize={40} />
        </div>

        {/* Terminal with 3D perspective */}
        <div style={{ perspective: 1200 }}>
          <div
            style={{
              opacity: terminalOpacity,
              transform: `rotateX(${termRotateX}deg) rotateY(${termRotateY}deg) translateZ(${termZ}px)`,
              position: "relative",
            }}
          >
            <TerminalWindow width={950}>
              {/* Command line */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: COLORS.emerald }}>$ </span>
                <span style={{ color: "#ffffff" }}>{typedCommand}</span>
                {showCursor && (
                  <span
                    style={{
                      color: COLORS.emerald,
                      opacity: cursorBlink ? 1 : 0,
                    }}
                  >
                    |
                  </span>
                )}
              </div>

              {/* Blank line */}
              {frame >= 88 && <div style={{ height: 8 }} />}

              {/* Response lines */}
              {RESPONSE_LINES.map((line, i) => {
                const lineOpacity = interpolate(
                  frame,
                  [line.frame, line.frame + 14],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const lineY = interpolate(
                  frame,
                  [line.frame, line.frame + 14],
                  [12, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: EASE.out,
                  }
                );
                const glowIntensity =
                  line.color === COLORS.emerald
                    ? interpolate(
                        frame,
                        [line.frame, line.frame + 5, line.frame + 22],
                        [0, 0.4, 0],
                        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                      )
                    : 0;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: lineOpacity,
                      transform: `translateY(${lineY}px)`,
                      color: line.color,
                      fontFamily: FONTS.firaCode,
                      position: "relative",
                    }}
                  >
                    {glowIntensity > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: -16,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "110%",
                          height: "140%",
                          background: `${COLORS.emerald}`,
                          opacity: glowIntensity,
                          filter: "blur(16px)",
                          borderRadius: 8,
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <span style={{ position: "relative" }}>{line.text}</span>
                  </div>
                );
              })}
            </TerminalWindow>

            {/* Scanline overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${scanlineY}%`,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)`,
                  opacity: scanlineOpacity,
                  filter: "blur(1px)",
                }}
              />
            </div>

            {/* CRT lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
                opacity: scanlineOpacity * 6,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
