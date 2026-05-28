"use client";

import { JSX, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";

/**
 * UsecaseFlow — two delegation scenarios, each with a custom line-art character
 * SVG (OpenClaw agent for Autonomous, a kid for Junior). On-brand: ivory primary
 * stroke, lime for the "live" elements (eyes, aperture, key), steel for structure.
 */

const IVORY = "#f2ece1";
const MUTED = "#b3aca0";
const LIVE = "#c1e859";
const STEEL = "#9fb4c7";
const BG = "#0a0907";
const HAIRLINE = "rgba(242, 236, 225, 0.10)";
const HAIRLINE_STRONG = "rgba(242, 236, 225, 0.18)";

type TabId = "agent" | "junior";

interface View {
  label: string;
  caption: string;
}

const VIEWS: Record<TabId, View> = {
  agent: {
    label: "Autonomous agent",
    caption:
      "An on-chain bot trades from your funds, within bounds you signed, never beyond them. One root intent fans out into research, execute, and audit sub-agents. The rogue out-of-scope attempt bounces off verify_authorizes on-chain.",
  },
  junior: {
    label: "Junior vault",
    caption:
      "A kid, contractor, or sub-account gets a wallet that spends within your rules. Daily cap, allow-listed programs, time-bound session key. They use it like Web2; the policy engine enforces every limit on-chain.",
  },
};

export const UsecaseFlow = (): JSX.Element => {
  const [tab, setTab] = useState<TabId>("agent");
  const view = VIEWS[tab];

  return (
    <div style={{ padding: "clamp(2rem, 5vh, 3rem) clamp(0rem, 2vw, 1rem)" }}>
      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(2rem, 4vh, 2.5rem)" }}>
        <div
          role="tablist"
          aria-label="Delegation scenarios"
          style={{
            display: "inline-flex",
            padding: 4,
            border: `1px solid ${HAIRLINE_STRONG}`,
            borderRadius: 999,
            background: BG,
          }}
        >
          {(["agent", "junior"] as TabId[]).map((id) => {
            const active = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                style={{
                  padding: "0.7rem 1.3rem",
                  minHeight: 44,
                  borderRadius: 999,
                  border: "none",
                  background: active ? LIVE : "transparent",
                  color: active ? "#050505" : MUTED,
                  fontWeight: active ? 600 : 500,
                  fontSize: "0.88rem",
                  letterSpacing: "0.01em",
                  cursor: "pointer",
                  transition: "background 0.25s ease, color 0.25s ease",
                  fontFamily: "inherit",
                }}
              >
                {VIEWS[id].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Character SVG, framed by a hairline panel. Centered, generous padding,
          subtle outer lime glow tying it back to the hero panel chrome. */}
      <AnimatePresence mode="wait">
        <motion.figure
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: 0,
            position: "relative",
            border: `1px solid ${HAIRLINE_STRONG}`,
            borderRadius: 14,
            overflow: "hidden",
            background:
              "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(193, 232, 89, 0.04), transparent 70%), var(--paper-rise)",
            boxShadow: "0 30px 80px -40px rgba(193, 232, 89, 0.16), 0 0 0 1px rgba(193, 232, 89, 0.05)",
            minHeight: "clamp(280px, 40vh, 420px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(2rem, 5vh, 3.5rem)",
          }}
        >
          {tab === "agent" ? <OpenClawAgent /> : <KidVault />}
        </motion.figure>
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`cap-${tab}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            textAlign: "center",
            color: MUTED,
            fontSize: "0.95rem",
            lineHeight: 1.55,
            maxWidth: "60ch",
            margin: "clamp(1.5rem, 3vh, 2rem) auto 0",
          }}
        >
          {view.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

/**
 * OpenClaw — Fuin's autonomous agent mascot, restored from the original
 * pre-redesign component (commit c1017a5). The lobster body + clamping claws
 * + scanning pupils with the original red gradient. Kept the character intact;
 * the scanning pupils were emerald in the original, swapped to lime to match
 * the current brand accent.
 */
function OpenClawAgent(): JSX.Element {
  return (
    <motion.div
      style={{ width: "100%", maxWidth: "300px", display: "flex", justifyContent: "center" }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 120 120"
        width="280"
        height="280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="OpenClaw — Fuin's autonomous agent mascot"
        style={{
          maxWidth: "100%",
          height: "auto",
          filter: "drop-shadow(0px 0px 24px rgba(255, 77, 77, 0.35))",
        }}
      >
        <defs>
          <linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Body — breathing animation */}
        <motion.path
          d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
          fill="url(#lobster-gradient)"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />

        {/* Left claw — clamping */}
        <motion.path
          d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
          fill="url(#lobster-gradient)"
          animate={{ rotate: [0, -15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          style={{ originX: "25px", originY: "55px" }}
        />

        {/* Right claw — clamping */}
        <motion.path
          d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
          fill="url(#lobster-gradient)"
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 0.2 }}
          style={{ originX: "95px", originY: "55px" }}
        />

        {/* Antennae */}
        <path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />
        <path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />

        {/* Eye backgrounds */}
        <circle cx="45" cy="35" r="6" fill="#050810" />
        <circle cx="75" cy="35" r="6" fill="#050810" />

        {/* Scanning pupils — recolored to lime (was emerald in the original) */}
        <motion.circle
          cx="46" cy="34" r="2.5" fill={LIVE}
          animate={{ cx: [44, 48, 44], cy: [34, 34, 34] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${LIVE})` }}
        />
        <motion.circle
          cx="76" cy="34" r="2.5" fill={LIVE}
          animate={{ cx: [74, 78, 74], cy: [34, 34, 34] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${LIVE})` }}
        />
      </svg>
    </motion.div>
  );
}

/**
 * KidVault — restored from the original pre-redesign component (commit c1017a5).
 * Floating shield with a sparkle, recolored from emerald + yellow to the brand's
 * lime + ivory palette. Same float + scale animation gesture.
 */
function KidVault(): JSX.Element {
  return (
    <motion.div
      style={{ position: "relative", display: "inline-flex" }}
      animate={{ y: [-15, 15, -15], scale: [1, 1.05, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <Shield
        size={200}
        color={LIVE}
        strokeWidth={1.2}
        style={{ filter: `drop-shadow(0 0 32px rgba(193, 232, 89, 0.45))` }}
      />
      <Sparkles
        size={42}
        color={IVORY}
        strokeWidth={1.4}
        style={{ position: "absolute", top: -12, right: -16 }}
      />
    </motion.div>
  );
}
