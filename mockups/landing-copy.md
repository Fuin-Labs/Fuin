# Landing Page Copy — Two Variants

Two full landing drafts. Pick one on Apr 24 evening once DM replies are in (§11.4 decision gate: one compliance-officer reply → Cut B · Thiel, no reply → Cut A · Jobs).

Both are designed to drop into `apps/vault/app/page.tsx` (the existing landing route) with minimal structural change — headline, sub, three-up value section, social proof row, and footer lockup.

---

## Variant A · Jobs framing — "Reveal"

**For**: prosumer / builder / curious-retail audience. No Apr 24 compliance reply needed.
**Tone**: cinematic, restrained, human. Sentences short. Numbers specific. Zero jargon in the hero.

### Hero

> # Private by default. Visible when you ask.
>
> Give your AI agent a spending allowance — with rules no one else can see.
> Powered by Solana and Arcium MPC.

Primary CTA: **Create a vault →**
Secondary CTA: *Watch a 90s walkthrough*

### Sub-hero strip (single line, centered, small type)

`Backed by the Solana Foundation · Built with Arcium · Superteam India`

### Three-up value props

Below the hero, evenly spaced, each with a small icon (lock, tier badge, coin), title, and one supporting sentence.

1. **🔒 Private policies**
   Your caps, allowlists, and daily spend live encrypted on Solana. Only you — and the MPC network — see the rules.

2. **🤖 Reputation-aware**
   Every agent has an identity. Well-behaved agents earn autonomy. Misbehaving ones stay sandboxed.

3. **💸 Built for the agent internet**
   Any AI agent with a Fuin credential can pay for services. Any service can require one. The rest is plumbing.

### Demo block

Full-width dark strip with the Reveal gesture embedded. Caption under the demo:

*A guardian taps her vault. Values decrypt locally. Competitors watching the block explorer see only a commitment hash.*

### Social proof row

A single row of six logos: Solana Foundation · Colosseum · Superteam India · Arcium · Pyth · Coinbase x402. Muted (40% opacity), no captions — just quiet legitimacy.

### Closing band

> ## In two years, 99% of on-chain transactions will come from AI agents.
>
> Fuin is the seatbelt.

Primary CTA again: **Create a vault →**

### Footer tagline

`Rules encrypted on-chain. Revealed locally with your key.`

---

## Variant B · Thiel framing — "Compliance-grade agent authority"

**For**: family-office / prop-desk / compliance-first audience. Requires ≥1 compliance-officer reply on Apr 24 DMs.
**Tone**: measured, precise, institutional. Uses the words your target uses — *delegated authority, audit, liability, policy, custodian*. No emoji. No exclamation points.

### Hero

> # The first on-chain primitive where policy liability transfers to code.
>
> For compliance officers, prop desks, and family offices managing AI-driven
> capital. Delegate agent authority with rules that are enforced, auditable,
> and invisible to the market.

Primary CTA: **Request a briefing →**
Secondary CTA: *Read the technical spec*

### Sub-hero strip

`Solana Foundation-backed · Arcium MPC-enforced · Built on Solana Token Extensions`

### The problem statement block (above the fold, replaces the three-up)

Three short paragraphs with a subtle left border. No icons. Large numbers, small body text.

> **Today, delegated agent authority is a choice between two losses.**
>
> *Custodial platforms* concentrate liability at a single party — Turnkey, Privy,
> Coinbase Agentic — which is auditable but non-composable and regulator-exposed.
>
> *Public on-chain wallets* expose every policy parameter — caps, allowlists,
> spend history — to every observer with a block explorer.
>
> Neither lets a compliance officer sign off the way they sign off on a
> custodian: *"the enforcement mechanism is trustworthy, and the data is
> not public."* Until now.

### The three enterprise pillars

Instead of the Jobs three-up, this variant uses three longer institutional statements, each with a short evidentiary caption.

1. **MPC-enforced policy, not trust-enforced policy.**
   Spending caps, per-transaction limits, venue allowlists, and risk thresholds live as Arcium ciphertexts. The Cerberus MPC protocol — which requires only one honest participant out of N — evaluates them. No single party, including Fuin, can unilaterally override a rule.
   *Evidence: Cerberus whitepaper; Arcium Mainnet Alpha live since Feb 2026.*

2. **Auditable by the guardian. Invisible to the market.**
   The same key that issued a delegate can decrypt its state for audit, reporting, or regulator disclosure. A counterparty with a block explorer sees commitments only — no amounts, no allowlists, no histograms to reconstruct a strategy from.
   *Evidence: Arcium commitment scheme; selective-disclosure patterns adopted by Privacy Cash (compliance-first) and Umbra.*

3. **The bridge between custody and code.**
   Every Fuin delegate is bound to a verifiable identity on Solana's Agent Registry (ERC-8004 port). Reputation, feedback, and revocation are public and queryable — so policy transfer to code can coexist with the accountability regulators expect.
   *Evidence: 8004-solana on mainnet; Proof-of-Agent identity standard.*

### Social proof band

Two rows. First row: logos of Solana Foundation, Colosseum, Superteam, Arcium, Pyth, Coinbase x402. Second row: a single pull-quote block.

> *"[pull quote from the compliance officer / prop-desk lead / family-office CTO who replies to the Apr 24 DM — with permission]"*
>
> — {Name}, {Title}, {Firm}

If no on-record quote lands: delete the quote block entirely. The logos are enough.

### The technical strip (optional, below the fold)

Link-styled list, one line each:

- Arcis circuit · `check_spending_policy` · [GitHub]
- Anchor handler · `execute_confidential_transfer` · [GitHub]
- x402 middleware · `@fuin/x402-middleware` · [README]
- Agent Registry integration · 8004-solana · [docs]

### Closing band

> ## "They promised us flying cars and we got 140 characters."
>
> The agent economy is the next place that question gets answered. Either
> delegated authority becomes provable in code — or the incumbents keep
> their monopoly on sign-off. Fuin is the bet that code wins.

Primary CTA: **Request a briefing →**

### Footer tagline

`Enforced by MPC. Auditable by the guardian. Opaque to the market.`

---

## Decision table

| Condition at Apr 24 EOD | Ship |
|---|---|
| ≥ 1 on-record compliance-officer reply | **Variant B** (Thiel) — with their quote in the social-proof band |
| ≥ 1 positive but off-record conversation (no quote) | **Variant B** without the quote block |
| Zero replies, or only builder/retail replies | **Variant A** (Jobs) |
| Mixed signal, unclear direction | **Variant A** — easier to pivot to B in May than the other way |

## Implementation notes

- Both variants are copy-only. Layout is the existing `apps/vault/` structure; swap the hero markup, the middle band, and the footer tagline. Colors/typography unchanged.
- The Reveal gesture demo at `mockups/reveal.html` embeds cleanly into Variant A's demo block. For Variant B, embed the *public view* of the same mockup (toggle already built in) — the institutional audience cares about what outsiders see.
- The `frontier-hackathon.md §10.7` headline ("The private programmable wallet for the agent economy") is **neither variant**. Kill it per §11.3 "LOST — original dead-internet-theory framing."
- Both variants preserve the `Backed by the Solana Foundation · Superteam India` credential — that's the single most durable piece of social proof on the page and does not depend on narrative choice.
