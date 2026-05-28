"use client";

import { JSX, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * UsecaseFlow — two delegation scenarios shown via real product screenshots
 * instead of hand-rolled icon-feature-cards. Toggle between the autonomous-agent
 * /swarm demo and the parental-vault /dashboard. Caption underneath ties each
 * shot back to the bound-permission story. Real product > fake mock.
 */

const IVORY = "#f2ece1";
const MUTED = "#b3aca0";
const LIVE = "#c1e859";
const BG = "#0a0907";
const HAIRLINE = "rgba(242, 236, 225, 0.10)";
const HAIRLINE_STRONG = "rgba(242, 236, 225, 0.18)";

type TabId = "agent" | "junior";

interface View {
  label: string;
  src: string;
  alt: string;
  caption: string;
}

const VIEWS: Record<TabId, View> = {
  agent: {
    label: "Autonomous agent",
    src: "/landing/swarm-demo.png",
    alt: "Fuin swarm demo: one root intent fans out into research, execute, and audit sub-agents on-chain.",
    caption:
      "One root intent. Three scoped sub-agents (research, execute, audit). The rogue out-of-scope attempt bounces off verify_authorizes on-chain — never settles.",
  },
  junior: {
    label: "Junior vault",
    src: "/landing/dashboard.png",
    alt: "Fuin vault dashboard: the guardian's view for issuing scoped delegate keys.",
    caption:
      "The guardian's dashboard. Deploy a vault PDA with a daily cap and an allow-list, then issue a time-bound session key. The junior spends within the rules; nothing else compiles.",
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

      {/* Framed product screenshot. Hairline border, top-left lime corner mark
          echoing the hero panel chrome so this section reads as the same family. */}
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
            borderRadius: 12,
            overflow: "hidden",
            background: BG,
            boxShadow: "0 30px 80px -40px rgba(193, 232, 89, 0.18), 0 0 0 1px rgba(193, 232, 89, 0.08)",
          }}
        >
          {/* Browser-chrome strip — gives the screenshot a "this is the real app" frame */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: `1px solid ${HAIRLINE}`,
              background: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: HAIRLINE_STRONG }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: HAIRLINE_STRONG }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: HAIRLINE_STRONG }} />
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono-v2), ui-monospace, monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.02em",
                color: MUTED,
              }}
            >
              fuin.xyz{tab === "agent" ? "/swarm" : "/dashboard/vaults"}
            </span>
          </div>

          <img
            src={view.src}
            alt={view.alt}
            width={1280}
            height={720}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
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
