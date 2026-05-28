"use client";

import { JSX, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
 * OpenClaw — Fuin's autonomous agent persona. Geometric line-art bot: hex head
 * with one lime aperture-eye, antenna with signal pulses, F-monogram chest stem,
 * scoped-perimeter brackets enclosing the body. Drawn (not borrowed) per brand.
 */
function OpenClawAgent(): JSX.Element {
  return (
    <svg
      viewBox="0 0 280 320"
      width="280"
      height="320"
      fill="none"
      stroke={IVORY}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="OpenClaw — an autonomous agent operating within a scoped perimeter"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Scoped-perimeter brackets — the agent operates inside these bounds */}
      <path d="M 28 70 L 18 70 L 18 250 L 28 250" stroke={LIVE} />
      <path d="M 252 70 L 262 70 L 262 250 L 252 250" stroke={LIVE} />

      {/* Antenna + signal pulses */}
      <path d="M 140 22 L 140 60" />
      <circle cx="140" cy="16" r="4" fill={LIVE} stroke="none" />
      <path d="M 116 28 L 124 36" opacity="0.55" />
      <path d="M 164 28 L 156 36" opacity="0.55" />

      {/* Hexagonal head */}
      <path d="M 140 60 L 196 92 L 196 156 L 140 188 L 84 156 L 84 92 Z" />

      {/* Lime aperture eye (centered, single — the brand's F-aperture echo) */}
      <rect x="118" y="115" width="44" height="14" rx="2" stroke="none" fill={LIVE} opacity="0.18" />
      <rect x="118" y="115" width="44" height="14" rx="2" />
      <rect x="148" y="117" width="10" height="10" rx="1" fill={LIVE} stroke="none" />

      {/* Subtle steel scan-line below the eye */}
      <path d="M 100 144 L 180 144" stroke={STEEL} opacity="0.5" strokeWidth={1} />

      {/* Body — squarish chassis with F-stem chest detail */}
      <path d="M 92 196 L 92 268 L 188 268 L 188 196 Z" />
      <path d="M 124 208 L 124 256 L 138 256 L 138 208 Z" stroke={IVORY} />
      <path d="M 138 208 L 162 208 L 162 220 L 138 220" />
      <path d="M 138 230 L 154 230 L 154 240 L 138 240" />
      <rect x="158" y="230" width="4" height="10" fill={LIVE} stroke="none" />

      {/* Articulated arms */}
      <path d="M 92 212 L 64 232 L 64 272" />
      <path d="M 188 212 L 216 232 L 216 272" />
      <circle cx="64" cy="278" r="6" />
      <circle cx="216" cy="278" r="6" />

      {/* Feet base */}
      <path d="M 108 268 L 108 296 L 130 296 L 130 268" />
      <path d="M 150 268 L 150 296 L 172 296 L 172 268" />
      <path d="M 96 296 L 184 296" />
    </svg>
  );
}

/**
 * KidVault — a friendly junior persona. Small humanoid line figure holding a
 * lime key, standing next to a vault outline showing the parental policy frame.
 */
function KidVault(): JSX.Element {
  return (
    <svg
      viewBox="0 0 320 320"
      width="320"
      height="320"
      fill="none"
      stroke={IVORY}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A junior user with a scoped key, beside a vault under parental policy"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Vault on the right — policy frame */}
      <rect x="180" y="80" width="120" height="180" rx="4" />
      <circle cx="240" cy="170" r="14" />
      <path d="M 240 156 L 240 184 M 226 170 L 254 170" stroke={STEEL} />
      {/* Three lime ticks at the top of the vault = active caps */}
      <path d="M 200 96 L 200 108" stroke={LIVE} strokeWidth={2} />
      <path d="M 220 96 L 220 108" stroke={LIVE} strokeWidth={2} />
      <path d="M 240 96 L 240 108" stroke={LIVE} strokeWidth={2} />
      {/* Vault feet */}
      <path d="M 190 260 L 190 270 M 290 260 L 290 270" />

      {/* Kid on the left — round head, simple body */}
      {/* Head */}
      <circle cx="92" cy="100" r="28" />
      {/* Eyes */}
      <circle cx="82" cy="98" r="2" fill={IVORY} stroke="none" />
      <circle cx="102" cy="98" r="2" fill={IVORY} stroke="none" />
      {/* Smile */}
      <path d="M 82 110 Q 92 116 102 110" strokeWidth={1.4} />
      {/* Hair tuft */}
      <path d="M 78 76 Q 88 70 96 76 M 96 76 Q 104 70 108 78" />

      {/* Neck */}
      <path d="M 92 128 L 92 138" />

      {/* Body — slight oversized for kid proportions */}
      <path d="M 60 138 L 60 220 L 124 220 L 124 138 Z" />

      {/* Arms */}
      {/* Left arm hanging */}
      <path d="M 60 152 L 44 200 L 44 232" />
      <circle cx="44" cy="238" r="5" />
      {/* Right arm raised, holding a lime key */}
      <path d="M 124 152 L 160 132 L 160 110" />
      <circle cx="160" cy="104" r="5" />
      {/* Key bow at top of right hand */}
      <circle cx="160" cy="86" r="8" stroke={LIVE} strokeWidth={2} />
      <path d="M 160 94 L 160 70 M 158 76 L 164 76 M 158 80 L 162 80" stroke={LIVE} strokeWidth={2} />

      {/* Legs */}
      <path d="M 76 220 L 76 280 L 86 280 L 86 220" />
      <path d="M 98 220 L 98 280 L 108 280 L 108 220" />
      {/* Feet ground line */}
      <path d="M 66 282 L 118 282" />
    </svg>
  );
}
