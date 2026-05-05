"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

const PROGRAM_ID = "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy";
const DEMO_ROOT_PDA = "4BH2MJwZ5oHSY3u4eEGNuVXCdK3zWMa1YBXWxCEqGdAn";
const EXPLORER = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;

function useV2BodyClass() {
  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="t-eyebrow">{children}</span>;
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono" style={{ color: "var(--cream-soft)" }}>
      {children}
    </span>
  );
}

function HairlineRow() {
  return <div className="rule-h" />;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "color-mix(in oklch, var(--ink) 88%, transparent)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3">
          <span
            className="font-display text-[1.15rem]"
            style={{ letterSpacing: "0.02em", color: "var(--cream)" }}
          >
            Fuin
          </span>
          <span className="t-eyebrow" style={{ fontSize: "0.7rem" }}>
            v2 · swarm
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#shape"
            className="hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: "var(--cream-soft)" }}
          >
            Shape
          </a>
          <a
            href="#boundary"
            className="hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: "var(--cream-soft)" }}
          >
            Boundary
          </a>
          <a
            href="#sdk"
            className="hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: "var(--cream-soft)" }}
          >
            SDK
          </a>
          <a
            href="#evidence"
            className="hover:opacity-100 opacity-70 transition-opacity"
            style={{ color: "var(--cream-soft)" }}
          >
            Evidence
          </a>
          <Link
            href={`/audit/${DEMO_ROOT_PDA}`}
            className="px-3 py-1.5 text-[0.85rem] font-mono"
            style={{
              color: "var(--ink)",
              background: "var(--ledger)",
              borderRadius: "2px",
              letterSpacing: "0.04em",
            }}
          >
            Open audit →
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 pt-24 lg:pt-32 pb-20 lg:pb-28">
        <div className="v2-rise" style={{ marginBottom: "var(--s-7)" }}>
          <Eyebrow>Fuin v2 · swarm-first agent infrastructure</Eyebrow>
        </div>

        <h1
          className="t-h1 v2-rise-delayed"
          style={{ color: "var(--cream)", maxWidth: "20ch" }}
        >
          The open trust layer
          <br />
          for AI agent swarms{" "}
          <span style={{ fontStyle: "italic", color: "var(--ledger)" }}>
            on Solana
          </span>
          .
        </h1>

        <p
          className="t-body v2-rise-late"
          style={{ marginTop: "var(--s-7)", maxWidth: "62ch" }}
        >
          One human signature authorizes a hierarchical tree of agents. Every
          action attributable. Every scope cryptographically derived from the
          root. When an agent steps outside what you signed, the math denies it
          — without a custodian, without a middleware, without a per-card
          ledger to audit.
        </p>

        <div
          className="v2-rise-late flex flex-wrap items-center gap-x-8 gap-y-4"
          style={{ marginTop: "var(--s-8)" }}
        >
          <Link
            href={`/audit/${DEMO_ROOT_PDA}`}
            className="font-mono text-[0.95rem] inline-flex items-center gap-2 px-5 py-3"
            style={{
              color: "var(--ink)",
              background: "var(--ledger)",
              borderRadius: "2px",
              letterSpacing: "0.03em",
            }}
          >
            Read the live audit tree
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#shape"
            className="font-mono text-[0.9rem] inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
            style={{
              color: "var(--cream)",
              borderBottom: "1px solid var(--rule)",
              paddingBottom: "2px",
            }}
          >
            See how the shape works
          </a>
        </div>

        <div
          className="v2-rise-late grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          style={{ borderTop: "1px solid var(--rule-soft)", paddingTop: "var(--s-7)" }}
        >
          <Stat
            value="1 sig"
            label="root authorization · all leaves derive from it"
          />
          <Stat
            value="0 CPI"
            label="sibling-instruction verifier · zero integration burden"
          />
          <Stat
            value="∞ depth"
            label="agent hierarchies bounded only by parent scope"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="font-display"
        style={{
          fontSize: "clamp(1.6rem, 2.2vw, 2.1rem)",
          color: "var(--ledger)",
          lineHeight: 1,
          marginBottom: "var(--s-3)",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
      <div className="t-small" style={{ maxWidth: "32ch" }}>
        {label}
      </div>
    </div>
  );
}

/* ── The Shape (anatomy of an intent tree) ──────────────────────────────── */
function Shape() {
  return (
    <section
      id="shape"
      className="relative"
      style={{ background: "var(--ink-deep)", borderTop: "1px solid var(--rule-soft)" }}
    >
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow>§ 01 · the shape</Eyebrow>
            <h2 className="t-h2 mt-6" style={{ color: "var(--cream)" }}>
              An intent is a tree.
            </h2>
            <p className="t-body" style={{ marginTop: "var(--s-5)" }}>
              The user signs once at the root. Every child intent is derived
              under it, with a budget and scope strictly bounded by what the
              parent permits. Action verification walks the chain. The whole
              swarm operates inside the cone of authority that began with one
              human signature.
            </p>
          </div>

          <div className="lg:col-span-8">
            <IntentTreeFigure />
          </div>
        </div>
      </div>
    </section>
  );
}

/* The figure: a hand-laid SVG-ish diagram in CSS — root + 3 children + boundary attempt */
function IntentTreeFigure() {
  return (
    <figure
      className="relative"
      style={{
        background: "var(--ink-rise)",
        border: "1px solid var(--rule-soft)",
        padding: "var(--s-7)",
      }}
    >
      <div className="t-eyebrow mb-6" style={{ color: "var(--mute)" }}>
        figure 01 · live tree, autonomous trading desk
      </div>

      <svg
        viewBox="0 0 720 420"
        className="w-full h-auto"
        role="img"
        aria-label="Hierarchical intent tree with one root, three live children, and one boundary-rejected attempt"
      >
        <defs>
          <pattern
            id="dot"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.6" fill="oklch(0.30 0.014 230)" />
          </pattern>
        </defs>

        {/* Connectors */}
        <g stroke="oklch(0.30 0.014 230)" strokeWidth="1" fill="none">
          <path d="M 360 100 L 360 160" />
          <path d="M 200 220 L 200 200 L 360 200 L 360 160" />
          <path d="M 360 220 L 360 200" />
          <path d="M 520 220 L 520 200 L 360 200" />
          <path d="M 600 220 L 600 200 L 360 200" strokeDasharray="4 5" />
        </g>

        {/* Root */}
        <TreeNode
          x={250}
          y={20}
          w={220}
          h={80}
          label="root intent"
          agent="orchestrator"
          scope="DEX = Jupiter · 24h window"
          budget="500 USDC"
          tone="root"
        />

        {/* 3 children + 1 rejected */}
        <TreeNode
          x={90}
          y={220}
          w={220}
          h={80}
          label="child · research"
          agent="research-agent"
          scope="read-only"
          budget="50 / 50 USDC"
          tone="ok"
        />
        <TreeNode
          x={250}
          y={220}
          w={220}
          h={80}
          label="child · execute"
          agent="execute-agent"
          scope="DEX = Jupiter"
          budget="400 / 400 USDC"
          tone="ok"
        />
        <TreeNode
          x={410}
          y={220}
          w={220}
          h={80}
          label="child · audit"
          agent="audit-agent"
          scope="read-only"
          budget="50 / 50 USDC"
          tone="ok"
        />
        <TreeNode
          x={580}
          y={220}
          w={130}
          h={80}
          label="rogue · denied"
          agent="—"
          scope="dex=Raydium"
          budget="boundary"
          tone="denied"
        />

        {/* Caption hint at root */}
        <g>
          <text
            x="360"
            y="340"
            textAnchor="middle"
            fontFamily="var(--font-mono-v2), monospace"
            fontSize="11"
            fill="oklch(0.66 0.012 230)"
            letterSpacing="0.06em"
          >
            ↑ subset validated at derive · cumulative predicates evaluated at action
          </text>
          <text
            x="360"
            y="364"
            textAnchor="middle"
            fontFamily="var(--font-mono-v2), monospace"
            fontSize="11"
            fill="oklch(0.66 0.012 230)"
            letterSpacing="0.06em"
          >
            walked via remaining_accounts at verify_authorizes
          </text>
        </g>
      </svg>

      <figcaption
        className="t-small mt-6 pt-6"
        style={{ borderTop: "1px solid var(--rule-soft)" }}
      >
        Real account shape on devnet. Root, three live children, one rejected
        sibling. The denied node never settles — when its agent attempts an
        action, the cumulative predicate walk reaches the root&apos;s
        DEX = Jupiter constraint and the transaction reverts atomically.
      </figcaption>
    </figure>
  );
}

function TreeNode({
  x,
  y,
  w,
  h,
  label,
  agent,
  scope,
  budget,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  agent: string;
  scope: string;
  budget: string;
  tone: "root" | "ok" | "denied";
}) {
  const stroke =
    tone === "root"
      ? "oklch(0.83 0.165 92)"
      : tone === "denied"
      ? "oklch(0.55 0.18 30)"
      : "oklch(0.30 0.014 230)";
  const labelColor =
    tone === "root"
      ? "oklch(0.83 0.165 92)"
      : tone === "denied"
      ? "oklch(0.55 0.18 30)"
      : "oklch(0.66 0.012 230)";
  const opacity = tone === "denied" ? 0.55 : 1;
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="oklch(0.20 0.012 230)"
        stroke={stroke}
        strokeWidth={tone === "root" ? 1.2 : 1}
        strokeDasharray={tone === "denied" ? "4 4" : undefined}
      />
      <text
        x={x + 14}
        y={y + 22}
        fontFamily="var(--font-mono-v2), monospace"
        fontSize="10"
        fill={labelColor}
        letterSpacing="0.12em"
      >
        {label.toUpperCase()}
      </text>
      <text
        x={x + 14}
        y={y + 42}
        fontFamily="var(--font-display), serif"
        fontSize="14"
        fill="oklch(0.95 0.008 80)"
      >
        {agent}
      </text>
      <text
        x={x + 14}
        y={y + 60}
        fontFamily="var(--font-body), sans-serif"
        fontSize="11"
        fill="oklch(0.86 0.008 80)"
      >
        {scope}
      </text>
      <text
        x={x + w - 14}
        y={y + h - 10}
        textAnchor="end"
        fontFamily="var(--font-mono-v2), monospace"
        fontSize="10"
        fill="oklch(0.86 0.008 80)"
      >
        {budget}
      </text>
    </g>
  );
}

/* ── The Boundary (the math denies it) ──────────────────────────────────── */
function Boundary() {
  return (
    <section id="boundary" className="relative">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <Eyebrow>§ 02 · the boundary</Eyebrow>
            <h2 className="t-h2 mt-6" style={{ color: "var(--cream)" }}>
              When a sub-agent steps out of scope,
              <br />
              the transaction reverts. <em>Atomically.</em>
            </h2>
            <p className="t-body" style={{ marginTop: "var(--s-5)" }}>
              <code className="font-mono">verify_authorizes</code> runs as a{" "}
              <em>sibling</em> instruction in the same transaction as the
              action. It reads the action via{" "}
              <code className="font-mono">sysvar::instructions</code>, parses
              it to an <code className="font-mono">ActionDescriptor</code>,
              evaluates the leaf intent&apos;s predicate, then walks the
              ancestor chain and evaluates each parent&apos;s predicate too.
              If anything along the chain rejects, the whole transaction
              reverts. The action never executes. Helius gets no fee. Jupiter
              gets no order. Nothing settles.
            </p>
            <p className="t-body" style={{ marginTop: "var(--s-4)" }}>
              No CPI from Fuin into the action program. No middleware to
              integrate. The atomicity of Solana&apos;s transaction model is
              the enforcement.
            </p>
          </div>

          <div className="lg:col-span-5">
            <CodeBlock
              filename="atomic.tx"
              lines={[
                ["// ix 0  — Fuin verifier", "muted"],
                ["fuin.verify_authorizes(intent, target_ix=1)", "code"],
                ["  ↳ load IntentCommitment", "code"],
                ["  ↳ parse target ix → ActionDescriptor", "code"],
                ["  ↳ evaluate leaf predicate", "code"],
                ["  ↳ walk ancestors via remaining_accounts", "code"],
                ["    └─ root.predicate(action)  → ✗ Raydium", "deny"],
                ["", "code"],
                ["// ix 1  — the action", "muted"],
                ["raydium.swap(in=USDC, out=SOL, ...)", "code"],
                ["", "code"],
                ["└── tx reverts. action never executes.", "deny"],
              ]}
            />
            <p
              className="t-small mt-4"
              style={{ color: "var(--mute)", letterSpacing: "0.06em" }}
            >
              Live on devnet. Custom error{" "}
              <code className="font-mono">ProgramNotAllowed</code>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeBlock({
  filename,
  lines,
}: {
  filename: string;
  lines: [string, "code" | "muted" | "deny"][];
}) {
  return (
    <div
      style={{
        background: "var(--ink-rise)",
        border: "1px solid var(--rule-soft)",
      }}
    >
      <div
        className="px-4 py-2 t-eyebrow flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--rule-soft)" }}
      >
        <span>{filename}</span>
        <span style={{ fontSize: "0.65rem" }}>solana · sibling-ix model</span>
      </div>
      <pre
        className="font-mono text-[0.85rem] leading-[1.7] px-4 py-5 overflow-x-auto"
        style={{ color: "var(--cream-soft)" }}
      >
        {lines.map(([line, kind], i) => (
          <div
            key={i}
            style={{
              color:
                kind === "muted"
                  ? "var(--mute)"
                  : kind === "deny"
                  ? "var(--oxide)"
                  : "var(--cream-soft)",
              minHeight: "1lh",
            }}
          >
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

/* ── SDK ─────────────────────────────────────────────────────────────────── */
function Sdk() {
  return (
    <section
      id="sdk"
      className="relative"
      style={{ background: "var(--ink-deep)", borderTop: "1px solid var(--rule-soft)" }}
    >
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <Eyebrow>§ 03 · the surface</Eyebrow>
            <h2 className="t-h2 mt-6" style={{ color: "var(--cream)" }}>
              Forty lines of TypeScript and your swarm runs under one signature.
            </h2>
            <p className="t-body" style={{ marginTop: "var(--s-5)" }}>
              Install <code className="font-mono">@fuin-labs/sdk-v2</code>.
              Sign a root intent. Derive children. Wrap any action behind{" "}
              <code className="font-mono">verifyAuthorizes</code>. The SDK is
              a thin shell over the on-chain program — no off-chain server,
              no API key, no SaaS quota.
            </p>
            <p className="t-small mt-6">
              Zero-integration mode is the default for any x402 service.
              Helius and SendAI work unmodified — the SPL fee transfer only
              lands when Fuin&apos;s preceding verify ix passed.
            </p>
          </div>

          <div className="lg:col-span-7">
            <CodeBlock
              filename="trading-desk.ts"
              lines={[
                ["import { Fuin, GoalPredicate } from \"@fuin-labs/sdk-v2\";", "code"],
                ["", "code"],
                ["const fuin = new Fuin({ provider, idl });", "code"],
                ["", "code"],
                ["// 1. user signs the root", "muted"],
                ["const root = await fuin.signRootIntent({", "code"],
                ["  user, agent: orchestrator.publicKey,", "code"],
                ["  predicate: GoalPredicate.composite()", "code"],
                ["    .onlyOnDexes([JUPITER])", "code"],
                ["    .withinTimeWindow(start, end)", "code"],
                ["    .build(),", "code"],
                ["  budget: 500_000_000n,", "code"],
                ["  expiresAt: BigInt(now + 86400),", "code"],
                ["});", "code"],
                ["", "code"],
                ["// 2. orchestrator spawns sub-agents", "muted"],
                ["await fuin.deriveChildIntent({", "code"],
                ["  parentAgent: orchestrator,", "code"],
                ["  parent: root.pda,", "code"],
                ["  childAgent: research.publicKey,", "code"],
                ["  predicate: GoalPredicate.readOnly(),", "code"],
                ["  budget: 50_000_000n, expiresAt, nonce: 1,", "code"],
                ["});", "code"],
                ["", "code"],
                ["// 3. wrap any action behind a sibling verifier", "muted"],
                ["await fuin.sendVerifiedAction({", "code"],
                ["  agent: execute, intent: executePda,", "code"],
                ["  ancestors: [root.pda],", "code"],
                ["  actionIx: jupiterSwapIx,", "code"],
                ["});", "code"],
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Live evidence (devnet/mainnet receipts) ─────────────────────────────── */
function Evidence() {
  return (
    <section id="evidence" className="relative">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <Eyebrow>§ 04 · evidence</Eyebrow>
        <h2 className="t-h2 mt-6" style={{ color: "var(--cream)" }}>
          Live on Solana. Click any line.
        </h2>
        <p className="t-body" style={{ marginTop: "var(--s-5)" }}>
          The protocol ships, not the deck. Below: the program ID and a real
          intent tree from a live demo run — open Solana Explorer and walk
          the chain yourself.
        </p>

        <div className="mt-12">
          <EvidenceRow
            label="Program"
            mono={PROGRAM_ID}
            href={EXPLORER(PROGRAM_ID)}
          />
          <EvidenceRow
            label="Root intent"
            mono={DEMO_ROOT_PDA}
            href={EXPLORER(DEMO_ROOT_PDA)}
            note="signed by user · agent = orchestrator · 500 USDC budget"
          />
          <EvidenceRow
            label="Research child"
            mono="AyJCgX1bA7SECij2LdVZLRyeBMiKL71kEUsjFSDiiMvZ"
            href={EXPLORER(
              "AyJCgX1bA7SECij2LdVZLRyeBMiKL71kEUsjFSDiiMvZ"
            )}
            note="read-only · 50 USDC"
          />
          <EvidenceRow
            label="Execute child"
            mono="2KuKNXJtuGeESNeZLyb5YGZUrpsja824m62Kf9E67XMJ"
            href={EXPLORER(
              "2KuKNXJtuGeESNeZLyb5YGZUrpsja824m62Kf9E67XMJ"
            )}
            note="DEX = Jupiter · 400 USDC"
          />
          <EvidenceRow
            label="Audit child"
            mono="8BHTWBRnz8n7dwiuXue4YonAu7nC1xrg7tMrds2wEUGN"
            href={EXPLORER(
              "8BHTWBRnz8n7dwiuXue4YonAu7nC1xrg7tMrds2wEUGN"
            )}
            note="read-only · 50 USDC · daily report PDA"
          />
        </div>

        <div
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16"
          style={{ borderTop: "1px solid var(--rule-soft)", paddingTop: "var(--s-7)" }}
        >
          <div>
            <Eyebrow>shipped</Eyebrow>
            <ul className="mt-4 space-y-3 t-small" style={{ color: "var(--cream-soft)" }}>
              <Line>v1 grant-funded, deployed</Line>
              <Line>v2 on devnet, mainnet pending deploy</Line>
              <Line>10/10 anchor integration tests green</Line>
              <Line>
                <span style={{ color: "var(--mute)" }}>full demo:</span>{" "}
                <code className="font-mono">apps/swarm-demo</code>
              </Line>
            </ul>
          </div>
          <div>
            <Eyebrow>roadmap (post-hack)</Eyebrow>
            <ul className="mt-4 space-y-3 t-small" style={{ color: "var(--cream-soft)" }}>
              <Line>open predicate registry · 3rd-party publishing</Line>
              <Line>ZK-private intent commitments via Bonsol RISC0</Line>
              <Line>cross-chain via ERC-8004</Line>
              <Line>verifiable inference proofs · Bonsol</Line>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceRow({
  label,
  mono,
  href,
  note,
}: {
  label: string;
  mono: string;
  href: string;
  note?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid grid-cols-1 md:grid-cols-12 gap-4 py-5 group transition-colors"
      style={{ borderTop: "1px solid var(--rule-soft)" }}
    >
      <div
        className="md:col-span-2 t-eyebrow"
        style={{ alignSelf: "center", letterSpacing: "0.14em" }}
      >
        {label}
      </div>
      <div className="md:col-span-7 font-mono text-[0.88rem] break-all" style={{ color: "var(--cream)" }}>
        {mono}
      </div>
      <div className="md:col-span-3 t-small flex items-center justify-between">
        <span style={{ color: "var(--mute)" }}>{note}</span>
        <span
          aria-hidden
          className="font-mono opacity-50 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--ledger)" }}
        >
          ↗
        </span>
      </div>
    </a>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3" style={{ paddingLeft: 0 }}>
      <span style={{ color: "var(--ledger)", fontFamily: "var(--font-mono-v2), monospace" }}>
        →
      </span>
      <span>{children}</span>
    </li>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--rule-soft)",
        background: "var(--ink-deep)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div
              className="font-display text-[1.15rem]"
              style={{ color: "var(--cream)", letterSpacing: "0.02em" }}
            >
              Fuin
            </div>
            <p className="t-small mt-3" style={{ maxWidth: "42ch" }}>
              Built by Fuin Labs. Backed by a Solana Foundation India grant.
              Frontier hackathon submission · May 2026.
            </p>
          </div>

          <FooterCol
            title="Protocol"
            items={[
              ["Architecture", "https://github.com/Fuin-Labs/Fuin"],
              ["v1 vault", "/dashboard"],
              ["v2 audit", `/audit/${DEMO_ROOT_PDA}`],
            ]}
          />
          <FooterCol
            title="Developers"
            items={[
              ["@fuin-labs/sdk-v2", "https://github.com/Fuin-Labs/Fuin"],
              ["Swarm demo", "https://github.com/Fuin-Labs/Fuin"],
              ["Predicate registry", "#evidence"],
            ]}
          />
          <FooterCol
            title="Network"
            items={[
              ["Solana Explorer", EXPLORER(PROGRAM_ID)],
              ["Devnet status", "https://status.solana.com/"],
            ]}
          />
        </div>

        <div
          className="t-small mt-12 pt-6 flex flex-col md:flex-row justify-between gap-4"
          style={{ borderTop: "1px solid var(--rule-soft)", color: "var(--mute)" }}
        >
          <span>
            Open trust layer · {new Date().getFullYear()} · Apache-2.0
          </span>
          <span className="font-mono text-[0.75rem]" style={{ letterSpacing: "0.1em" }}>
            FUIN-V2 / SWARM / {PROGRAM_ID.slice(0, 6)}…{PROGRAM_ID.slice(-4)}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="md:col-span-2">
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-4 space-y-2.5 t-small">
        {items.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="hover:text-[var(--ledger)] transition-colors"
              style={{ color: "var(--cream-soft)" }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function Home(): React.JSX.Element {
  useV2BodyClass();
  return (
    <main className="min-h-screen relative" style={{ background: "var(--ink)" }}>
      <Header />
      <Hero />
      <Shape />
      <Boundary />
      <Sdk />
      <Evidence />
      <Footer />
    </main>
  );
}
