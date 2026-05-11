// v1 keys preserved; values rewired to v2 OKLCH tokens.
// All values are CSS expressions consumed as inline style strings.
export const COLORS = {
  bg: "var(--ink)",
  bgCard: "var(--ink-rise)",
  bgCardHover:
    "color-mix(in oklch, var(--ink-rise), var(--cream) 4%)",
  bgInput: "var(--ink-deep)",
  emerald: "var(--ledger)",
  emeraldGlow: "transparent",
  emeraldSubtle: "var(--ledger-low)",
  emeraldBorder: "var(--ledger)",
  text: "var(--cream)",
  textSecondary: "var(--cream-soft)",
  textMuted: "var(--mute)",
  textDim: "var(--rule)",
  border: "var(--rule-soft)",
  borderLight: "var(--rule)",
  green: "var(--lichen)",
  greenSubtle: "var(--lichen-low)",
  greenBorder: "var(--lichen)",
  red: "var(--oxide)",
  redSubtle: "color-mix(in oklch, var(--oxide), transparent 80%)",
  redBorder: "var(--oxide)",
  blue: "var(--mute)",
  blueSubtle: "var(--ink-rise)",
  amber: "var(--ledger)",
  purple: "var(--mute)",
  purpleSubtle: "var(--ink-rise)",
};

export const GLASS_STYLE = {
  backgroundColor: COLORS.bgCard,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "2px",
  // blur and box-shadow intentionally removed for v2 flat surfaces
};

export const GLASS_CARD_HOVER = {
  backgroundColor: COLORS.bgCardHover,
  // y-lift and emerald-glow shadow intentionally removed
};

export const MOTION_FADE_IN = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

export const MOTION_STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.1 } },
};
