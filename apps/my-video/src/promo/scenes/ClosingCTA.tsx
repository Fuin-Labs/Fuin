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

export const ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: SPRING.gentle,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.8, 1]);

  const taglineOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const taglineY = interpolate(frame, [15, 40], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  const badgeOpacity = interpolate(frame, [38, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Badge 3D flip — smooth
  const badgeFlip = spring({
    frame: Math.max(0, frame - 38),
    fps,
    config: SPRING.flip,
  });
  const badgeRotateX = interpolate(badgeFlip, [0, 1], [-15, 0]);
  const badgeScale = interpolate(badgeFlip, [0, 0.5, 1], [0.92, 1.02, 1]);

  const solanaOpacity = interpolate(frame, [48, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Glow pulse — reduced intensity for clean CTA
  const glowIntensity = interpolate(
    frame,
    [38, 55, 75, 100],
    [0, 0.3, 0.15, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Social proof line
  const socialOpacity = interpolate(frame, [58, 78], [0, 1], {
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
          gap: 32,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale})`,
            position: "relative",
          }}
        >
          {/* Radial glow behind logo — reduced intensity */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.emerald}20 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              opacity: glowIntensity,
              pointerEvents: "none",
            }}
          />

          <FuinLogo size={100} animate={false} />
        </div>

        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          <AccentHeadline prefix="Take control." accent="Secured" suffix=" by Fuin." />
        </div>

        {/* Solid emerald CTA button */}
        <div style={{ perspective: 800 }}>
          <div
            style={{
              opacity: badgeOpacity,
              transform: `rotateX(${badgeRotateX}deg) scale(${badgeScale})`,
              background: COLORS.emerald,
              borderRadius: 50,
              padding: "16px 48px",
              fontFamily: FONTS.inter,
              fontWeight: 700,
              fontSize: 22,
              color: "#0a0e1a",
              boxShadow: `0 0 30px rgba(52,211,153,0.4)`,
            }}
          >
            Start building at fuinlabs.xyz
          </div>
        </div>

        <div
          style={{
            opacity: solanaOpacity,
            fontFamily: FONTS.spaceGrotesk,
            fontWeight: 400,
            fontSize: 20,
            color: COLORS.textMuted,
            marginTop: 8,
          }}
        >
          Built on Solana
        </div>

        {/* Social proof line */}
        <div
          style={{
            opacity: socialOpacity,
            fontFamily: FONTS.spaceGrotesk,
            fontWeight: 400,
            fontSize: 16,
            color: COLORS.textDim,
            marginTop: -16,
          }}
        >
          Open source {"\u00B7"} MIT Licensed
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
