import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { COLORS } from "./colors";
import { EASE } from "./easing";
import { LogoReveal } from "./scenes/LogoReveal";
import { ProblemStatement } from "./scenes/ProblemStatement";
import { TextMorphing } from "./scenes/TextMorphing";
import { SolutionVault } from "./scenes/SolutionVault";
import { TerminalDemo } from "./scenes/TerminalDemo";
import { LiveDashboard } from "./scenes/LiveDashboard";
import { ForEveryone } from "./scenes/ForEveryone";
import { FeatureTicker } from "./scenes/FeatureTicker";
import { ClosingCTA } from "./scenes/ClosingCTA";

/**
 * Fade-through-black: exiting scene fades out first, then entering
 * scene fades in — no overlapping content, the dark bg shows between.
 */
const FadeThroughBlackComponent: React.FC<
  TransitionPresentationComponentProps<Record<string, unknown>>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isExiting = presentationDirection === "exiting";
  const opacity = isExiting
    ? interpolate(presentationProgress, [0, 0.45], [1, 0], {
        extrapolateRight: "clamp",
        easing: EASE.inOut,
      })
    : interpolate(presentationProgress, [0.55, 1], [0, 1], {
        extrapolateLeft: "clamp",
        easing: EASE.out,
      });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const fadeThroughBlack = (): TransitionPresentation<
  Record<string, unknown>
> => ({
  component: FadeThroughBlackComponent,
  props: {},
});

/**
 * Slide-fade: exiting slides left while fading, entering slides from right.
 */
const SlideFadeComponent: React.FC<
  TransitionPresentationComponentProps<Record<string, unknown>>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isExiting = presentationDirection === "exiting";
  const opacity = isExiting
    ? interpolate(presentationProgress, [0, 0.5], [1, 0], {
        extrapolateRight: "clamp",
        easing: EASE.inOut,
      })
    : interpolate(presentationProgress, [0.5, 1], [0, 1], {
        extrapolateLeft: "clamp",
        easing: EASE.out,
      });
  const translateX = isExiting
    ? interpolate(presentationProgress, [0, 0.5], [0, -60], {
        extrapolateRight: "clamp",
        easing: EASE.inOut,
      })
    : interpolate(presentationProgress, [0.5, 1], [60, 0], {
        extrapolateLeft: "clamp",
        easing: EASE.out,
      });

  return (
    <AbsoluteFill style={{ opacity, transform: `translateX(${translateX}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

const slideFade = (): TransitionPresentation<Record<string, unknown>> => ({
  component: SlideFadeComponent,
  props: {},
});

// Scene durations — 9 scenes, 8 transitions
const SCENE_DURATIONS = {
  logoReveal: 100,
  problem: 100,
  textMorphing: 120,
  solution: 110,
  terminal: 155,
  liveDashboard: 130,
  forEveryone: 105,
  featureTicker: 110,
  closingCTA: 100,
};

const TRANSITION_FRAMES = 18;

export const FuinPromo: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Sequence from={0} durationInFrames={durationInFrames} layout="none">
        <Audio src={staticFile("music.mp3")} volume={0.5} />
      </Sequence>

      <TransitionSeries>
        {/* 1. Logo Reveal */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.logoReveal}
        >
          <LogoReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 2. Problem Statement */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.problem}
        >
          <ProblemStatement />
        </TransitionSeries.Sequence>

        {/* Direct cut — no transition */}

        {/* 3. Text Morphing — word cycling */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.textMorphing}
        >
          <TextMorphing />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 4. Solution Vault */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.solution}
        >
          <SolutionVault />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 5. Terminal Demo */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.terminal}
        >
          <TerminalDemo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slideFade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 6. Live Dashboard */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.liveDashboard}
        >
          <LiveDashboard />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 7. For Everyone */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.forEveryone}
        >
          <ForEveryone />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 8. Feature Ticker */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.featureTicker}
        >
          <FeatureTicker />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeThroughBlack()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* 9. Closing CTA */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.closingCTA}
        >
          <ClosingCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
