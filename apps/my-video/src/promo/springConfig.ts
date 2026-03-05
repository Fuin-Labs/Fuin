export const SPRING = {
  /** Responsive but smooth — no overshoot */
  snappy: { damping: 26, stiffness: 100, mass: 1.0 },
  /** Gentle float-in */
  gentle: { damping: 28, stiffness: 60, mass: 1.2 },
  /** Smooth scale — replaces old "bouncy", zero bounce */
  smooth: { damping: 22, stiffness: 80, mass: 1.0 },
  /** Slow cinematic entrance */
  dramatic: { damping: 30, stiffness: 40, mass: 1.5 },
  /** 3D flip/rotation — smooth settle */
  flip: { damping: 24, stiffness: 70, mass: 1.0 },
  /** Heavy 3D entrance — deliberate and weighty */
  heavyFlip: { damping: 28, stiffness: 40, mass: 1.6 },
} as const;
