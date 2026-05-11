"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const PROGRAM_ID = "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy";
const DEMO_ROOT_PDA = "4BH2MJwZ5oHSY3u4eEGNuVXCdK3zWMa1YBXWxCEqGdAn";
const RESEARCH_PDA = "AyJCgX1bA7SECij2LdVZLRyeBMiKL71kEUsjFSDiiMvZ";
const EXECUTE_PDA = "2KuKNXJtuGeESNeZLyb5YGZUrpsja824m62Kf9E67XMJ";
const AUDIT_PDA = "8BHTWBRnz8n7dwiuXue4YonAu7nC1xrg7tMrds2wEUGN";
const EXPLORER = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;

function useManifestoBodyClass() {
  useEffect(() => {
    document.body.classList.add("fuin-manifesto");
    document.body.classList.remove("v2");
    return () => {
      document.body.classList.remove("fuin-manifesto");
    };
  }, []);
}

/* ── Header strip ──────────────────────────────────────────────────────── */
function HeaderStrip() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--rule-paper)",
        background: "var(--paper)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "1.15rem",
            color: "var(--ink-black)",
            letterSpacing: "0.01em",
          }}
        >
          Fuin
        </Link>
        <Link
          href={`/audit/${DEMO_ROOT_PDA}`}
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.78rem",
            background: "var(--ink-black)",
            color: "var(--paper)",
            padding: "8px 14px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Open audit →
        </Link>
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
function PanelOne() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 36px)", maxWidth: "20ch" }}>
      <h1
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(3rem, 8vw, 9rem)",
          lineHeight: 0.88,
          letterSpacing: "-0.035em",
          fontWeight: 500,
          color: "var(--ink-black)",
          margin: 0,
        }}
      >
        We built the{" "}
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>proof layer</span>{" "}
        for autonomous capital.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(1.05rem, 1.3vw, 1.35rem)",
          lineHeight: 1.5,
          color: "var(--ink-soft)",
          maxWidth: "52ch",
          margin: 0,
        }}
      >
        Hierarchical proof-of-intent for AI agent swarms. Live on Solana.
      </p>
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
          fontSize: "clamp(3rem, 7.5vw, 8.5rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.035em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "16ch",
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
function PanelFour() {
  const rows: { indent: number; label: string; budget: string; scope: string; status: "ok" | "denied" }[] = [
    { indent: 0, label: "root · orchestrator", budget: "500 USDC", scope: "Jupiter · 24h", status: "ok" },
    { indent: 1, label: "research", budget: "50 USDC", scope: "read-only", status: "ok" },
    { indent: 1, label: "execute", budget: "400 USDC", scope: "jupiter", status: "ok" },
    { indent: 1, label: "audit", budget: "50 USDC", scope: "read-only", status: "ok" },
    { indent: 1, label: "rogue", budget: "—", scope: "raydium", status: "denied" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 4vh, 48px)" }}>
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
        <span style={{ fontStyle: "italic", color: "var(--crimson)" }}>$500 of budget.</span>
      </h2>

      <div
        style={{
          fontFamily: "var(--font-mono-v2), monospace",
          fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
          lineHeight: 1.85,
          color: "var(--ink-black)",
          borderLeft: "1px solid var(--ink-mute)",
          paddingLeft: "20px",
          maxWidth: "60ch",
        }}
      >
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              paddingLeft: `${r.indent * 20}px`,
              opacity: r.status === "denied" ? 0.55 : 1,
              color: r.status === "denied" ? "var(--crimson)" : "var(--ink-black)",
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: "12px",
              alignItems: "baseline",
              textDecoration: r.status === "denied" ? "line-through" : "none",
            }}
          >
            <span>{r.indent > 0 ? "└ " : ""}{r.label}</span>
            <span style={{ color: "var(--ink-mute)" }}>{r.scope}</span>
            <span style={{ color: r.status === "denied" ? "var(--crimson)" : "var(--ink-soft)" }}>
              {r.budget} {r.status === "ok" ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
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
          fontSize: "clamp(3rem, 8vw, 9rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.035em",
          fontWeight: 500,
          color: "var(--ink-black)",
          maxWidth: "12ch",
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
            <span style={{ color: "var(--ink-black)" }}>{short(r.pda)}</span>
            <span style={{ color: "var(--crimson)" }}>↗</span>
          </a>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "clamp(16px, 3vh, 32px)" }}>
        <Link
          href={`/audit/${DEMO_ROOT_PDA}`}
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.85rem",
            background: "var(--ink-black)",
            color: "var(--paper)",
            padding: "14px 22px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          Open the audit tree →
        </Link>
        <a
          href="https://github.com/Fuin-Labs/Fuin"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.85rem",
            color: "var(--ink-black)",
            border: "1px solid var(--ink-black)",
            padding: "13px 22px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          Read the SDK →
        </a>
      </div>
    </div>
  );
}

/* ── Section indicator (filled in Task 8) ──────────────────────────────── */
const PANELS: { id: string; num: string }[] = [
  { id: "one", num: "ONE" },
  { id: "two", num: "TWO" },
  { id: "three", num: "THREE" },
  { id: "four", num: "FOUR" },
  { id: "five", num: "FIVE" },
];

function SectionIndicator() {
  const [active, setActive] = useState<string>("one");

  useEffect(() => {
    const els = PANELS.map((p) => document.getElementById(p.id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="manifesto sections"
      style={{
        position: "fixed",
        right: "32px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "none",
        flexDirection: "column",
        gap: "20px",
        zIndex: 20,
      }}
      className="section-indicator"
    >
      {PANELS.map((p) => (
        <a
          key={p.id}
          href={`#${p.id}`}
          aria-current={active === p.id ? "true" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontFamily: "var(--font-mono-v2), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: active === p.id ? "var(--crimson)" : "var(--ink-mute)",
            transition: "color 0.3s",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              background: active === p.id ? "var(--crimson)" : "transparent",
              border: `1px solid ${active === p.id ? "var(--crimson)" : "var(--ink-mute)"}`,
              transition: "background 0.3s, border-color 0.3s",
            }}
          />
          <span style={{ opacity: active === p.id ? 1 : 0, transition: "opacity 0.3s" }}>
            {p.num}
          </span>
        </a>
      ))}
    </nav>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function Home(): React.JSX.Element {
  useManifestoBodyClass();
  return (
    <main style={{ background: "var(--paper)", minHeight: "100vh", position: "relative" }}>
      <HeaderStrip />
      <SectionIndicator />
      <Panel id="one" num="ONE" eyebrow="A note from the founder" footer="Fuin · live on devnet · scroll ↓">
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
      <Panel id="five" num="FIVE" eyebrow="Don't take our word" footer="apache-2.0 · built by fuin labs · solana foundation grant">
        <PanelFive />
      </Panel>
    </main>
  );
}
