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
import { FuinLogo } from "../components/FuinLogo";
import { PremiumBackground } from "../components/PremiumBackground";
import { AccentHeadline } from "../components/AccentHeadline";

// Particle burst configuration — particles radiate outward when logo lands
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * Math.PI * 2,
  speed: 1.5 + Math.random() * 2,
  size: 3 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3D logo flip-in — smooth settle
  const flipSpring = spring({
    frame,
    fps,
    config: SPRING.flip,
  });
  const logoRotateY = interpolate(flipSpring, [0, 1], [90, 0]);
  const logoZ = interpolate(flipSpring, [0, 1], [-200, 0]);
  const logoScale = interpolate(flipSpring, [0, 0.6, 1], [0.7, 1.04, 1]);

  // "FUIN" types letter by letter starting at frame 25
  const letters = "FUIN";
  const typedCount = Math.min(
    letters.length,
    Math.max(0, Math.floor((frame - 25) / 7))
  );
  const typedText = letters.slice(0, typedCount);

  // Tagline fades in with premium easing — longer duration
  const taglineOpacity = interpolate(frame, [55, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const taglineY = interpolate(frame, [55, 85], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Emerald accent line draws from center outward
  const lineWidth = interpolate(frame, [50, 80], [0, 240], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const lineOpacity = interpolate(frame, [50, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Particle burst starts when logo flip is ~80% done
  const particleTrigger = 18;

  return (
    <PremiumBackground>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* 3D perspective container for logo */}
        <div
          style={{
            perspective: 1200,
            position: "relative",
          }}
        >
          {/* Particle burst radiating from logo center */}
          {frame >= particleTrigger &&
            PARTICLES.map((p, i) => {
              const pFrame = frame - particleTrigger - p.delay;
              if (pFrame < 0) return null;
              const dist = pFrame * p.speed * 2.5;
              const pOpacity = interpolate(pFrame, [0, 5, 35], [0, 0.7, 0], {
                extrapolateRight: "clamp",
                extrapolateLeft: "clamp",
              });
              const px = Math.cos(p.angle) * dist;
              const py = Math.sin(p.angle) * dist;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    background: COLORS.emerald,
                    opacity: pOpacity,
                    transform: `translate(${px - p.size / 2}px, ${py - p.size / 2}px)`,
                    boxShadow: `0 0 ${p.size * 2}px ${COLORS.emerald}`,
                    pointerEvents: "none",
                  }}
                />
              );
            })}

          <div
            style={{
              transform: `rotateY(${logoRotateY}deg) translateZ(${logoZ}px) scale(${logoScale})`,
              backfaceVisibility: "hidden",
            }}
          >
            <FuinLogo size={140} animate={false} showGlow />
          </div>
        </div>

        <div
          style={{
            fontFamily: FONTS.inter,
            fontWeight: 800,
            fontSize: 72,
            color: COLORS.text,
            letterSpacing: "0.1em",
            minHeight: 90,
          }}
        >
          {typedText}
          {typedCount < letters.length && (
            <span
              style={{
                opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                color: COLORS.emerald,
              }}
            >
              |
            </span>
          )}
        </div>

        {/* Emerald accent line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.emerald}, transparent)`,
            opacity: lineOpacity,
            marginTop: -16,
            boxShadow: `0 0 12px ${COLORS.emerald}40`,
          }}
        />

        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontSize: 32,
          }}
        >
          <AccentHeadline prefix="Your wallet." accent="Your rules." fontSize={32} />
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
