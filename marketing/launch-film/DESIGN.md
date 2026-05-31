# DESIGN.md — Fuin Launch Film

> Brand reference for the HyperFrames launch film. Source of truth = the live landing system in `apps/vault/app/globals.css` (the `:root` v1 tokens) and `apps/vault/app/page.tsx`. The film must read as **the landing page in motion**, not a separate ad.

## Direction (locked 2026-05-31)
- **Hero (45s, 16:9):** Concept **A — "The Third Option"** (kinetic-type manifesto). Landing-page centerpiece + the Door-3 thesis film.
- **X cut (15s, 9:16):** Concept **B** hook — *"I told an AI to rug me. It couldn't."* — front-loading the REJECT snap.
- **Tone:** Apple-keynote-in-a-dark-room. Deliberate, expensive, restrained. Silence and holds are premium. No EDM/pump-video energy.

## Palette (verified OKLCH tokens — use `oklch()` directly; headless Chrome supports it)
| Role | Token | Value | Use |
|---|---|---|---|
| Background | `--ink` | `oklch(0.10 0.014 280)` | primary surface (cool near-black, faint blue-violet) |
| Void / letterbox | `--ink-deep` | `oklch(0.07 0.010 280)` | deepest black, the "drained" void |
| Raised surface | `--ink-rise` | `oklch(0.14 0.016 280)` | glass panel base, cards |
| Hairline | `--rule` / `--rule-soft` | `oklch(0.28 0.020 280)` / `oklch(0.20 0.015 280)` | rules, dividers, card borders |
| Ivory (type) | `--cream` | `oklch(0.97 0 0)` | primary display + body type |
| Ivory (monogram) | — | `#f2ece1` | the "F" mark fill (slightly warm) |
| Secondary / metadata | `--mute` | `oklch(0.55 0.020 280)` | captions, labels, the "cool" whisper (this replaces the invented "steel") |
| **THE accent (live)** | `--live` | `#c1e859` (lime) | **sparing only** — aperture, BOUNDARY-HELD pulse, the one breathing point of light |
| live glow / low | `--live-glow` / `--live-low` | `rgba(193,232,89,0.55)` / `rgba(193,232,89,0.12)` | the single disciplined glow |
| Warning (drain) | `--oxide` | `oklch(0.62 0.22 25)` | the draining-balance hairline ONLY; brick-red, never bright |

**Glow discipline:** one disciplined light source per scene; deep blacks; ONE accent. Lime is the *live-state* signal exactly as the site uses it — never a fill, never saturated washes. **Banned:** the dashboard emerald `#34d399`, the purple→green `--accent-grad`, and any teal/cyan/neon. (The lime decision was confirmed by the user; it stays as the single live accent.)

## Type
- **Display:** Bricolage Grotesque (headlines, title cards, CTA).
- **Body:** Geist.
- **Mono:** Geist Mono / Fragment Mono — the **policy-receipt** artifact, terminal text, captions, all numeric values.
- Pull the exact `@font-face`/next-font declarations from `apps/vault/app/layout.tsx`; copy local woffs from `apps/vault/app/fonts/` into the film project so renders don't depend on a CDN.

## Motion language (mirror the site so the film feels lifted from the page)
- **Word-stagger reveal:** the landing's anime.js entrance (≈45ms stagger, expo-out). Reuse for every headline.
- **Easing:** the site's expo-out curve `cubic-bezier(0.16, 1, 0.3, 1)` (confirm exact value in globals.css at build).
- **Breathing:** subtle infinite `scale 1.00→1.012` / opacity loops (5–6s) so still frames feel alive.
- **Policy receipt:** prints line-by-line with the existing mono caret-blink keyframe.
- **Monogram:** SVG `stroke-dashoffset` draw (reuse the `codex-draw` keyframe), aperture opens with one ivory→lime glint.

## Signature effects (the 100/100 finish)
- **Hero:** a Three.js full-screen **shader wipe** (simplex-noise displacement + smoothstep seam, seam glows ivory/lime only) that *switches worlds* from the drained void to the keyless-vault reveal (17–20s).
- **X cut:** the **REJECT snap** — a ~120ms WebGL chromatic-shear on the VO word "couldn't," snapping to dead-calm; timestamp-locked to the ElevenLabs word boundary.
- Liquid-glass panels via layered semi-opaque highlights (pre-baked blur, not live `backdrop-filter`, for deterministic headless render).

## Shader retint (IMPORTANT)
`apps/vault/app/components/AuroraShader.tsx` is the reusable FBM/simplex shader, but its color is hardcoded **teal/cyan** — exactly the banned crypto-color. Reuse the noise/raymarch *structure*; recolor the output to ivory `--cream` + cool `--mute`, with at most a faint lime rim. Verify and replace the color `vec3`s.

## Render constraints (HyperFrames)
- No photorealism / no actors / no filmed b-roll. Every vignette = UI mockup + kinetic type + iconography (the "kid" beat = a phone UI with a BLOCKED transaction, not a child).
- All motion transform+opacity-first for clean frame-by-frame determinism; seed any randomness from the deterministic frame clock, not `performance.now()`.
- Renders **silent** — VO + music muxed in post via ffmpeg.
- Deliverables: `fuin-hero-45s-16x9.mp4`, `fuin-x-15s-9x16.mp4`, + a poster WebP to `apps/vault/public/launch-poster.webp`.
