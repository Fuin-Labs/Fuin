"use client";

import { JSX, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * UsecaseFlow — two delegation scenarios (Autonomous Agents / Junior Vaults).
 * Rebuilt 2026-05-28 to match the lime-on-near-black brand: no emerald/rose/yellow,
 * no side-stripe borders, no icon-in-rounded-square pattern, no glowing illustrations.
 * Flat hairline cards, monospace eyebrow labels, lime as the single accent.
 */

const IVORY = "#f2ece1";
const MUTED = "#b3aca0";
const STEEL = "#9fb4c7";
const LIVE = "#c1e859";
const LIVE_GLOW = "rgba(193, 232, 89, 0.30)";
const BG = "#0a0907";
const SURFACE = "#13110f";
const HAIRLINE = "rgba(242, 236, 225, 0.10)";
const HAIRLINE_STRONG = "rgba(242, 236, 225, 0.18)";

type TabId = "agent" | "junior";

interface Phase {
  step: number;
  title: string;
  desc: string;
}

const FLOWS: Record<TabId, { label: string; lead: string; phases: Phase[] }> = {
  agent: {
    label: "Autonomous agent",
    lead: "An on-chain bot trades from your funds — within bounds you signed, never beyond them.",
    phases: [
      {
        step: 1,
        title: "Awaken on deposit",
        desc: "Guardian funds the vault PDA. A Helius webhook pings the sandboxed agent: liquidity is available, scope is set.",
      },
      {
        step: 2,
        title: "Scoped session key",
        desc: "The agent receives a session key bound to specific Routes (programs, slippage, time). It cannot compose arbitrary transactions.",
      },
      {
        step: 3,
        title: "Verified intent",
        desc: "Agent signs an intent. A relayer submits the transaction. The on-chain policy engine validates every rule before it settles.",
      },
    ],
  },
  junior: {
    label: "Junior vault",
    lead: "A kid, contractor, or sub-account gets a wallet that can spend within your rules — and can never drain.",
    phases: [
      {
        step: 1,
        title: "Parental vault setup",
        desc: "Parent deploys a vault PDA. They set the PolicySet: a strict daily cap, and a whitelist of approved programs.",
      },
      {
        step: 2,
        title: "Invisible delegation",
        desc: "The junior is silently issued a time-bound session key. Their interactions feel like Web2 — no pop-ups, no seed phrase, no risk.",
      },
      {
        step: 3,
        title: "Sponsored execution",
        desc: "When they trade or play, a relayer submits the transaction and the parent's gas tank covers it. Limits are enforced mathematically on-chain.",
      },
    ],
  },
};

export const UsecaseFlow = (): JSX.Element => {
  const [tab, setTab] = useState<TabId>("agent");
  const flow = FLOWS[tab];

  return (
    <div style={{ padding: "clamp(2.5rem, 5vh, 3.5rem) clamp(1.5rem, 4vw, 3rem)" }}>
      {/* Toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(2rem, 5vh, 3rem)" }}>
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
                {FLOWS[id].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subhead */}
      <p
        style={{
          textAlign: "center",
          color: MUTED,
          fontSize: "clamp(1rem, 1.4vw, 1.18rem)",
          lineHeight: 1.55,
          maxWidth: "52ch",
          margin: "0 auto clamp(2.5rem, 6vh, 3.5rem)",
        }}
      >
        {flow.lead}
      </p>

      {/* Phases — flat hairline cards in a 3-column grid (1-col on mobile) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1px",
            background: HAIRLINE,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {flow.phases.map((p) => (
            <PhaseCell key={p.step} phase={p} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function PhaseCell({ phase }: { phase: Phase }): JSX.Element {
  return (
    <article
      style={{
        background: SURFACE,
        padding: "1.75rem 1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        position: "relative",
      }}
    >
      {/* Step indicator: a small lime dot + monospace label, no rounded-icon-square */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono-v2), ui-monospace, monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: LIVE,
            boxShadow: `0 0 6px ${LIVE_GLOW}`,
          }}
        />
        Phase {String(phase.step).padStart(2, "0")}
      </div>

      <h4
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontWeight: 500,
          fontSize: "clamp(1.25rem, 1.7vw, 1.5rem)",
          letterSpacing: "-0.01em",
          color: IVORY,
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {phase.title}
      </h4>

      <p
        style={{
          color: MUTED,
          fontSize: "0.95rem",
          lineHeight: 1.55,
          margin: 0,
          maxWidth: "32ch",
        }}
      >
        {phase.desc}
      </p>

      {/* Subtle steel hairline at the foot — secondary signal */}
      <div
        aria-hidden="true"
        style={{
          marginTop: "auto",
          paddingTop: "1.25rem",
          borderTop: `1px solid ${STEEL}`,
          opacity: 0.18,
        }}
      />
    </article>
  );
}
