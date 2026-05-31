# STORYBOARD.md — Fuin Launch Film

> Per-beat visual direction for the HyperFrames compositions. One GSAP master timeline per file; beats = labeled segments. Mirror the landing's motion so the film feels lifted from the page. All values reference `DESIGN.md` tokens.

## HERO — `compositions/index.html` (45s, 1920×1080, 30fps)

**B1 · 0–5s · HOOK**
`--ink` field + the 26px radial dot-grid at ~6%. Bricolage display in `--cream` resolves word-by-word (anime.js 45ms, expo-out); the tail `It's restricted access.` snap-replaces in place; a 1px `--rule` hairline draws under it (scaleX from left). Whole frame breathes 1.00→1.012 (6s). Mono caption lower-left.

**B2 · 5–11s · PROBLEM**
Two `--mute` label rows counter-slide from opposite edges (x ±40→0, opacity 0→1), lock to a baseline grid; the `--mute` layer trails the `--cream` by ~80ms (CSS 3D translateZ parallax) for depth.

**B3 · 11–17s · PROBLEM**
Wallet UI mock fades up (Geist Mono balance `128.40 SOL`, row `agent · approve all`). An `--oxide` toggle flips APPROVED; balance counter (GSAP) eases then accelerates to `0.00` (~1.1s); on 0 a 90ms scale-punch + a thin `--oxide` edge flash; faint low-opacity "ash" particle field falls. Mono caption glitches in.

**B4 · 17–20s · REVEAL (signature)**
Three.js full-screen quad: a 0→1 progress uniform (GSAP-tweened) drives `mix(void, vault, smoothstep(edge−f, edge+f, vUv.x + simplexNoise))`; the moving seam adds an emissive ivory/`--live` line where the smoothstep derivative peaks. ~0.9s eased. This is the "switch worlds" cut, rhyming with the site's Digital Rain canvas.

**B5 · 20–27s · REVEAL**
Keyless vault assembles from 3 parallax glass layers (pre-baked blur 20→8px, opacity ramp); empty keyhole + `VAULT · no private key`. A `SCOPED KEY` glass chip detaches with a spring slide + a soft ivory particle bloom at separation. Breathing loop continues.

**B6 · 27–33s · REVEAL (policy receipt)**
The real `.fl-policy` artifact prints inside the glass: each row reveals with the mono caret-blink + a 1px hairline drawing under it; the `Enforced on-chain` footer underlines in `--mute`. Lift the markup field-for-field from `page.tsx`.

**B7 · 33–38s · PROOF**
Headline word-stagger `One signature. Infinite agents. Fixed downside.` A tight terminal/console card: rogue action ix scrolls in → a hard SNAP (90ms scale-down) + `✕ REJECTED` stamp + `BOUNDARY HELD · ~2ms`. **The single permitted `--live` moment:** a 120ms lime pulse on `BOUNDARY HELD`, then settle to `--cream`. Proof tags fade up on a baseline grid (no logos).

**B8 · 38–43s · CTA**
Return to `--ink-deep` void. The `F` monogram scales up center; stem draws via SVG stroke-dashoffset, aperture opens with one ivory→`--live` glint sweep. CTA type rises (the site's `.ln` rise stagger).

**B9 · 43–45s · CTA**
URL + handle lock to the lower third on a hairline (scaleX from left); dot-grid lifts one notch then settles; music resolves on the downbeat as the glint finishes.

### Hero care flags
- Shader wipe (B4): keep displacement subtle, seam strictly ivory/lime → premium not gamer; budget a render test.
- Particle fields (B3 ash, B5 bloom): cap count, low opacity → texture, not confetti; fixed seed for determinism.
- Liquid glass: pre-rasterize blur as stacked semi-opaque highlights (live `backdrop-filter` is inconsistent in headless Chrome).

## X CUT — `compositions/vertical.html` (15s, 1080×1920, 30fps)

**V1 · 0–4s · HOOK** — full-bleed `--ink` terminal; command self-types (anime.js per-char, `--mute` caret); balance counter ticks down (falling digits get a faint cool desaturate-flicker). 1.5% breathing on the terminal.

**V2 · 4–9s · TURN + REVEAL** — hard black cut on the drop; liquid-glass policy receipt slides UP via a vertical glass-refraction shader sweep (~600ms); rows print (`Per-tx cap 2 SOL` · `Allowed dest` · `kill-switch`); the drain command re-fires; balance **locks**.

**V3 · 9–13s · THE SNAP (signature)** — on the VO word "couldn't," a ~120ms WebGL chromatic-shear fires across the terminal (render the pane to a texture / DOM-to-canvas; offset R/G/B sample UVs by noise + a scanline tear, amplitude GSAP-tweened 0→1→0 on power4), then SNAPS to perfect stillness: `✕ REJECTED · OutOfBounds` + `BOUNDARY HELD` stamp (blur 1px→0, 3px y-kick), `~2ms` chip freezes, `41.8` does a tiny locked-bounce, one `--mute` ring pulses out. The lime pulse lands here. CSS fallback: clip-path shear + duplicated R/G/B-offset text layer (reads near-identical at speed).

**V4 · 13–15s · CTA** — clear to void; `F` monogram + Bricolage CTA lines + `fuin.xyz`. Captions burned in (center-safe area, larger type for mobile).

## Audio (post, both cuts)
- VO → `audio/narration.wav` + `transcript.json`; pin captions + key motion cues to word start-times in the GSAP timeline.
- Music: one ambient→epic bed (sub-bass drone + sparse pad rising to a restrained swell on B4 reveal / B7 proof, resolving soft on CTA). No crypto-EDM.
- Sound-design hits: the dry "drop" on DRAINED (B3); the single sharp **REJECT** transient (a deadbolt/lock click) on B7 / V3 — the only aggressive sound, landing on the lime pulse.
- Mux with ffmpeg (duck music ~6dB under VO); HyperFrames renders silent.
