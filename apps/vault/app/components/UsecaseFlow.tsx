"use client";

import { JSX, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * UsecaseFlow — two delegation scenarios (Autonomous Agents / Junior Vaults).
 * Rebuilt 2026-05-28 with visual substance: large lime numerals as the visual
 * anchor per card, paper-rise surface, monospace artifact line at the foot
 * showing the actual on-chain call for that phase. Hairline border lifts to
 * lime on hover. Brand stays editorial; cards stop reading as flat text blocks.
 */

const IVORY = "#f2ece1";
const MUTED = "#b3aca0";
const LIVE = "#c1e859";
const BG = "#0a0907";
const HAIRLINE = "rgba(242, 236, 225, 0.10)";
const HAIRLINE_STRONG = "rgba(242, 236, 225, 0.18)";

type TabId = "agent" | "junior";

interface Phase {
  step: number;
  /** Content-specific 1-word label, e.g. "Trigger" — not a generic "Step 01". */
  kind: string;
  title: string;
  desc: string;
  artifact: string;
}

const FLOWS: Record<TabId, { label: string; lead: string; phases: Phase[] }> = {
  agent: {
    label: "Autonomous agent",
    lead: "An on-chain bot trades from your funds, within bounds you signed, never beyond them.",
    phases: [
      {
        step: 1,
        kind: "Trigger",
        title: "Awaken on deposit",
        desc: "Guardian funds the vault PDA. A Helius webhook pings the sandboxed agent: liquidity is available, scope is set.",
        artifact: "helius.webhook(vault_pda)",
      },
      {
        step: 2,
        kind: "Permission",
        title: "Scoped session key",
        desc: "The agent receives a session key bound to specific Routes (programs, slippage, time). It cannot compose arbitrary transactions.",
        artifact: "derive_session(scope, ttl)",
      },
      {
        step: 3,
        kind: "Settle",
        title: "Verified intent",
        desc: "Agent signs an intent. A relayer submits the transaction. The on-chain policy engine validates every rule before it settles.",
        artifact: "verify(intent) -> settles",
      },
    ],
  },
  junior: {
    label: "Junior vault",
    lead: "A kid, contractor, or sub-account gets a wallet that spends within your rules. Never drains.",
    phases: [
      {
        step: 1,
        kind: "Setup",
        title: "Parental vault setup",
        desc: "Parent deploys a vault PDA. They set the PolicySet: a strict daily cap, and a whitelist of approved programs.",
        artifact: "deploy(policy_set, cap=20)",
      },
      {
        step: 2,
        kind: "Delegate",
        title: "Invisible delegation",
        desc: "The junior is silently issued a time-bound session key. Their interactions feel like Web2: no pop-ups, no seed phrase, no risk.",
        artifact: "issue_session(holder, ttl)",
      },
      {
        step: 3,
        kind: "Spend",
        title: "Sponsored execution",
        desc: "When they trade or play, a relayer submits the transaction and the parent's gas tank covers it. Limits are enforced mathematically on-chain.",
        artifact: "relay(tx, gas=parent_tank)",
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

      {/* Phases — richer card surface (paper-rise bg + hairline border +
          large lime numeral as anchor + monospace artifact footer). The cards
          give the section the visual weight a landing needs while staying on
          brand (no icon-in-square, no side-stripe, lime as the only accent). */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="uf-grid"
        >
          {flow.phases.map((p, i) => (
            <PhaseCell key={p.step} phase={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .uf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 760px) {
          .uf-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }
        .uf-cell {
          position: relative;
          padding: clamp(2rem, 3.5vh, 2.6rem) clamp(1.6rem, 2.2vw, 2rem) clamp(1.5rem, 2.2vh, 1.75rem);
          background:
            linear-gradient(180deg, rgba(193, 232, 89, 0.025) 0%, transparent 32%),
            var(--paper-rise);
          border: 1px solid ${HAIRLINE};
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
          box-shadow: inset 0 1px 0 rgba(242, 236, 225, 0.04);
        }
        .uf-cell::before {
          /* Single thin lime corner tick — Swiss accent, not a side-stripe.
             Sits at the top-left, 24px long horizontal + 24px vertical, 1px each. */
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          border-top: 1px solid ${LIVE};
          border-left: 1px solid ${LIVE};
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .uf-cell:hover {
          border-color: rgba(193, 232, 89, 0.4);
          transform: translateY(-2px);
        }
        .uf-cell:hover::before {
          opacity: 1;
        }
        .uf-cell .uf-head {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .uf-cell .uf-head svg {
          flex: none;
          display: block;
        }
        .uf-cell .uf-kind {
          font-family: var(--font-mono-v2), ui-monospace, monospace;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${LIVE};
        }
        .uf-cell h4 {
          font-family: var(--font-archivo), sans-serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 1.85vw, 1.65rem);
          letter-spacing: -0.014em;
          color: ${IVORY};
          margin: 0;
          line-height: 1.1;
          position: relative;
          z-index: 1;
        }
        .uf-cell p {
          color: ${MUTED};
          font-size: 0.95rem;
          line-height: 1.55;
          margin: 0;
          max-width: 34ch;
          position: relative;
          z-index: 1;
        }
        .uf-cell .uf-artifact {
          margin-top: auto;
          padding: 0.7rem 0.85rem;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid ${HAIRLINE};
          border-radius: 6px;
          font-family: var(--font-mono-v2), ui-monospace, "SF Mono", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.01em;
          color: ${IVORY};
          position: relative;
          z-index: 1;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};

function PhaseCell({ phase, index }: { phase: Phase; index: number }): JSX.Element {
  return (
    <article className="uf-cell" data-index={index}>
      <div className="uf-head">
        <PhaseIcon kind={phase.kind} />
        <span className="uf-kind">{phase.kind}</span>
      </div>

      <h4>{phase.title}</h4>

      <p>{phase.desc}</p>

      <code className="uf-artifact">{phase.artifact}</code>
    </article>
  );
}

/**
 * Per-phase line-art SVG. Drawn marks (not icon-library glyphs) so each one
 * means its phase: pulse for Trigger, key-with-brackets for Permission,
 * hex-seal-with-check for Settle, etc. Ivory primary, lime accent.
 */
function PhaseIcon({ kind }: { kind: string }): JSX.Element {
  const common = {
    width: 60,
    height: 60,
    viewBox: "0 0 48 48",
    fill: "none" as const,
    stroke: IVORY,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "Trigger":
      // Concentric pulse arcs emanating from a lime center — the webhook ping.
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="24" cy="24" r="2.5" fill={LIVE} stroke="none" />
          <path d="M16 24 a8 8 0 0 1 16 0" stroke={LIVE} />
          <path d="M11 24 a13 13 0 0 1 26 0" />
          <path d="M6 24 a18 18 0 0 1 36 0" opacity="0.45" />
        </svg>
      );

    case "Permission":
      // Key bounded by two brackets — "a key with a leash".
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 12 L4 12 L4 36 L8 36" stroke={LIVE} />
          <path d="M40 12 L44 12 L44 36 L40 36" stroke={LIVE} />
          <circle cx="18" cy="24" r="6" />
          <path d="M24 24 L36 24 M32 24 L32 29 M28 24 L28 27" />
        </svg>
      );

    case "Settle":
      // Hexagonal seal with a check — the verified on-chain settlement.
      return (
        <svg {...common} aria-hidden="true">
          <path d="M24 4 L41 14 L41 34 L24 44 L7 34 L7 14 Z" />
          <path d="M16 24 L22 30 L33 18" stroke={LIVE} strokeWidth={2} />
        </svg>
      );

    case "Setup":
      // Vault rectangle with a lime policy dot inside + 3 ticks above (caps).
      return (
        <svg {...common} aria-hidden="true">
          <rect x="6" y="16" width="36" height="26" rx="2" />
          <circle cx="24" cy="29" r="3" stroke={LIVE} />
          <path d="M14 10 L14 16 M24 6 L24 16 M34 10 L34 16" stroke={LIVE} />
        </svg>
      );

    case "Delegate":
      // Scoped handoff: bracket -> arrow -> bracket; clock dot below indicates ttl.
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 14 L4 14 L4 32 L10 32" />
          <path d="M38 14 L44 14 L44 32 L38 32" />
          <path d="M14 23 L32 23 M28 19 L32 23 L28 27" stroke={LIVE} strokeWidth={2} />
          <circle cx="24" cy="40" r="3" stroke={LIVE} />
          <path d="M24 38 L24 40 L26 40" stroke={LIVE} />
        </svg>
      );

    case "Spend":
      // Receipt with a torn edge + lime check stamp at the bottom.
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 4 L38 4 L38 38 L34 42 L30 38 L26 42 L22 38 L18 42 L14 38 L10 42 Z" />
          <path d="M16 14 L32 14 M16 20 L28 20" />
          <path d="M18 30 L22 34 L32 22" stroke={LIVE} strokeWidth={2} />
        </svg>
      );

    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="24" cy="24" r="6" stroke={LIVE} />
        </svg>
      );
  }
}
