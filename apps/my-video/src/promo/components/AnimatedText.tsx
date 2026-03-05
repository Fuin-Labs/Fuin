import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../springConfig";

export const AnimatedText: React.FC<{
  text: string;
  startFrame?: number;
  duration?: number;
  style?: React.CSSProperties;
  slideDistance?: number;
  direction?: "up" | "down";
}> = ({
  text,
  startFrame = 0,
  duration = 20,
  style = {},
  slideDistance = 30,
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const sign = direction === "up" ? 1 : -1;
  const springProgress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING.gentle,
  });
  const translateY = interpolate(springProgress, [0, 1], [slideDistance * sign, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
