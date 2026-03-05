import { Easing } from "remotion";

/**
 * Premium easing curves inspired by Lenis smooth-scroll deceleration.
 * Fast initial movement, very gradual settle — no bounce, no snap.
 */
export const EASE = {
  /** Primary content entrance — aggressive deceleration like Lenis */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Slide-in elements — slightly softer start */
  slideOut: Easing.bezier(0.25, 1, 0.5, 1),
  /** Symmetric ease for shimmers and sweeps */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;
