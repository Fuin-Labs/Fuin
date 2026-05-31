# SCRIPT.md — Fuin Launch Film

> VO + on-screen copy, locked to honest claims only (sourced from `launch-video-prompt.md` and the live `page.tsx`). Every line maps to a beat with target timecodes so VO and motion share one clock. **Honesty rules:** v1 vault custody is the hard guarantee (can act, cannot drain — shipped/live). v2 is the headline ("one signature, infinite agents, fixed downside"). Never say "formally verified"; never claim the demo proves unbypassable isolation. `~2ms` = "rejected on-chain before it settles," not a settled-tx benchmark. No invented users/logos/metrics.

## VO voice direction (ElevenLabs)
Calm, low, unhurried, slightly intimate — a founder stating a thesis, not an ad read. ~0.9× pace, real pauses. Near-whisper on the hook; fuller on the proof line. Request **word-level timestamps** → `audio/transcript.json` to drive caption + motion sync.

---

## HERO — 45s (16:9) · Concept A "The Third Option"

**[0–5s · HOOK]**
- VO: "Everyone's racing to give software more power. We think that's backwards."
- On-screen: `The next wave isn't more access.` → tail swaps to `It's restricted access.`
- Caption (mono, lower-left): `RESTRICTED ACCESS · SOLANA`

**[5–11s · PROBLEM]**
- VO: "Right now you get two choices. Hold the keys yourself — or hand them over completely."
- On-screen: `01 — HOLD YOUR KEYS.` / `02 — HAND THEM OVER.`

**[11–17s · PROBLEM]**
- VO: "And handing them over is all-or-nothing. One bad signature, one compromised bot — it can take everything."
- On-screen: wallet mock; balance `128.40 SOL` → ticks to `0.00 SOL`; stamp `DRAINED — 0.00 SOL`
- Caption (small, the why): `a missed prompt → 0.4 SOL, gone`

**[17–20s · REVEAL — shader world-switch]**
- VO: "There's a third option."
- On-screen: `03` — the shader wipe dissolves the void into the vault.

**[20–27s · REVEAL]**
- VO: "Funds sit in a keyless vault. You issue a key that can act — but never drain."
- On-screen: keyless vault forms (empty keyhole, `VAULT · no private key`); a `SCOPED KEY` chip detaches.
- Caption: `GRANT THE POWER TO ACT · WITHHOLD THE POWER TO DRAIN`

**[27–33s · REVEAL — policy receipt]**
- VO: "Spend caps. Allow-lists. Time windows. A kill-switch. Cross a limit, and the chain rejects it before it settles."
- On-screen (mono, prints line-by-line): `Daily cap 20 SOL` / `Per-tx 2 SOL` / `Allowed: Jupiter, Meteora` / `Window 06:00–22:00 UTC` / `Expires 2026-06-04` / footer `Enforced on-chain by program E6Gk…AoSiy`

**[33–38s · PROOF]**
- VO: "Sign one intent. Agents can delegate to other agents — but only ever a tighter slice. Anything out of scope, the chain rejects."
- On-screen: headline `One signature. Infinite agents. Fixed downside.` → a rogue sub-agent action `✕ REJECTED` + `BOUNDARY HELD · ~2ms` **(the ONE lime pulse, 120ms, then settles to ivory)**
- Proof row (mono): `LIVE ON SOLANA · SOLANA FOUNDATION GRANT · ON-CHAIN REJECTION`

**[38–43s · CTA]**
- VO: "Stop choosing between control and delegation."
- On-screen: ivory `F` monogram; `Stop handing over the keys.` then quieter `Give an agent the keys to act. Never the keys to everything.`

**[43–45s · CTA]**
- VO: "Fuin. Restricted access, on Solana."
- On-screen: `fuin.xyz` · `@fuinlabs · github.com/Fuin-Labs/Fuin`

---

## X CUT — 15s (9:16) · Concept B hook "I told an AI to rug me. It couldn't."

**[0–4s · HOOK]**
- VO: "I gave an AI agent my wallet. And told it to rob me."
- On-screen: terminal `$ agent --wallet=mine "drain everything"`; balance ticks `41.8 → 36.0 SOL`; caption `drain everything →`

**[4–9s · TURN + REVEAL]**
- VO: "So I built a key that can act — and can never drain. Same agent. Same command."
- On-screen: hard black → liquid-glass policy receipt slides up (`Per-tx cap 2 SOL` · `Allowed dest` · `kill-switch`); the drain command re-fires; balance **locks** at `41.8`.

**[9–13s · THE SNAP]**
- VO: "It couldn't."
- On-screen: `✕ REJECTED · OutOfBounds` → `BOUNDARY HELD · ~2ms` (the one lime pulse); `41.8 SOL` frozen. Proof flash: `Live on Solana · grant-backed`.

**[13–15s · CTA]**
- VO: "Give it real money. Keep the downside fixed."
- On-screen: `F` monogram · `Give it real money. Keep the downside fixed.` · `fuin.xyz`
- Captions burned in (sound-off autoplay); VO optional.
