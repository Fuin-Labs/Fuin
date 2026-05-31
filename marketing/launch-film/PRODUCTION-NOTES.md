# Fuin Launch Film — Production Notes

**Status (2026-05-31):** 45s hero **built + rendered + visually verified** (silent). Branch `launch-film`.

## What exists
- `index.html` — the 45s hero composition ("The Third Option", Concept A), one standalone GSAP timeline, 9 beats. Lint **0/0**.
- `fonts.css` + `fonts/` — Bricolage Grotesque + Fragment Mono (Google woff2, downloaded local) + Geist (from apps/vault). Render-safe, no network needed.
- `DESIGN.md` / `SCRIPT.md` / `STORYBOARD.md` — the creative spec.
- `output/fuin-hero-45s-16x9.mp4` — the render (1920×1080, 30fps, ~2.4 MB, silent).
- `output/frames/v2_*.png` — QA stills (verified: hook, drain, third, vault, receipt, held, cta all clean + on-brand).

## How to (re)render
```bash
cd marketing/launch-film
npx hyperframes lint          # static checks (0/0 expected)
npx hyperframes render --output output/fuin-hero-45s-16x9.mp4
```
Render runs headless Chrome (software GL — no WebGL used), ~1 min for 1350 frames.

## Verified design
Obsidian `oklch(0.10 0.014 280)` bg · ivory `oklch(0.97 0 0)` + monogram `#f2ece1` · cool `--mute` secondary · **lime `#c1e859` confined to 3 moments only** ("restricted", receipt header, BOUNDARY HELD + monogram aperture) · oxide `oklch(0.62 0.20 28)` for the drain only. Bricolage display / Geist body / Fragment Mono.

## Next steps (not yet done)
1. **Voiceover (local, no API key)** — Kokoro TTS. Script is in `SCRIPT.md`.
   ```bash
   npx hyperframes tts vo-hero.txt --voice am_adam --output narration.wav   # calm/neutral; try af_nova / bm_george too
   npx hyperframes transcribe narration.wav                                  # word-level transcript.json
   ```
   Then add `<audio data-start="0" data-duration="45" data-track-index="2" src="narration.wav">` to the composition and **re-time beats to the VO word timestamps** (the proper sync pass), and re-render. Music bed (licensed/royalty-free) muxed under VO at ~−6 dB.
2. **15s vertical X cut** — Concept B hook ("I told an AI to rug me. It couldn't."), 1080×1920, the terminal → REJECT snap. New composition (or a `vertical.html`); render at 9:16.
3. **Landing embed** — `<video autoPlay muted loop playsInline poster="/launch-poster.webp">` in `apps/vault` `#fuin-landing`, reduced-motion gated; export a poster frame.
4. **Polish** — optional WebGL shader wipe (currently a CSS luminance sweep), larger/animated monogram draw, the breathing loop on the vault.

## Known notes
- The `validate` contrast "warnings" were caused by the (now-fixed) wipe bar overlapping text; re-run `validate` to confirm they clear, ignoring any residual ~1.02:1 flags on `opacity:0` off-screen scene text (false positives from the stacked-scene architecture).
- `.agents/skills/` (the installed hyperframes skill family) is in the repo root from `npx skills add` — gitignore if undesired.
