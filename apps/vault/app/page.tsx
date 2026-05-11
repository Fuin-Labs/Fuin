"use client";

import React from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { LenisProvider } from "./components/LenisProvider";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import {
  TerminalAnimationBlinkingCursor,
  TerminalAnimationCommandBar,
  TerminalAnimationContainer,
  TerminalAnimationContent,
  TerminalAnimationOutput,
  TerminalAnimationRoot,
  TerminalAnimationTabList,
  TerminalAnimationTabTrigger,
  TerminalAnimationTrailingPrompt,
  TerminalAnimationWindow,
  type TabContent,
  type TerminalLine,
} from "./components/ui/terminal-animation";

const TERM_OK = "text-[#7fe5b9]";
const TERM_BAD = "text-[#e08a72]";
const TERM_DIM = "text-neutral-500";
const TERM_MID = "text-neutral-300";
const TERM_HIGHLIGHT = "text-[#e9d6a8]";

const SWARM_TABS: TabContent[] = [
  {
    label: "sign",
    command: "fuin sign-root --budget 400 --dex jupiter --hours 24",
    lines: [
      { text: "", delay: 80 },
      { text: "  authorizing root intent ...", color: TERM_DIM, delay: 350 },
      { text: "  ✓ root intent landed on devnet", color: TERM_OK, delay: 300 },
      { text: "", delay: 60 },
      { text: "    pda      4BH2…GdAn", color: TERM_MID, delay: 120 },
      { text: "    budget   400 USDC", color: TERM_HIGHLIGHT, delay: 120 },
      { text: "    scope    jupiter aggregator only", color: TERM_MID, delay: 120 },
      { text: "    expires  in 24h", color: TERM_MID, delay: 120 },
      { text: "", delay: 80 },
      { text: "  signed by you · cost 0.000005 SOL", color: TERM_DIM, delay: 200 },
    ],
  },
  {
    label: "spawn",
    command: "fuin derive-children --parent 4BH2…GdAn",
    lines: [
      { text: "", delay: 80 },
      { text: "  deriving sub-intents ...", color: TERM_DIM, delay: 280 },
      { text: "", delay: 60 },
      { text: "  ✓ research agent   read-only            AyJC…iMvZ", color: TERM_OK, delay: 200 },
      { text: "  ✓ execute agent    jupiter, 400 USDC    2KuK…7XMJ", color: TERM_OK, delay: 200 },
      { text: "  ✓ audit agent      read-only            8BHT…EUGN", color: TERM_OK, delay: 200 },
      { text: "", delay: 80 },
      { text: "  3 sub-intents derived · every scope strictly narrower", color: TERM_MID, delay: 220 },
      { text: "  ancestor-walk verified in 421ms", color: TERM_DIM, delay: 200 },
    ],
  },
  {
    label: "rogue",
    command: "fuin attempt-rogue --dex raydium --from execute",
    lines: [
      { text: "", delay: 80 },
      { text: "  rogue agent: attempting transfer via raydium ...", color: TERM_DIM, delay: 400 },
      { text: "", delay: 80 },
      { text: "  ✗ DENIED · scope violation", color: TERM_BAD, delay: 350 },
      { text: "", delay: 80 },
      { text: "    parent     4BH2…GdAn", color: TERM_MID, delay: 120 },
      { text: "    authorized jupiter only", color: TERM_MID, delay: 120 },
      { text: "    rogue tx   tried raydium", color: TERM_BAD, delay: 150 },
      { text: "", delay: 80 },
      { text: "  chain refused the instruction before it landed", color: TERM_BAD, delay: 220 },
      { text: "  ancestor-walk: 2ms", color: TERM_DIM, delay: 180 },
    ],
  },
];

const PROGRAM_ID = "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy";
const DEMO_ROOT_PDA = "4BH2MJwZ5oHSY3u4eEGNuVXCdK3zWMa1YBXWxCEqGdAn";
const RESEARCH_PDA = "AyJCgX1bA7SECij2LdVZLRyeBMiKL71kEUsjFSDiiMvZ";
const EXECUTE_PDA = "2KuKNXJtuGeESNeZLyb5YGZUrpsja824m62Kf9E67XMJ";
const AUDIT_PDA = "8BHTWBRnz8n7dwiuXue4YonAu7nC1xrg7tMrds2wEUGN";
const EXPLORER = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;

/* ── Masthead ──────────────────────────────────────────────────────────── */
function Masthead() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in oklch, var(--paper) 94%, transparent)",
        backdropFilter: "blur(10px) saturate(140%)",
        WebkitBackdropFilter: "blur(10px) saturate(140%)",
        borderBottom: "1px solid var(--ink-black)",
      }}
    >
      {/* Hairline rule above the bar — a publication nameplate ornament */}
      <div
        style={{
          height: "1px",
          background: "var(--ink-black)",
          opacity: 0.35,
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      />
      <div
        className="masthead-grid"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 24px",
          height: "76px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Wordmark — serif logotype with a small crimson colophon mark */}
        <Link
          href="/"
          aria-label="Fuin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--ink-black)",
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "10px",
              height: "10px",
              background: "var(--crimson)",
              transform: "rotate(45deg)",
              transformOrigin: "center",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: 500,
              letterSpacing: "-0.014em",
              lineHeight: 1,
            }}
          >
            Fuin
          </span>
        </Link>

        {/* Status + nav entries */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span
            className="masthead-status-text"
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "999px",
                background: "var(--crimson)",
                animation: "fuin-pulse 2.4s ease-in-out infinite",
              }}
            />
            devnet · live
          </span>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--ink-black)",
              borderBottom: "1px solid var(--ink-black)",
              paddingBottom: "3px",
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--crimson)";
              e.currentTarget.style.borderColor = "var(--crimson)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ink-black)";
              e.currentTarget.style.borderColor = "var(--ink-black)";
            }}
          >
            Dashboard
          </Link>
          <Link
            href={`/audit/${DEMO_ROOT_PDA}`}
            style={{
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--prussian)",
              borderBottom: "1px solid var(--prussian)",
              paddingBottom: "3px",
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ink-black)";
              e.currentTarget.style.borderColor = "var(--ink-black)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--prussian)";
              e.currentTarget.style.borderColor = "var(--prussian)";
            }}
          >
            Open audit ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── Panel wrapper ─────────────────────────────────────────────────────── */
type PanelProps = {
  id: string;
  num: string;
  eyebrow: string;
  footer: string;
  children: React.ReactNode;
};

function Panel({ id, num, eyebrow, footer, children }: PanelProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section
      id={id}
      ref={ref}
      data-panel={num}
      style={{
        minHeight: "100vh",
        scrollSnapAlign: "start",
        padding: "clamp(48px, 9vh, 96px) 24px clamp(32px, 7vh, 72px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "clamp(40px, 8vh, 80px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--crimson)",
          }}
        >
          § {num} · {eyebrow}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1 }}
        >
          {children}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            borderTop: "1px solid var(--rule-paper)",
            paddingTop: "16px",
          }}
        >
          {footer}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Panel content (Group 2) ───────────────────────────────────────────── */
type LedgerRow = {
  key: string;
  kind: "root" | "child";
  label: string;
  desc: string;
  pda: string | null;
  budget: string;
  denied?: boolean;
};

const LEDGER_ROWS: LedgerRow[] = [
  {
    key: "root",
    kind: "root",
    label: "Root intent",
    desc: "Authorize Jupiter swaps, up to $400, for the next 24 hours.",
    pda: DEMO_ROOT_PDA,
    budget: "$400",
  },
  {
    key: "research",
    kind: "child",
    label: "Research agent",
    desc: "Reads market prices. Cannot move funds.",
    pda: RESEARCH_PDA,
    budget: "no spend",
  },
  {
    key: "execute",
    kind: "child",
    label: "Execute agent",
    desc: "Swaps on Jupiter. Up to the root cap.",
    pda: EXECUTE_PDA,
    budget: "$400",
  },
  {
    key: "audit",
    kind: "child",
    label: "Audit agent",
    desc: "Verifies every action. Cannot move funds.",
    pda: AUDIT_PDA,
    budget: "no spend",
  },
  {
    key: "rogue",
    kind: "child",
    label: "Rogue agent",
    desc: "Tried Raydium — outside what you authorized.",
    pda: null,
    budget: "blocked",
    denied: true,
  },
];

const STAGGER = 0.14;
const DELAY_CHILDREN = 0.35;
const ROGUE_STRIKE_DELAY =
  DELAY_CHILDREN + LEDGER_ROWS.length * STAGGER + 0.5;

function IntentLedger() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const short = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;
  const lastIdx = LEDGER_ROWS.length - 1;

  return (
    <motion.aside
      ref={ref}
      className="intent-ledger"
      aria-label="Live intent tree on Solana devnet"
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: STAGGER, delayChildren: DELAY_CHILDREN } },
      }}
      style={{
        position: "relative",
        padding: "22px 22px 16px",
        background: "color-mix(in oklch, var(--paper-rise) 65%, var(--paper))",
        border: "1px solid var(--ink-black)",
        color: "var(--ink-black)",
        maxWidth: "44ch",
      }}
    >
      {/* Header */}
      <motion.header
        variants={{
          hidden: { opacity: 0, y: -6 },
          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--ink-black)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "1.15rem",
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Live intent tree
        </h3>
        <span
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: "var(--crimson)",
              animation: "fuin-pulse 2.4s ease-in-out infinite",
            }}
          />
          devnet
        </span>
      </motion.header>

      {/* Caption */}
      <motion.p
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.6 } },
        }}
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.95rem",
          color: "var(--ink-mute)",
          margin: "14px 0 14px",
          lineHeight: 1.4,
        }}
      >
        One signature. Three derived scopes. One rogue rejected.
      </motion.p>

      {/* Tree */}
      <div>
        {LEDGER_ROWS.map((r, i) => {
          const isLast = i === lastIdx;
          const isRoot = r.kind === "root";

          return (
            <motion.div
              key={r.key}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              style={{
                position: "relative",
                paddingLeft: "36px",
                paddingTop: "14px",
                paddingBottom: "14px",
                minHeight: "74px",
              }}
            >
              {/* Connector — diamond for root, L-shape for children */}
              {isRoot ? (
                <>
                  {/* Crimson rotated square as root marker */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 9,
                      top: 22,
                      width: 11,
                      height: 11,
                      background: "var(--crimson)",
                      transform: "rotate(45deg)",
                    }}
                  />
                  {/* Vertical spine descending below the diamond */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 36,
                      bottom: 0,
                      width: 1,
                      background: "var(--ink-black)",
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Vertical: full-height for middle children, top-to-middle for last */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 0,
                      height: isLast ? "50%" : "100%",
                      width: 1,
                      background: "var(--ink-black)",
                    }}
                  />
                  {/* Horizontal tick from spine to row content */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      width: 17,
                      height: 1,
                      background: "var(--ink-black)",
                    }}
                  />
                </>
              )}

              {/* Row content */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                  marginBottom: "5px",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    fontFamily: "var(--font-mono-v2), monospace",
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    fontWeight: 600,
                    color: r.denied ? "var(--crimson)" : "var(--ink-black)",
                    display: "inline-block",
                  }}
                >
                  {r.label}
                  {r.denied && (
                    <motion.span
                      aria-hidden
                      initial={{ scaleX: 0 }}
                      animate={inView ? { scaleX: 1 } : {}}
                      transition={{
                        duration: 0.55,
                        delay: ROGUE_STRIKE_DELAY,
                        ease: [0.65, 0, 0.35, 1],
                      }}
                      style={{
                        position: "absolute",
                        left: -2,
                        right: -2,
                        top: "calc(50% - 1px)",
                        height: "1.5px",
                        background: "var(--crimson)",
                        transformOrigin: "left",
                      }}
                    />
                  )}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono-v2), monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                    fontWeight: isRoot || r.denied ? 600 : 500,
                    color: r.denied ? "var(--crimson)" : "var(--ink-black)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.denied && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: ROGUE_STRIKE_DELAY + 0.45,
                      }}
                      style={{ marginRight: 4 }}
                    >
                      ✗
                    </motion.span>
                  )}
                  {r.budget}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "0.94rem",
                  lineHeight: 1.4,
                  color: r.denied ? "var(--crimson)" : "var(--ink-soft)",
                  margin: "0 0 4px 0",
                  fontStyle: r.denied ? "italic" : "normal",
                }}
              >
                {r.desc}
              </p>
              {r.pda && (
                <span
                  style={{
                    fontFamily: "var(--font-mono-v2), monospace",
                    fontSize: "0.66rem",
                    letterSpacing: "0.04em",
                    color: "var(--prussian)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{short(r.pda)}</span>
                  {isRoot && (
                    <span style={{ color: "var(--prussian)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span aria-hidden style={{ fontSize: "0.7rem", lineHeight: 1 }}>✓</span>
                      <span>signed by you</span>
                    </span>
                  )}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.footer
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.5 } },
        }}
        style={{
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid var(--ink-black)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono-v2), monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
        }}
      >
        <span>verified · solana devnet</span>
        <span>1 sig · 4 PDAs</span>
      </motion.footer>
    </motion.aside>
  );
}

function PanelOne() {
  return (
    <div className="manifesto-hero">
      {/* Left column — editorial copy */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 3.5vh, 40px)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(2.7rem, 6.8vw, 7.25rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.034em",
            fontWeight: 500,
            color: "var(--ink-black)",
            margin: 0,
            maxWidth: "16ch",
          }}
        >
          We built the{" "}
          <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>proof layer</span>{" "}
          for autonomous capital.
        </h1>

        <p
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(1.1rem, 1.35vw, 1.4rem)",
            lineHeight: 1.5,
            color: "var(--ink-soft)",
            maxWidth: "44ch",
            margin: 0,
          }}
        >
          Hierarchical proof-of-intent for AI agent swarms. One human signature
          anchors a tree of cryptographically-derived scopes — every child
          strictly narrower than its parent. The chain is the boundary.
        </p>

        {/* CTA — one primary action, editorial restraint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(20px, 2.4vw, 32px)",
            flexWrap: "wrap",
            marginTop: "clamp(4px, 1vh, 12px)",
          }}
        >
          <Link href="/dashboard" aria-label="Open the Fuin guardian dashboard">
            <Button size="lg" variant="crimson">
              Open the dashboard →
            </Button>
          </Link>
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(0.92rem, 1vw, 1.04rem)",
              color: "var(--ink-mute)",
              maxWidth: "32ch",
              lineHeight: 1.4,
            }}
          >
            Connect a devnet wallet, sign one intent, watch the tree settle on-chain.
          </span>
        </div>
      </div>

      {/* Right column — the protocol made visible */}
      <IntentLedger />
    </div>
  );
}
function PanelTwo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 36px)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(2.5rem, 6.5vw, 7rem)",
          lineHeight: 0.92,
          letterSpacing: "-0.03em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "22ch",
          margin: 0,
        }}
      >
        Every agent today is either{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>a custody risk</span>
        , or a private key in a{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>dotenv</span>.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)",
          lineHeight: 1.55,
          color: "var(--ink-soft)",
          maxWidth: "54ch",
          margin: 0,
        }}
      >
        We chose neither. Custodians hold your keys; you hold the trust deficit.
        Self-custody with raw keys; you hold the catastrophe. There was no third
        option. So we built it.
      </p>
    </div>
  );
}
function PanelThree() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 36px)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "20ch",
          margin: 0,
        }}
      >
        Authority is{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>hereditary.</span>{" "}
        Permission is not.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)",
          lineHeight: 1.55,
          color: "var(--ink-soft)",
          maxWidth: "58ch",
          margin: 0,
        }}
      >
        One human signature anchors a root intent. Every sub-agent derives a
        child with strictly narrower scope and budget. The chain is the boundary
        — when an agent steps outside what you signed, the math denies it. No
        middleware. No CPI. Sibling-instruction verification, atomic at the
        transaction level.
      </p>
    </div>
  );
}
function SwarmTerminal() {
  return (
    <TerminalAnimationRoot
      alwaysDark
      tabs={SWARM_TABS}
      defaultActiveTab={0}
      hideCursorOnComplete={false}
      className="relative w-full"
    >
      <TerminalAnimationContainer className="max-w-full px-0 pt-0">
        <TerminalAnimationWindow
          backgroundColor="oklch(0.14 0.012 270)"
          minHeight="26rem"
          animateOnVisible={true}
          className="rounded-md border border-neutral-800 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)]"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80 bg-[oklch(0.18_0.012_270)]">
            <div className="flex items-center gap-2">
              <span aria-hidden className="block h-2.5 w-2.5 rounded-full bg-[#e08a72]" />
              <span aria-hidden className="block h-2.5 w-2.5 rounded-full bg-[#e9d6a8]" />
              <span aria-hidden className="block h-2.5 w-2.5 rounded-full bg-[#7fe5b9]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              devnet · fuin v2
            </span>
            <span className="w-12" aria-hidden />
          </div>

          <TerminalAnimationContent className="min-h-[20rem]">
            <div className="flex items-center gap-2 leading-relaxed">
              <span className="select-none font-mono text-neutral-500 text-sm">$</span>
              <TerminalAnimationCommandBar
                className="font-mono text-neutral-100 text-sm"
                cursor={<TerminalAnimationBlinkingCursor />}
              />
            </div>

            <TerminalAnimationOutput
              className="mt-2"
              renderLine={(line: TerminalLine, _i: number, visible: boolean) => {
                if (!visible) return null;
                return (
                  <div className="leading-relaxed">
                    <span className={cn("font-mono text-sm whitespace-pre", line.color ?? "text-neutral-300")}>
                      {line.text || " "}
                    </span>
                  </div>
                );
              }}
            />

            <TerminalAnimationTrailingPrompt className="mt-2 flex items-center gap-2 leading-relaxed">
              <span className="select-none font-mono text-neutral-500 text-sm">$</span>
              <TerminalAnimationBlinkingCursor />
            </TerminalAnimationTrailingPrompt>
          </TerminalAnimationContent>

          {/* Tab bar at the bottom */}
          <div className="flex justify-start border-t border-neutral-800/80 px-4 py-3">
            <TerminalAnimationTabList className="inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-[oklch(0.18_0.012_270)] px-1 py-1">
              {SWARM_TABS.map((tab, i) => (
                <TerminalAnimationTabTrigger
                  key={tab.label}
                  index={i}
                  className="cursor-pointer rounded px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-neutral-300"
                >
                  {tab.label}
                </TerminalAnimationTabTrigger>
              ))}
            </TerminalAnimationTabList>
          </div>
        </TerminalAnimationWindow>
      </TerminalAnimationContainer>
    </TerminalAnimationRoot>
  );
}

function PanelFour() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 4vh, 56px)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(2.4rem, 6vw, 6.5rem)",
          lineHeight: 0.92,
          letterSpacing: "-0.03em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "20ch",
          margin: 0,
        }}
      >
        One signature. Five agents. Twenty-four hours.{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>$400 of budget.</span>
      </h2>

      <p
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
          color: "var(--ink-mute)",
          maxWidth: "52ch",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        The real swarm-demo CLI, recorded against devnet. Click any tab.
      </p>

      <SwarmTerminal />
    </div>
  );
}
function PanelFive() {
  const receipts: { label: string; pda: string }[] = [
    { label: "PROGRAM", pda: PROGRAM_ID },
    { label: "ROOT", pda: DEMO_ROOT_PDA },
    { label: "RESEARCH", pda: RESEARCH_PDA },
    { label: "EXECUTE", pda: EXECUTE_PDA },
    { label: "AUDIT", pda: AUDIT_PDA },
  ];
  const short = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 4vh, 52px)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "16ch",
          margin: 0,
        }}
      >
        Walk the chain{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>yourself.</span>
      </h2>

      <div style={{ maxWidth: "62ch" }}>
        {receipts.map((r) => (
          <a
            key={r.label}
            href={EXPLORER(r.pda)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr auto",
              alignItems: "baseline",
              gap: "16px",
              padding: "14px 0",
              borderBottom: "1px solid var(--rule-paper)",
              fontFamily: "var(--font-mono-v2), monospace",
              fontSize: "0.9rem",
              color: "var(--ink-black)",
              textDecoration: "none",
            }}
            className="receipt-row"
          >
            <span style={{ color: "var(--ink-mute)", fontSize: "0.72rem", letterSpacing: "0.16em" }}>
              {r.label}
            </span>
            <span style={{ color: "var(--prussian)" }}>{short(r.pda)}</span>
            <span style={{ color: "var(--prussian)" }}>↗</span>
          </a>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "clamp(16px, 3vh, 32px)" }}>
        <Link href={`/audit/${DEMO_ROOT_PDA}`}>
          <Button size="lg" variant="default">
            Open the audit tree →
          </Button>
        </Link>
        <a href="https://github.com/Fuin-Labs/Fuin" target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline">
            Read the SDK →
          </Button>
        </a>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function Home(): React.JSX.Element {
  return (
    <LenisProvider>
    <main style={{ background: "var(--paper)", minHeight: "100vh", position: "relative" }}>
      <Masthead />
      <Panel id="one" num="ONE" eyebrow="The thesis" footer="Fuin · live on devnet · scroll ↓">
        <PanelOne />
      </Panel>
      <Panel id="two" num="TWO" eyebrow="The problem" footer="§ third option ↓">
        <PanelTwo />
      </Panel>
      <Panel id="three" num="THREE" eyebrow="The primitive" footer="§ show me ↓">
        <PanelThree />
      </Panel>
      <Panel id="four" num="FOUR" eyebrow="A real swarm" footer="§ the boundary held ↓">
        <PanelFour />
      </Panel>
      <Panel id="five" num="FIVE" eyebrow="Don't take our word" footer="apache-2.0 · built by fuin labs">
        <PanelFive />
      </Panel>
    </main>
    </LenisProvider>
  );
}
