import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "../colors";
import { FONTS } from "../fonts";
import { EASE } from "../easing";
import { PremiumBackground } from "../components/PremiumBackground";
import { AccentHeadline } from "../components/AccentHeadline";

const WORDS = ["AI agent", "teenager", "trading bot", "dApp"];
const FRAMES_PER_WORD = 25;
const TRANSITION_FRAMES = 10;

export const TextMorphing: React.FC = () => {
  const frame = useCurrentFrame();

  // Determine which word is showing
  const cycleFrame = frame % (WORDS.length * FRAMES_PER_WORD);
  const wordIndex = Math.floor(cycleFrame / FRAMES_PER_WORD);
  const frameInWord = cycleFrame % FRAMES_PER_WORD;

  const currentWord = WORDS[wordIndex];

  // Transition in — smooth slide up + fade
  const fadeIn = interpolate(frameInWord, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const slideIn = interpolate(frameInWord, [0, TRANSITION_FRAMES], [32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Transition out — smooth slide up + fade
  const fadeOut = interpolate(
    frameInWord,
    [FRAMES_PER_WORD - TRANSITION_FRAMES, FRAMES_PER_WORD],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.inOut,
    }
  );
  const slideOut = interpolate(
    frameInWord,
    [FRAMES_PER_WORD - TRANSITION_FRAMES, FRAMES_PER_WORD],
    [0, -32],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.inOut,
    }
  );

  const wordOpacity = Math.min(fadeIn, fadeOut);
  const wordY = slideIn + slideOut;

  // Headline fade in — premium easing
  const headlineOpacity = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const headlineY = interpolate(frame, [0, 28], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });

  // Subtitle fades in later
  const subOpacity = interpolate(frame, [80, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const subY = interpolate(frame, [80, 105], [20, 0], {
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
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            fontFamily: FONTS.inter,
            fontWeight: 800,
            fontSize: 56,
            color: COLORS.text,
            textAlign: "center",
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            lineHeight: 1.3,
          }}
        >
          <span>Give your</span>
          {/* Fixed-width container for cycling word */}
          <span
            style={{
              display: "inline-block",
              width: 340,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              height: 72,
              verticalAlign: "baseline",
            }}
          >
            <span
              style={{
                display: "inline-block",
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                color: COLORS.emerald,
              }}
            >
              {currentWord}
            </span>
          </span>
          <span>a wallet</span>
        </div>

        <div
          style={{
            opacity: headlineOpacity,
            textAlign: "center",
            marginTop: -16,
          }}
        >
          <AccentHeadline prefix="with" accent="guardrails." fontSize={56} />
        </div>

        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontFamily: FONTS.spaceGrotesk,
            fontWeight: 400,
            fontSize: 24,
            color: COLORS.textMuted,
            marginTop: 8,
          }}
        >
          Programmable authorization on Solana
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
