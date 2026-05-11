"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import {
  buildTreeFromAnyNode,
  IntentNode,
  makeConnection,
  shortAddr,
  formatUsdcMicros,
  predicateSummary,
  FUIN_V2_PROGRAM_ID,
} from "../../lib/fuin-rpc";
import { labelFor } from "../../lib/known-programs";

const EXPLORER = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;

export function AuditView({ initialPda }: { initialPda: string }): React.JSX.Element {
  const [tree, setTree] = useState<IntentNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("v2");
    return () => document.body.classList.remove("v2");
  }, []);

  useEffect(() => {
    let alive = true;
    const conn = makeConnection();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const pk = new PublicKey(initialPda);
        const t = await buildTreeFromAnyNode(conn, pk);
        if (!alive) return;
        if (!t) {
          setError("No intent found at this address. Check the URL or network.");
        } else {
          setTree(t);
          setSelected(initialPda);
        }
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialPda]);

  const flat = useMemo(() => (tree ? flatten(tree) : []), [tree]);
  const selectedNode = useMemo(
    () => flat.find((n) => n.pda === selected) ?? null,
    [flat, selected]
  );

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--ink)",
        color: "var(--cream)",
        fontFamily: "var(--font-body), system-ui, sans-serif",
      }}
    >
      <Header pda={initialPda} />

      {loading && <Loading />}

      {error && <ErrorPanel msg={error} pda={initialPda} />}

      {tree && !error && (
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pb-24">
          <RootSummary tree={tree} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mt-10">
            <div className="lg:col-span-7">
              <SectionLabel n="01" label="intent tree" />
              <div className="mt-6">
                <TreeRender
                  node={tree}
                  depth={0}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <SectionLabel n="02" label="detail" />
              <div className="mt-6 lg:sticky lg:top-20">
                {selectedNode ? (
                  <Detail node={selectedNode} />
                ) : (
                  <div className="t-small">Select a node to inspect.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Header strip ───────────────────────────────────────────────────────── */
function Header({ pda }: { pda: string }) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--rule-soft)",
        background: "color-mix(in oklch, var(--ink) 88%, transparent)",
      }}
      className="sticky top-0 z-30 backdrop-blur"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-display text-[1.05rem] inline-flex items-baseline gap-2"
            style={{ color: "var(--cream)" }}
          >
            <span className="font-mono" style={{ color: "var(--mute)", fontSize: "0.8rem" }}>
              ←
            </span>
            Fuin
          </Link>
          <span className="t-eyebrow" style={{ fontSize: "0.7rem" }}>
            audit · devnet
          </span>
        </div>
        <div className="flex items-center gap-4 t-small font-mono">
          <span style={{ color: "var(--mute)" }}>{shortAddr(pda, 6, 6)}</span>
          <a
            href={EXPLORER(pda)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--ink)",
              background: "var(--ledger)",
              padding: "6px 12px",
              fontSize: "0.78rem",
              letterSpacing: "0.04em",
            }}
          >
            on explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Root summary band ──────────────────────────────────────────────────── */
function RootSummary({ tree }: { tree: IntentNode }) {
  const totalLeaves = countLeaves(tree);
  const status = tree.revoked ? "revoked" : isExpired(tree) ? "expired" : "active";
  return (
    <section className="pt-10">
      <div className="t-eyebrow">root intent · live read</div>
      <h1
        className="t-h2 mt-4"
        style={{ color: "var(--cream)", maxWidth: "26ch" }}
      >
        {tree.parentIntent === null
          ? "Single signature, hierarchical scope."
          : "Sub-tree under a parent intent."}
      </h1>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mt-10 pt-6"
        style={{ borderTop: "1px solid var(--rule-soft)" }}
      >
        <Datum label="signer" value={shortAddr(tree.user, 5, 5)} mono link={EXPLORER(tree.user)} />
        <Datum label="root agent" value={shortAddr(tree.agent, 5, 5)} mono link={EXPLORER(tree.agent)} />
        <Datum
          label="cumulative scope"
          value={`${totalLeaves} agent${totalLeaves === 1 ? "" : "s"}`}
        />
        <Datum
          label="status"
          value={status}
          tone={
            status === "revoked"
              ? "danger"
              : status === "expired"
              ? "muted"
              : "ok"
          }
        />
      </div>
    </section>
  );
}

function Datum({
  label,
  value,
  mono,
  link,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
  tone?: "ok" | "danger" | "muted";
}) {
  const color =
    tone === "danger"
      ? "var(--oxide)"
      : tone === "muted"
      ? "var(--mute)"
      : "var(--cream)";
  const inner = (
    <span
      className={mono ? "font-mono" : ""}
      style={{
        color,
        fontSize: mono ? "0.95rem" : "1.05rem",
        fontFamily: mono ? undefined : "var(--font-display), serif",
        letterSpacing: mono ? "0.02em" : "-0.005em",
      }}
    >
      {value}
    </span>
  );
  return (
    <div>
      <div className="t-eyebrow" style={{ marginBottom: "8px" }}>
        {label}
      </div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}

/* ── Tree renderer ───────────────────────────────────────────────────────── */
function TreeRender({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: IntentNode;
  depth: number;
  selected: string | null;
  onSelect: (pda: string) => void;
}) {
  return (
    <div>
      <NodeRow
        node={node}
        depth={depth}
        selected={selected === node.pda}
        onClick={() => onSelect(node.pda)}
      />
      {node.children.length > 0 && (
        <div className="ml-7 pl-5" style={{ borderLeft: "1px solid var(--rule-soft)" }}>
          {node.children.map((c) => (
            <TreeRender
              key={c.pda}
              node={c}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeRow({
  node,
  depth,
  selected,
  onClick,
}: {
  node: IntentNode;
  depth: number;
  selected: boolean;
  onClick: () => void;
}) {
  const isRoot = node.parentIntent === null;
  const status = node.revoked ? "revoked" : isExpired(node) ? "expired" : "active";
  const accent =
    status === "revoked"
      ? "var(--oxide)"
      : isRoot
      ? "var(--ledger)"
      : "var(--cream-soft)";
  const summary = predicateSummary(node.goalPredicate).join(" · ");
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-colors group"
      style={{
        background: selected ? "var(--ink-rise)" : "transparent",
        border: "1px solid",
        borderColor: selected ? "var(--ledger)" : "var(--rule-soft)",
        padding: "16px 20px",
        marginBottom: "8px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        columnGap: "16px",
      }}
    >
      <span
        className="t-eyebrow"
        style={{
          color: accent,
          fontSize: "0.66rem",
          letterSpacing: "0.18em",
          minWidth: "72px",
          whiteSpace: "nowrap",
        }}
      >
        depth · {node.depth}
      </span>
      <div>
        <div className="flex items-baseline gap-3">
          <span
            className="font-display"
            style={{
              fontSize: "1.05rem",
              color: "var(--cream)",
              letterSpacing: "-0.005em",
            }}
          >
            {isRoot ? "root" : `child · ${node.children.length === 0 ? "leaf" : `${node.children.length} sub`}`}
          </span>
          <span className="font-mono text-[0.78rem]" style={{ color: "var(--mute)" }}>
            {shortAddr(node.agent, 4, 4)}
          </span>
        </div>
        <div className="t-small mt-1" style={{ color: "var(--cream-soft)" }}>
          {summary}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[0.86rem]" style={{ color: "var(--cream)" }}>
          {formatUsdcMicros(node.remainingBudget)} <span style={{ color: "var(--mute)" }}>/ {formatUsdcMicros(node.budget)}</span>
        </div>
        <div className="t-eyebrow mt-1" style={{ color: accent, fontSize: "0.66rem" }}>
          {status}
        </div>
      </div>
    </button>
  );
}

/* ── Detail panel ────────────────────────────────────────────────────────── */
function Detail({ node }: { node: IntentNode }) {
  const status = node.revoked ? "revoked" : isExpired(node) ? "expired" : "active";
  const lines = predicateSummary(node.goalPredicate);
  return (
    <div
      style={{
        background: "var(--ink-rise)",
        border: "1px solid var(--rule-soft)",
        padding: "24px",
      }}
    >
      <div className="t-eyebrow">
        intent · depth {node.depth}
      </div>
      <h3 className="font-display mt-2" style={{ fontSize: "1.45rem", color: "var(--cream)" }}>
        {node.parentIntent === null ? "Root authorization" : `Derived intent`}
      </h3>

      <DetailRow label="pda" value={node.pda} mono link={EXPLORER(node.pda)} />
      <DetailRow label="user" value={node.user} mono link={EXPLORER(node.user)} />
      <DetailRow label="agent" value={node.agent} mono link={EXPLORER(node.agent)} />
      {node.parentIntent && (
        <DetailRow label="parent" value={node.parentIntent} mono link={EXPLORER(node.parentIntent)} />
      )}
      <DetailRow
        label="budget"
        value={`${formatUsdcMicros(node.remainingBudget)} / ${formatUsdcMicros(node.budget)}`}
      />
      <DetailRow
        label="expires"
        value={new Date(Number(node.expiresAt) * 1000).toUTCString()}
      />
      <DetailRow label="nonce" value={node.nonce.toString()} mono />
      <DetailRow label="policy version" value={node.policyVersion.toString()} mono />
      <DetailRow label="status" value={status} tone={status === "revoked" ? "danger" : "ok"} />

      <div
        className="mt-6 pt-6"
        style={{ borderTop: "1px solid var(--rule-soft)" }}
      >
        <div className="t-eyebrow mb-3">predicate</div>
        <ul className="space-y-2">
          {lines.map((l, i) => (
            <li key={i} className="font-mono text-[0.85rem]" style={{ color: "var(--cream-soft)" }}>
              <span style={{ color: "var(--ledger)" }}>→ </span>
              {l}
            </li>
          ))}
        </ul>
        {node.goalPredicate.allowedDexes.length > 0 && (
          <div className="mt-4 space-y-1">
            {node.goalPredicate.allowedDexes.map((d) => {
              const known = labelFor(d);
              return (
                <a
                  key={d}
                  href={EXPLORER(d)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[0.82rem] hover:underline"
                  style={{ color: "var(--cream-soft)" }}
                >
                  {known && (
                    <span style={{ color: "var(--ledger)", marginRight: "8px" }}>
                      {known}
                    </span>
                  )}
                  <span className="font-mono" style={{ color: "var(--mute)" }}>
                    {shortAddr(d, 8, 6)}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="mt-6 pt-6"
        style={{ borderTop: "1px solid var(--rule-soft)" }}
      >
        <div className="t-eyebrow mb-3">chain of custody</div>
        <div className="t-small" style={{ color: "var(--cream-soft)" }}>
          Walk this node&apos;s ancestor chain to confirm cumulative scope. Click
          a parent in the tree on the left, or open it on Solana Explorer.
        </div>
        <a
          href={EXPLORER(node.pda)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 font-mono text-[0.84rem] px-4 py-2"
          style={{ background: "var(--ledger)", color: "var(--ink)" }}
        >
          view tx history ↗
        </a>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  link,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
  tone?: "ok" | "danger";
}) {
  const color = tone === "danger" ? "var(--oxide)" : "var(--cream-soft)";
  const inner = (
    <span
      className={mono ? "font-mono break-all" : ""}
      style={{ color, fontSize: "0.86rem" }}
    >
      {value}
    </span>
  );
  return (
    <div
      className="grid grid-cols-3 gap-3 py-2.5"
      style={{ borderBottom: "1px solid var(--rule-soft)" }}
    >
      <div className="t-eyebrow" style={{ fontSize: "0.66rem" }}>
        {label}
      </div>
      <div className="col-span-2">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}

/* ── Loading / error ────────────────────────────────────────────────────── */
function Loading() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24">
      <div className="t-eyebrow mb-3">loading · walking on-chain</div>
      <h2
        className="font-display"
        style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--cream)" }}
      >
        Reading the chain…
      </h2>
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-14"
            style={{
              background: "var(--ink-rise)",
              border: "1px solid var(--rule-soft)",
              opacity: 0.5,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorPanel({ msg, pda }: { msg: string; pda: string }) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24">
      <div className="t-eyebrow" style={{ color: "var(--oxide)" }}>
        could not load
      </div>
      <h2
        className="font-display mt-2"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", color: "var(--cream)" }}
      >
        {msg}
      </h2>
      <div
        className="mt-6 p-4 font-mono text-[0.85rem]"
        style={{
          background: "var(--ink-rise)",
          border: "1px solid var(--rule-soft)",
          color: "var(--cream-soft)",
        }}
      >
        {pda}
      </div>
      <div className="mt-6 t-small">
        Confirm the PDA is on devnet (program{" "}
        <code className="font-mono">{shortAddr(FUIN_V2_PROGRAM_ID.toBase58(), 6, 6)}</code>).
      </div>
      <Link
        href="/audit/4BH2MJwZ5oHSY3u4eEGNuVXCdK3zWMa1YBXWxCEqGdAn"
        className="inline-flex items-center gap-2 mt-6 font-mono text-[0.9rem]"
        style={{
          background: "var(--ledger)",
          color: "var(--ink)",
          padding: "12px 20px",
          letterSpacing: "0.03em",
        }}
      >
        Open the demo tree
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span
        className="font-mono"
        style={{
          color: "var(--ledger)",
          fontSize: "0.78rem",
          letterSpacing: "0.18em",
        }}
      >
        § {n}
      </span>
      <span
        className="font-display"
        style={{ fontSize: "1.15rem", color: "var(--cream)", letterSpacing: "-0.005em" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
function flatten(node: IntentNode): IntentNode[] {
  return [node, ...node.children.flatMap(flatten)];
}
function countLeaves(node: IntentNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}
function isExpired(node: IntentNode): boolean {
  return Number(node.expiresAt) * 1000 < Date.now();
}
