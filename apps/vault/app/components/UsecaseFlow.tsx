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

interface Phase {
  step: number;
  title: string;
  desc: string;
}

interface View {
  label: string;
  phases: Phase[];
}

const VIEWS: Record<TabId, View> = {
  agent: {
    label: "Autonomous agent",
    phases: [
      {
        step: 1,
        title: "Awaken via webhook",
        desc: "Guardian deposits funds into the PDA. A Helius webhook fires immediately, pinging the sandboxed agent: liquidity is available, scope is set.",
      },
      {
        step: 2,
        title: "Acquire scoped session",
        desc: "Agent receives a cryptographic session key bound strictly to predefined Routes (capability routing). It cannot compose custom transactions.",
      },
      {
        step: 3,
        title: "Execute verified intent",
        desc: "Agent signs an intent (e.g. swap SOL for USDC). A relayer submits the transaction and covers gas. The on-chain policy engine validates every rule before it settles.",
      },
    ],
  },
  junior: {
    label: "Junior vault",
    phases: [
      {
        step: 1,
        title: "Parental vault setup",
        desc: "Parent deploys a smart PDA vault. They establish the PolicySet: a strict daily limit and a whitelist of approved programs (e.g. specific games or DEXes).",
      },
      {
        step: 2,
        title: "Invisible delegation",
        desc: "The junior is silently issued a time-bound session key. Their interactions feel like Web2, without pop-ups or seed phrase risks.",
      },
      {
        step: 3,
        title: "Sponsored execution",
        desc: "When trading or playing, a relayer pushes the transaction. Gas is sponsored by the parent's gas tank. The on-chain policy verifies limits mathematically.",
      },
    ],
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

      {/* Split layout — SVG on the left, 3-phase card stack on the right (md+).
          Stacks vertically on mobile with the SVG above the cards. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="uf-split"
        >
          {/* Left: character SVG inside the framed panel */}
          <div className="uf-visual">
            {tab === "agent" ? <OpenClawAgent /> : <KidVault />}
          </div>

          {/* Right: phase card stack */}
          <div className="uf-stack">
            {view.phases.map((phase, i) => (
              <PhaseCard key={phase.step} phase={phase} delay={i * 0.08} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .uf-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(2rem, 5vh, 3rem);
          align-items: center;
        }
        @media (min-width: 880px) {
          .uf-split {
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
            gap: clamp(2.5rem, 5vw, 4rem);
          }
        }
        .uf-visual {
          position: relative;
          border: 1px solid ${HAIRLINE_STRONG};
          border-radius: 14px;
          overflow: hidden;
          background:
            radial-gradient(ellipse 60% 60% at 50% 40%, rgba(193, 232, 89, 0.04), transparent 70%),
            var(--paper-rise);
          box-shadow: 0 30px 80px -40px rgba(193, 232, 89, 0.16), 0 0 0 1px rgba(193, 232, 89, 0.05);
          min-height: clamp(280px, 42vh, 420px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1.5rem, 4vh, 2.5rem);
        }
        .uf-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      `}</style>
    </div>
  );
};

/**
 * PhaseCard — one row in the right-side stack. Title + description, hairline
 * border, lime accent dot + corner-tick on hover. No side-stripe (skill ban),
 * no icon-in-rounded-square (skill ban), no Phase NN eyebrow (skill ban).
 */
function PhaseCard({ phase, delay }: { phase: Phase; delay: number }): JSX.Element {
  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        padding: "1.4rem 1.5rem",
        background: "var(--paper-rise)",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 10,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        transition: "border-color 0.25s ease, transform 0.25s ease",
      }}
      whileHover={{ borderColor: LIVE, x: 4 }}
    >
      {/* Lime accent dot — single semantic mark per card, like the rest of the brand */}
      <span
        aria-hidden="true"
        style={{
          flex: "none",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: LIVE,
          marginTop: 8,
          boxShadow: `0 0 8px rgba(193, 232, 89, 0.45)`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h4
          style={{
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 700,
            fontSize: "1.05rem",
            letterSpacing: "-0.012em",
            color: IVORY,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {phase.title}
        </h4>
        <p
          style={{
            color: MUTED,
            fontSize: "0.9rem",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {phase.desc}
        </p>
      </div>
    </motion.article>
  );
}

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
