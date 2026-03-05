import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../colors";
import { SPRING } from "../springConfig";
import { FeatureHighlight } from "../components/FeatureHighlight";
import { PremiumBackground } from "../components/PremiumBackground";

// SVG icons
const KeyIcon = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <circle cx="20" cy="22" r="10" stroke={COLORS.emeraldDark} strokeWidth="2.5" fill="none" />
    <path d="M28 28l16 16" stroke={COLORS.emeraldDark} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M38 38l6 0M42 44l0-6" stroke={COLORS.emeraldDark} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="22" r="4" fill={COLORS.emerald} />
  </svg>
);

const LockIcon = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <rect
      x="14"
      y="24"
      width="28"
      height="22"
      rx="4"
      fill={COLORS.emerald}
      stroke={COLORS.emeraldDark}
      strokeWidth="2"
    />
    <path
      d="M20 24v-6a8 8 0 0116 0v6"
      stroke={COLORS.emeraldDark}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="28" cy="36" r="3" fill={COLORS.emeraldDark} />
  </svg>
);

const ClockIcon = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="28" r="22" stroke={COLORS.emeraldDark} strokeWidth="2.5" fill="none" />
    <circle cx="28" cy="28" r="18" fill={COLORS.emerald} fillOpacity="0.15" />
    <path d="M28 14v14l10 6" stroke={COLORS.emeraldDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="28" cy="28" r="3" fill={COLORS.emeraldDark} />
  </svg>
);

const ShieldIcon = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <path
      d="M28 4L8 14v14c0 12 8.5 22.4 20 26 11.5-3.6 20-14 20-26V14L28 4z"
      fill={COLORS.emerald}
      stroke={COLORS.emeraldDark}
      strokeWidth="2"
    />
    <path
      d="M20 28l6 6 10-12"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Extended timings for 110-frame scene duration
const FEATURES = [
  { title: "Scoped Permissions", subtitle: "Only the access you grant", icon: KeyIcon, start: 0, end: 30 },
  { title: "Instant Revocation", subtitle: "Cut access in one tx", icon: LockIcon, start: 28, end: 58 },
  { title: "Epoch-Based Limits", subtitle: "Spending resets automatically", icon: ClockIcon, start: 56, end: 86 },
  { title: "Guardian-Controlled", subtitle: "You hold the keys, always", icon: ShieldIcon, start: 84, end: 110 },
];

// Alternating directions for variety
const DIRECTIONS: Array<"right" | "left"> = ["right", "left", "right", "left"];

export const FeatureTicker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine which feature is currently active for the counter
  const activeIndex = FEATURES.findIndex(
    (f) => frame >= f.start && frame < f.end
  );

  return (
    <PremiumBackground variant="emerald">
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1200,
        }}
      >
        {FEATURES.map((f, i) => {
          const dir = DIRECTIONS[i];
          const enterSpring = spring({
            frame: Math.max(0, frame - f.start),
            fps,
            config: SPRING.flip,
          });
          // Subtle 3D: card flips in from the side with depth
          const rotateY = dir === "right"
            ? interpolate(enterSpring, [0, 1], [25, 0])
            : interpolate(enterSpring, [0, 1], [-25, 0]);
          const translateZ = interpolate(enterSpring, [0, 1], [-80, 0]);

          return (
            <div
              key={f.title}
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
              }}
            >
              <FeatureHighlight
                title={f.title}
                subtitle={f.subtitle}
                icon={f.icon}
                startFrame={f.start}
                endFrame={f.end}
              />
            </div>
          );
        })}

        {/* Feature counter dots at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {FEATURES.map((_, i) => {
            const isActive = i === activeIndex;
            const dotScale = isActive ? 1 : 0.7;
            const dotOpacity = interpolate(frame, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isActive ? COLORS.emerald : COLORS.textMuted,
                  opacity: dotOpacity * (isActive ? 1 : 0.3),
                  transform: `scale(${dotScale})`,
                  transition: "none",
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
