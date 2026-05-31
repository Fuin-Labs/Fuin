# 2026-05-31 — Launch Video + Positioning Ideas

> Saved during the post-Toly ideation session. Decision: pursue **Door 1** (build the agent-isolation layer, "Percolator for agents") + **Door 3** (reposition / narrative). First concrete asset = a product launch / demo video for the landing page + X. (Landing exists; no video yet.)

## Tool: HyperFrames (chosen)

- **What it is:** HeyGen's open-source HTML→video engine. You (or an AI agent) write animated HTML/CSS — GSAP / anime.js / Three.js / Lottie / WAAPI — and it renders a **deterministic MP4** frame-by-frame via headless Chrome + ffmpeg. Apache-2.0, no per-render fees. Needs Node 22+ and ffmpeg.
- **Driven by Claude Code** (also Cursor / Gemini / Codex). Install the skill once: `npx skills add heygen-com/hyperframes`.
- **Website→video pipeline** (7 steps): point it at a URL → `capture/` (screenshots, design tokens, fonts) → `DESIGN.md` → `SCRIPT.md` (hook / story / proof / CTA) → `STORYBOARD.md` (per-beat direction) → VO + timing (`narration.wav` + word-level `transcript.json`) → `compositions/*.html` (GSAP beats) → validate snapshots → render.
- **Commands:** `npx hyperframes init`, `npx hyperframes preview` (live reload), `npx hyperframes render --output launch.mp4`. Prompt format: `"<duration>-second <type>. <creative direction>."` e.g. `"25-second product launch. Apple keynote energy. Cinematic, dark, minimal."`
- **Strengths:** typographic / motion-graphics / data-viz, branded text reveals, deterministic + cheap (great for iterating + multiple cuts). **Limits:** NO photorealistic video, NO built-in audio (pair with **ElevenLabs** for VO/music; Claude syncs via the word-level timestamps + ffmpeg).
- **Why it fits Fuin:** the video reuses the existing landing design system (obsidian palette, ivory **F** monogram, Vollkorn / Schibsted / Fragment Mono, anime.js motion) so it looks native to the site. The "manifesto" register (Linear / Vercel Ship / Stripe) is exactly HyperFrames' sweet spot.

## Story / message

- **Hook (thesis):** "The next wave isn't *more* access — it's *restricted* access. And I'm building for it."
- **True claim to anchor on (v1 vault custody):** spend within on-chain rules, *can never drain the account*. Keep hard guarantees at the v1 level (true today). Avoid "formally verified / unbypassable" claims (see `project_v2_custody_gap`).

## Vignettes — the "give a wallet to everyone" idea

- **Kid:** a wallet that can't be scammed or drained — allowance caps, approved merchants, parent kill-switch.
- **Worker / contractor:** scoped spending access, hard caps, instant revoke.
- **Mainnet tester (strong / novel B2D use case):** a tester QA-ing your app on *mainnet* — hand them guardrailed, restrictive access so they test with real funds but a bounded blast radius.
- **AI agent:** the original beachhead — bounded autonomy, can act but can't rug you.

## New positioning analogy: Fuin as "UPI Circle"

- **UPI Circle (India):** a primary account holder shares *scoped* access to their bank account with family, who transact via UPI from that account within set limits.
- **Fuin = the crypto-native analog:** share scoped wallet access with your *circle* (family, team, agents) **without sharing the keys** — bounded, revocable, on-chain. This is the most normal-person-legible framing of the entire pitch, and a clean bridge from the agent beachhead to the consumer story. Extends `docs/target-users.md`.

## Research sources (HyperFrames)

- https://hyperframes.video/ — official ("Write HTML. Render an MP4.")
- https://github.com/heygen-com/hyperframes — repo / setup
- https://hyperframes.mintlify.app/guides/website-to-video — website→video guide
- https://github.com/heygen-com/hyperframes-launch-video — launch-video example
- https://www.mindstudio.ai/blog/generate-ai-videos-claude-code-hyperframes-elevenlabs — Claude Code + HyperFrames + ElevenLabs pipeline

## Video Concepts (generated 2026-05-31)

Three 45s premium HyperFrames concepts, each with a 15s 9:16 X cut. (Full storyboards generated in-session.)

### A — "THE THIRD OPTION" (the manifesto)
Cold kinetic-typography, Linear/Vercel-Ship energy. Open black: "The next wave isn't more access. It's RESTRICTED access." Problem = balance counter → 0. Reveal = a Three.js shader wipe that *switches worlds* into the keyless vault; the policy receipt prints its limits in mono. Proof = BOUNDARY HELD ~2ms. CTA = "Stop handing over the keys."
- **Signature:** the shader world-switch wipe (ivory/steel seam).
- **Best for:** evergreen landing hero + the Door-3 thesis. Most premium, safest brand fit. Risk: most abstract.

### B — "BOUNDARY HELD" (I told an AI to rug me. It couldn't.)
Visceral, proof-driven, founder origin. Terminal: `agent "drain everything"`, balance ticking down → black. Same command under Fuin → chain REJECTS, balance frozen, "BOUNDARY HELD ~2ms."
- **Signature:** the REJECT snap — a 120ms WebGL glitch on the VO word "couldn't," then dead-calm, timestamp-locked to VO.
- **Best for:** the X scroll-stopper. Risk: glitch shader is the one fiddly beat (CSS fallback exists).

### C — "THE CIRCLE" (one wallet, everyone you trust / UPI Circle)
Warm, broad, human. One vault; a constellation of breathing glass cards (KID/CONTRACTOR/TESTER/AGENT) orbiting it, each showing limits, each gracefully blocked. Lands "Share access with your circle. Not your keys."
- **Signature:** orbiting liquid-glass permission-cards + the graceful "blocked" micro-interaction.
- **Best for:** reaching beyond Solana-natives (UPI bridge). Risk: heaviest render; widest = least sharp for the dev beachhead.

**Recommendation:** build **A** as the 45s hero (the Door-3 thesis film + evergreen landing centerpiece; already contains the proof beat); use **B's hook** for the 15s X cut (most scroll-stopping). Hold **C** for a later consumer wave. One production, two cuts.

## Production plan (essentials)
- Lives at `/marketing/launch-film/` — deliberately OUTSIDE apps/* and packages/* so pnpm/turbo ignore it.
- Machine ready: Node v24 + ffmpeg installed. Skill not yet installed → `npx skills add heygen-com/hyperframes`.
- Flow: install → `npx hyperframes init` → `npx hyperframes capture --url http://localhost:3000` (capture the live landing so the film inherits the brand) → author DESIGN.md/SCRIPT.md/STORYBOARD.md → build compositions/index.html (ONE GSAP master timeline) → `npx hyperframes preview` + iterate per beat → ElevenLabs VO + word-timestamps + music → ffmpeg mux (HyperFrames renders silent) → render hero 16:9 + X cut 9:16 + poster → embed in apps/vault landing (`<video autoplay muted loop playsInline poster>`, reduced-motion gated) + X launch thread (lead from the Door-3 narrative).
- Supporting skills: `gsap-timeline`, `gsap-core`, `liquid-glass-design`, `web-animation-design`, `motion-designer`. (All GSAP plugins now free for commercial use post-Webflow.)
- Effort: ~3–5 focused days; render is minutes, taste-iteration is the cost.

## Two flags from the repo (decide before building)
1. **Retint the shader:** `apps/vault/app/components/AuroraShader.tsx` is hardcoded teal/cyan — exactly the crypto-color to avoid. Reuse its FBM/raymarch structure, recolor to ivory/cold-steel.
2. **Lime vs. brand (DECISION NEEDED):** the live site uses electric lime `#c1e859` as its single "live line" accent (`globals.css --live`, logo aperture, Digital Rain) — but stated taste is "no bright green (cheap/generic crypto)." Decide: pure ivory+cold-steel, OR keep lime as the one disciplined live accent (used sparingly as the site does). See [[fuin-launch-video-and-positioning]].
