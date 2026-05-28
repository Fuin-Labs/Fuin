"use client";
import React from "react";

import { useEffect } from "react";
import "./landing.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { Mark } from "./components/Mark";
import { LenisProvider } from "./components/LenisProvider";

const UsecaseFlow = dynamic(() => import("./components/UsecaseFlow").then((m) => m.UsecaseFlow), {
  ssr: false,
  loading: () => <div style={{ minHeight: 500 }} />,
});

const DigitalRain = dynamic(() => import("./components/DigitalRain").then((m) => m.DigitalRain), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, background: "#0a0907" }} />,
});

// ── Fuin palette — lime on warm-bias near-black (May 2026) ───────────────────
// Foundation: ivory + cold-steel + warm-bias near-black, with electric LIME as
// "the live line" — the agentic accent applied to CTAs, focus, active states,
// the logo aperture, and the Digital Rain shader.
const BG = "#0a0907";        // page surface (warm-bias near-black)
const SURFACE = "#13110f";   // one step up (cards, panels)
const IVORY = "#f2ece1";     // primary text, logo geometry
const MUTED = "#b3aca0";     // secondary text
const STEEL = "#9fb4c7";     // SECONDARY whisper — hairlines, metadata
const LIVE = "#c1e859";      // PRIMARY accent — the live line
const LIVE_GLOW = "rgba(193, 232, 89, 0.30)";
const HAIRLINE = "rgba(242, 236, 225, 0.10)";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// ── Scoped style block ported from fuin.html ─────────────────────────────────
// Selectors are namespaced under #fuin-landing so they cannot leak into the rest
// of the app. Motion is transform+opacity only and respects reduced-motion.
const STYLES = `
#fuin-landing {
  --bg: ${BG};
  --surface: ${SURFACE};
  --ivory: ${IVORY};
  --muted: ${MUTED};
  --steel: ${STEEL};
  --live: ${LIVE};
  --live-glow: ${LIVE_GLOW};
  --hairline: ${HAIRLINE};
  --hairline-faint: rgba(242, 236, 225, 0.06);
  --ease: ${EASE};
  --gutter: clamp(1.25rem, 4vw, 3.25rem);
  --maxw: 1320px;

  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow-x: clip;
  line-height: 1.6;
  /* Flat micro-texture: a barely-there Swiss dot grid. No gradient, no glow. */
  background-image: radial-gradient(var(--hairline-faint) 1px, transparent 1px);
  background-size: 26px 26px;
  background-position: 0 0;
}
#fuin-landing ::selection { background: var(--live); color: var(--bg); }
#fuin-landing a { color: inherit; text-decoration: none; }
#fuin-landing a:focus-visible,
#fuin-landing button:focus-visible {
  outline: 2px solid var(--live);
  outline-offset: 3px;
  border-radius: 2px;
}

/* Top progress bar. CSS scroll-driven animation (no JS scroll listener).
   Browser support: Chrome 115+, Firefox 116+, Safari 17.4+. Falls back to invisible. */
#fuin-landing .fl-progress {
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  width: 100%;
  background: var(--live);
  z-index: 100;
  transform: scaleX(0);
  transform-origin: left;
}
@supports (animation-timeline: scroll(root)) {
  #fuin-landing .fl-progress {
    animation: fl-progress-grow linear;
    animation-timeline: scroll(root);
  }
  @keyframes fl-progress-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}

#fuin-landing .fl-shell {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  padding-inline: var(--gutter);
}

#fuin-landing .fl-label {
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: var(--muted);
  font-feature-settings: 'tnum' 1;
}

/* NAV */
#fuin-landing .fl-nav { position: absolute; top: 0; left: 0; right: 0; z-index: 20; padding-top: clamp(1.5rem, 3vh, 2.25rem); }
#fuin-landing .fl-nav-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding-bottom: clamp(1.25rem, 2.5vh, 1.75rem);
  border-bottom: 1px solid var(--hairline);
}
#fuin-landing .fl-brand { display: flex; align-items: center; gap: 0.75rem; }
#fuin-landing .fl-wordmark { font-weight: 700; font-size: 1.05rem; letter-spacing: 0.02em; color: var(--ivory); }
#fuin-landing .fl-nav-links { display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2rem); }
#fuin-landing .fl-nav-link {
  font-size: 0.85rem; font-weight: 500; letter-spacing: 0.02em; color: var(--muted);
  transition: color 0.3s var(--ease);
}
#fuin-landing .fl-nav-link:hover,
#fuin-landing .fl-nav-link:focus-visible { color: var(--ivory); }
#fuin-landing .fl-nav-link.optional { display: none; }
@media (min-width: 560px) { #fuin-landing .fl-nav-link.optional { display: inline-block; } }

/* Pill / ghost CTAs */
#fuin-landing .fl-pill {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; letter-spacing: 0.01em; border-radius: 999px;
  transition: transform 0.3s var(--ease), background 0.3s var(--ease), color 0.3s var(--ease), border-color 0.3s var(--ease);
}
#fuin-landing .fl-pill-solid { background: var(--live); color: #050505; padding: 0.6rem 1.15rem; font-size: 0.85rem; min-height: 40px; }
@media (max-width: 640px) {
  /* Bump touch target to the 44px standard on phone-class screens */
  #fuin-landing .fl-pill-solid { padding: 0.7rem 1.25rem; min-height: 44px; }
}
#fuin-landing .fl-pill-solid:hover,
#fuin-landing .fl-pill-solid:focus-visible { background: var(--live); transform: translateY(-1px); box-shadow: 0 0 22px var(--live-glow); }
#fuin-landing .fl-cta-row .fl-pill-solid { padding: 0.95rem 1.7rem; font-size: 0.95rem; }
#fuin-landing .fl-ghost {
  padding: 0.95rem 1.7rem; font-size: 0.95rem; color: var(--ivory); border: 1px solid var(--hairline);
  border-radius: 999px;
}
#fuin-landing .fl-ghost:hover,
#fuin-landing .fl-ghost:focus-visible { border-color: var(--live); color: var(--live); transform: translateY(-1px); }

/* HERO */
#fuin-landing .fl-hero { position: relative; min-height: 100vh; min-height: 100svh; display: flex; align-items: center; }
#fuin-landing .fl-hero-grid {
  width: 100%; display: grid; grid-template-columns: 1fr; gap: clamp(2rem, 5vh, 3.5rem);
  padding-top: clamp(5rem, 10vh, 6rem); padding-bottom: clamp(4rem, 8vh, 6rem); position: relative;
}
/* Split hero — copy left, Digital Rain shader right (lg+) */
#fuin-landing .fl-hero-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
  width: 100%;
}
@media (min-width: 980px) {
  #fuin-landing .fl-hero-split { grid-template-columns: minmax(0, 1fr) 560px; }
}
#fuin-landing .fl-hero-copy {
  display: flex; flex-direction: column;
  gap: clamp(1.25rem, 2.5vh, 1.75rem);
  max-width: 600px;
}
#fuin-landing .fl-hero-panel {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--hairline);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg);
  isolation: isolate;
}
@media (max-width: 979px) {
  #fuin-landing .fl-hero-panel { max-width: 560px; margin-left: auto; margin-right: auto; }
}
@media (max-width: 480px) {
  /* Below 480px the canvas is too small to be meaningful; hide and burn no CPU */
  #fuin-landing .fl-hero-panel { display: none; }
}
#fuin-landing .fl-hero-panel-corner {
  position: absolute;
  width: 12px; height: 12px;
  border: 1px solid var(--live);
  pointer-events: none;
  opacity: 0;
  transform: scale(0.7);
  animation: fl-corner-in 0.55s var(--ease) forwards;
  z-index: 3;
}
#fuin-landing .fl-hero-panel-corner.tl { top: 6px; left: 6px; border-right: none; border-bottom: none; animation-delay: 0.45s; }
#fuin-landing .fl-hero-panel-corner.tr { top: 6px; right: 6px; border-left: none; border-bottom: none; animation-delay: 0.55s; }
#fuin-landing .fl-hero-panel-corner.bl { bottom: 6px; left: 6px; border-right: none; border-top: none; animation-delay: 0.50s; }
#fuin-landing .fl-hero-panel-corner.br { bottom: 6px; right: 6px; border-left: none; border-top: none; animation-delay: 0.60s; }
@keyframes fl-corner-in {
  to { opacity: 0.55; transform: scale(1); }
}
/* Hero vertical accent rule + panel-meta strip removed per design. */
#fuin-landing .fl-eyebrow { display: inline-flex; align-items: center; }
#fuin-landing .fl-hero-headline {
  font-weight: 800; font-size: clamp(2.6rem, 8vw, 4.2rem); line-height: 1.02; letter-spacing: -0.03em;
  color: var(--ivory); max-width: 100%;
  overflow-wrap: break-word; word-wrap: break-word;
}
/* Word-stagger reveal driven by anime.js — words start invisible and below baseline,
   anime fades + translates them in on mount with 45ms stagger. */
#fuin-landing .fl-hero-headline .fl-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(22px);
}
@media (prefers-reduced-motion: reduce) {
  #fuin-landing .fl-hero-headline .fl-word {
    opacity: 1;
    transform: none;
  }
}
#fuin-landing .fl-hero-copy { min-width: 0; }
#fuin-landing .fl-hero-grid, #fuin-landing .fl-hero-split { min-width: 0; }
@media (min-width: 980px) {
  /* Split layout: bigger for visual impact. Sentences may wrap to 2 lines each — accepted trade for the headline weight the brand wants. */
  #fuin-landing .fl-hero-headline { font-size: clamp(2.8rem, 4.5vw, 4.6rem); letter-spacing: -0.028em; }
}
@media (max-width: 480px) {
  #fuin-landing .fl-hero-headline {
    font-size: clamp(2rem, 8vw, 2.6rem);
    letter-spacing: -0.025em;
  }
}
#fuin-landing .fl-hero-headline .fl-ln { display: block; }
#fuin-landing .fl-hero-sub { font-size: clamp(1rem, 1.35vw, 1.18rem); font-weight: 400; line-height: 1.55; color: var(--muted); max-width: 46ch; }
#fuin-landing .fl-hero-cta { display: flex; flex-wrap: wrap; gap: 1rem; }
#fuin-landing .fl-hero-cta .fl-pill-solid { padding: 0.95rem 1.7rem; font-size: 0.95rem; }
/* fl-cred, fl-hero-foot, fl-scroll-cue removed per design (banned scroll cue + section-number eyebrow). */

/* GENERIC STORY CHAPTER */
#fuin-landing .fl-chapter { position: relative; padding-block: clamp(6rem, 18vh, 11rem); border-top: 1px solid var(--hairline); }
#fuin-landing .fl-chapter-title {
  font-weight: 700; font-size: clamp(2rem, 5.4vw, 4rem); line-height: 1.06; letter-spacing: -0.025em; color: var(--ivory); max-width: 20ch;
}
#fuin-landing .fl-chapter-body {
  margin-top: clamp(1.5rem, 4vh, 2.25rem); font-size: clamp(1.05rem, 1.5vw, 1.3rem); font-weight: 400; line-height: 1.6; color: var(--muted); max-width: 58ch;
}
#fuin-landing .fl-chapter-body + .fl-chapter-body { margin-top: 1.4rem; }

/* SPLIT: copy beside product mock-card */
#fuin-landing .fl-split { display: grid; grid-template-columns: 1fr; gap: clamp(2.5rem, 6vw, 4.5rem); align-items: center; margin-top: clamp(2.5rem, 6vh, 4rem); }
@media (min-width: 900px) { #fuin-landing .fl-split { grid-template-columns: 1fr 1fr; } }

/* POLICY RECEIPT — editorial config artifact (replaces former fake product mock).
   Flat hairlines, monospace values, no rounded card chrome. */
#fuin-landing .fl-policy {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font-mono-v2), ui-monospace, "SF Mono", monospace;
}
#fuin-landing .fl-policy-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 1.1rem 0 1rem;
  border-bottom: 1px solid var(--hairline);
}
#fuin-landing .fl-policy-tag {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ivory);
  font-weight: 600;
}
#fuin-landing .fl-policy-status {
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--live);
  font-weight: 600;
}
#fuin-landing .fl-policy-rows {
  display: grid;
  grid-template-columns: 1fr;
}
#fuin-landing .fl-policy-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--hairline);
  font-size: 0.85rem;
}
#fuin-landing .fl-policy-row:last-child { border-bottom: none; }
#fuin-landing .fl-policy-row dt {
  color: var(--muted);
  letter-spacing: 0.02em;
}
#fuin-landing .fl-policy-row dd {
  color: var(--ivory);
  text-align: right;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
#fuin-landing .fl-policy-foot {
  padding: 1rem 0 0.3rem;
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.02em;
  line-height: 1.5;
}
#fuin-landing .fl-policy-foot code {
  font-family: inherit;
  color: var(--ivory);
}

/* GUARANTEE — Swiss 4-cell grid */
#fuin-landing .fl-grid-4 { display: grid; grid-template-columns: 1fr; border-top: 1px solid var(--hairline); }
@media (min-width: 680px) { #fuin-landing .fl-grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1040px) { #fuin-landing .fl-grid-4 { grid-template-columns: repeat(4, 1fr); } }
#fuin-landing .fl-cell { padding: clamp(1.75rem, 4vh, 2.5rem) clamp(0rem, 2vw, 1.75rem); border-bottom: 1px solid var(--hairline); }
@media (min-width: 680px) {
  #fuin-landing .fl-cell { padding-left: clamp(1.25rem, 2vw, 1.75rem); border-left: 1px solid var(--hairline); }
  #fuin-landing .fl-cell:nth-child(2n + 1) { border-left: none; padding-left: 0; }
  #fuin-landing .fl-cell:nth-child(3), #fuin-landing .fl-cell:nth-child(4) { border-bottom: none; }
}
@media (min-width: 1040px) {
  #fuin-landing .fl-cell { border-left: 1px solid var(--hairline); padding-left: clamp(1.25rem, 2vw, 1.75rem); border-bottom: none; }
  #fuin-landing .fl-cell:nth-child(2n + 1) { border-left: 1px solid var(--hairline); padding-left: clamp(1.25rem, 2vw, 1.75rem); }
  #fuin-landing .fl-cell:first-child { border-left: none; padding-left: 0; }
}
#fuin-landing .fl-cell .fl-ix {
  font-weight: 500; font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--muted);
  font-variant-numeric: tabular-nums; margin-bottom: 1.1rem;
}
#fuin-landing .fl-cell .fl-ct { font-weight: 700; font-size: clamp(1.35rem, 2vw, 1.6rem); letter-spacing: -0.01em; line-height: 1.1; color: var(--ivory); margin-bottom: 0.85rem; }
#fuin-landing .fl-cell .fl-cd { max-width: 26ch; color: var(--muted); font-size: 0.95rem; line-height: 1.5; }

/* WHO — UsecaseFlow lives directly on the page (no wrapper card, avoids nested-card anti-pattern). */
#fuin-landing .fl-flow-panel { margin-top: clamp(2.5rem, 6vh, 4rem); }

/* CLOSE / CTA */
#fuin-landing .fl-close { position: relative; padding-block: clamp(7rem, 20vh, 12rem); border-top: 1px solid var(--hairline); }
#fuin-landing .fl-close-title { font-weight: 800; font-size: clamp(2.3rem, 6vw, 4.4rem); line-height: 1.04; letter-spacing: -0.03em; color: var(--ivory); max-width: 18ch; }
#fuin-landing .fl-close-sub { margin-top: clamp(1.25rem, 3vh, 1.75rem); font-size: clamp(1.05rem, 1.5vw, 1.3rem); line-height: 1.55; color: var(--muted); max-width: 50ch; }
#fuin-landing .fl-cta-row { margin-top: clamp(2.5rem, 6vh, 3.5rem); display: flex; flex-wrap: wrap; gap: 1rem; }

/* FOOTER */
#fuin-landing .fl-footer { border-top: 1px solid var(--hairline); padding-block: clamp(2.5rem, 6vh, 3.5rem); }
#fuin-landing .fl-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; }
#fuin-landing .fl-footer-brand { display: flex; align-items: center; gap: 0.7rem; }
#fuin-landing .fl-footer-brand .fl-ft { font-size: 0.85rem; font-weight: 500; color: var(--muted); letter-spacing: 0.01em; }
#fuin-landing .fl-footer-links { display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 1.75rem); flex-wrap: wrap; }
#fuin-landing .fl-footer-links a { font-size: 0.85rem; font-weight: 500; color: var(--muted); transition: color 0.3s var(--ease); }
#fuin-landing .fl-footer-links a:hover,
#fuin-landing .fl-footer-links a:focus-visible { color: var(--ivory); }
#fuin-landing .fl-footer-copy { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }

/* SCROLL REVEAL — transform + opacity only, staggered via r1–r4 */
#fuin-landing .fl-reveal { opacity: 0; transform: translateY(34px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
#fuin-landing .fl-reveal.animate { opacity: 1; transform: translateY(0); }
#fuin-landing .fl-reveal.r1.animate { transition-delay: 0.05s; }
#fuin-landing .fl-reveal.r2.animate { transition-delay: 0.16s; }
#fuin-landing .fl-reveal.r3.animate { transition-delay: 0.27s; }
#fuin-landing .fl-reveal.r4.animate { transition-delay: 0.38s; }

@media (max-width: 768px) {
  #fuin-landing .fl-footer-inner { flex-direction: column; align-items: flex-start; }
}

/* REDUCED MOTION */
@media (prefers-reduced-motion: reduce) {
  #fuin-landing .fl-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  #fuin-landing .fl-pill, #fuin-landing .fl-ghost, #fuin-landing .fl-nav-link { transition: none !important; }
  #fuin-landing .fl-progress { animation: none !important; transition: none !important; }
}
`;

export default function Home(): React.JSX.Element {
  // Scroll-reveal via IntersectionObserver (the kept `.animate-on-scroll` system).
  // Both the new `.fl-reveal` chapters and the retained mock-card `.animate-on-scroll`
  // markup get revealed by the same observer.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    document
      .querySelectorAll("#fuin-landing .animate-on-scroll, #fuin-landing .fl-reveal")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Progress bar is now CSS scroll-driven (animation-timeline: scroll(root)).
  // No JS scroll listener — see globals/landing CSS .fl-progress block.

  // Hero headline word-by-word reveal via anime.js. Words start opacity:0
  // via CSS, anime staggers them in on mount. Skipped under reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctrl = animate("#fuin-landing .fl-hero-headline .fl-word", {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 700,
      delay: stagger(45, { start: 220 }),
      ease: "outExpo",
    });
    return () => {
      ctrl?.pause();
    };
  }, []);

  return (
    <LenisProvider>
    <div
      id="fuin-landing"
      style={{ fontFamily: "var(--font-archivo), sans-serif", background: BG, color: IVORY }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Thin top progress bar (steel) */}
      <div className="fl-progress" id="fl-progress" aria-hidden="true" />

      {/* ===================== HERO ===================== */}
      <header className="fl-hero">
        {/* NAV: monogram + wordmark left, links + pill right */}
        <nav className="fl-nav" aria-label="Primary">
          <div className="fl-shell fl-nav-inner">
            <Link className="fl-brand" href="/" aria-label="Fuin home">
              <Mark size={34} />
              <span className="fl-wordmark">Fuin</span>
            </Link>
            <div className="fl-nav-links">
              <Link className="fl-nav-link optional" href="/docs">
                Docs
              </Link>
              <a className="fl-nav-link optional" href="https://github.com/Fuin-Labs/Fuin">
                GitHub
              </a>
              <Link className="fl-pill fl-pill-solid" href="/dashboard/vaults">
                Launch app
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO CONTENT — split: copy left, Digital Rain shader right (lg+) */}
        <div className="fl-shell" id="top">
          <div className="fl-hero-grid">
            <div className="fl-hero-split">
              <div className="fl-hero-copy">
                <span className="fl-eyebrow fl-label fl-reveal r1">
                  Restricted Access · Solana
                </span>

                <h1 className="fl-hero-headline">
                  <span className="fl-ln">
                    {"The next wave isn't more access.".split(" ").map((w, i) => (
                      <span key={`a-${i}`} className="fl-word">
                        {w}
                        {" "}
                      </span>
                    ))}
                  </span>
                  <span className="fl-ln">
                    {"It's restricted access.".split(" ").map((w, i) => (
                      <span key={`b-${i}`} className="fl-word">
                        {w}
                        {" "}
                      </span>
                    ))}
                  </span>
                </h1>

                <p className="fl-hero-sub fl-reveal r3">
                  Give an AI agent, a teammate, or your kid a key that spends within your limits. Never drains.
                </p>

                <div className="fl-hero-cta fl-reveal r4">
                  <Link className="fl-pill fl-pill-solid" href="/dashboard/vaults">
                    Launch app
                  </Link>
                  <Link className="fl-pill fl-ghost" href="/docs">
                    Read the docs
                  </Link>
                </div>
              </div>

              {/* Digital Rain — on-chain alphabet falling into a ledger surface.
                  Canvas is aria-hidden inside DigitalRain; corner marks frame it as
                  an HUD without adding caption chrome. */}
              <div className="fl-hero-panel fl-reveal r3">
                <DigitalRain />
                <span className="fl-hero-panel-corner tl" aria-hidden="true" />
                <span className="fl-hero-panel-corner tr" aria-hidden="true" />
                <span className="fl-hero-panel-corner bl" aria-hidden="true" />
                <span className="fl-hero-panel-corner br" aria-hidden="true" />
              </div>
            </div>

          </div>
        </div>
      </header>

      <main>
        {/* ===================== 01 The Shift ===================== */}
        <section className="fl-chapter" aria-labelledby="s1-title">
          <div className="fl-shell" style={{ maxWidth: "896px" }}>
            <h2 className="fl-chapter-title fl-reveal r2" id="s1-title">
              Crypto has only ever sold more.
            </h2>
            <p className="fl-chapter-body fl-reveal r3">
              More keys. More approvals. More permissions. Every wallet is all-or-nothing. Hold the
              keys yourself, or hand them over completely. One bad signature, one compromised bot,
              one prompt-injected agent can take everything.
            </p>
            <p className="fl-chapter-body fl-reveal r3">
              The next wave is the opposite: not less capability, less blast radius. You grant the
              power to act and withhold the power to drain. The agent trades; it cannot run. The
              contractor pays; it cannot empty the account.
            </p>
          </div>
        </section>

        {/* ===================== 02 A Key with a Leash ===================== */}
        <section className="fl-chapter" aria-labelledby="s2-title">
          <div className="fl-shell">
            <div className="fl-split">
              {/* Copy */}
              <div>
                <h2 className="fl-chapter-title fl-reveal r2" id="s2-title">
                  A key with a leash.
                </h2>
                <p className="fl-chapter-body fl-reveal r3">
                  Fuin issues scoped keys from your wallet to anyone: an AI agent, a teammate, your
                  kid. Each key carries your rules: how much, how often, where to, for how long.
                  Spend freely within them. Crossing them is impossible.
                </p>
              </div>

              {/* Policy receipt. Editorial config-as-artifact (not a fake product screenshot).
                  Reads as the policy itself, in code form: the rules that bound the key. */}
              <div className="fl-reveal r3 fl-policy" role="figure" aria-label="Sample delegate policy">
                <div className="fl-policy-head">
                  <span className="fl-policy-tag">Policy / Trading Bot</span>
                  <span className="fl-policy-status">Live</span>
                </div>
                <dl className="fl-policy-rows">
                  <div className="fl-policy-row">
                    <dt>Daily cap</dt>
                    <dd>20 SOL</dd>
                  </div>
                  <div className="fl-policy-row">
                    <dt>Per-tx cap</dt>
                    <dd>2 SOL</dd>
                  </div>
                  <div className="fl-policy-row">
                    <dt>Allowed programs</dt>
                    <dd>Jupiter, Meteora</dd>
                  </div>
                  <div className="fl-policy-row">
                    <dt>Active window</dt>
                    <dd>06:00 / 22:00 UTC</dd>
                  </div>
                  <div className="fl-policy-row">
                    <dt>Expires</dt>
                    <dd>2026-06-04</dd>
                  </div>
                  <div className="fl-policy-row">
                    <dt>Holder</dt>
                    <dd>7yQq…3xKr</dd>
                  </div>
                </dl>
                <div className="fl-policy-foot">
                  <span>Enforced on-chain by program <code>E6Gk…AoSiy</code>.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 03 The Guarantee (Grid) ===================== */}
        <section className="fl-chapter" aria-labelledby="s3-title">
          <div className="fl-shell">
            <h2 className="fl-chapter-title fl-reveal r2" id="s3-title">
              Enforced on-chain, not on trust.
            </h2>

            <div className="fl-grid-4" style={{ marginTop: "clamp(2.5rem, 6vh, 4rem)" }}>
              <div className="fl-cell fl-reveal r1">
                <h3 className="fl-ct">Hard caps</h3>
                <p className="fl-cd">Per-transaction and rolling limits the key can never exceed.</p>
              </div>
              <div className="fl-cell fl-reveal r2">
                <h3 className="fl-ct">Allow-lists</h3>
                <p className="fl-cd">Funds move only to the destinations and programs you approve.</p>
              </div>
              <div className="fl-cell fl-reveal r3">
                <h3 className="fl-ct">Instant revoke</h3>
                <p className="fl-cd">Kill any key on-chain, in one click, forever.</p>
              </div>
              <div className="fl-cell fl-reveal r4">
                <h3 className="fl-ct">Provable</h3>
                <p className="fl-cd">Every action is checked by the program before it settles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 04 Who ===================== */}
        <section className="fl-chapter" aria-labelledby="s4-title">
          <div className="fl-shell">
            <h2 className="fl-chapter-title fl-reveal r2" id="s4-title">
              One primitive. Every delegation.
            </h2>
            <p className="fl-chapter-body fl-reveal r3">
              AI agents that touch real money. Teams paying contractors and bots. Families giving a
              kid their first wallet. Anyone who ever wanted to delegate money without surrendering
              it.
            </p>

            {/* Kept UsecaseFlow — wrapped on an obsidian surface panel */}
            <div className="fl-flow-panel fl-reveal r3">
              <UsecaseFlow />
            </div>
          </div>
        </section>

        {/* ===================== CLOSE / CTA ===================== */}
        <section className="fl-close" aria-labelledby="close-title">
          <div className="fl-shell">
            <h2 className="fl-close-title fl-reveal r1" id="close-title">
              Stop choosing between control and delegation.
            </h2>
            <p className="fl-close-sub fl-reveal r2">
              Give an agent the keys to act. Never the keys to everything.
            </p>
            <div className="fl-cta-row fl-reveal r3">
              <Link className="fl-pill fl-pill-solid" href="/dashboard/vaults">
                Launch app
              </Link>
              <Link className="fl-pill fl-ghost" href="/docs">
                Read the docs
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="fl-footer">
        <div className="fl-shell fl-footer-inner">
          <div className="fl-footer-brand">
            <Mark size={28} />
            <span className="fl-ft">Fuin. Restricted access on Solana.</span>
          </div>
          <nav className="fl-footer-links" aria-label="Footer">
            <Link href="/docs">Docs</Link>
            <a href="https://github.com/Fuin-Labs/Fuin">GitHub</a>
            <a href="https://x.com/fuinlabs">X</a>
          </nav>
          <span className="fl-footer-copy">© 2026 Fuin</span>
        </div>
      </footer>
    </div>
    </LenisProvider>
  );
}
