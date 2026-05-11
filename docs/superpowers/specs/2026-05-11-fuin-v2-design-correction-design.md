# Fuin v2 — Design Correction Pass

**Date:** 2026-05-11
**Branch:** `feature/fuin-v2-swarm`
**Ship target:** hackathon submission, 2026-05-12
**Scope:** Approach A — reskin dashboard shell + polish landing/audit. No code review, no security review per author.

---

## 1 · Why

The v2 branch ships a redesigned landing (`/`) and a new audit explorer (`/audit/[pda]`) in an editorial dark theme (OKLCH `--ink/--cream/--ledger`, Vollkorn display + Schibsted Grotesk body). The dashboard (`/dashboard/*`) is still the v1 product visually: Geist sans-serif, glassmorphic cards with 24px radius and blur, framer-motion y-lifts, emerald/green/purple icon chips. The two systems coexist via a `body.v2` class opt-in. A judge navigating from landing → audit → dashboard would experience two distinct visual products mid-demo.

The fix is to bring the dashboard shell into the v2 design language without rewriting form-page layouts, and to clear five P1/P2 liabilities on the landing and audit pages.

## 2 · Out of scope

- Form-page layouts under `/dashboard/vaults/[nonce]/delegate/*` (inherit color tokens; layouts untouched).
- `/docs` (separate concern).
- Code-review and security-review skills (deferred per author).

## 3 · Approach

The token system in `apps/vault/app/globals.css` already declares both v1 and v2 palettes side by side. The leverage point is `apps/vault/app/dashboard/_lib/constants.ts` — every dashboard component reads from a single `COLORS` map. Rewiring those values to v2 CSS variables propagates v2 tokens across every subpage without touching component bodies.

After the token bridge, three component-level changes finish the shell reskin (layout, GlassCard, motion). Five touch-ups on the landing and three on the audit page close the polish gaps.

## 4 · Token bridge — `dashboard/_lib/constants.ts`

Rewire `COLORS` to point at v2 OKLCH tokens. Keep the same export shape so no callsites break.

| `COLORS.*` key | New value | Role |
|---|---|---|
| `bg` | `var(--ink)` | page background |
| `bgCard` | `var(--ink-rise)` | flat card surface |
| `bgCardHover` | `color-mix(in oklch, var(--ink-rise), var(--cream) 4%)` | hover lift surface |
| `bgInput` | `var(--ink-deep)` | form fields |
| `text` | `var(--cream)` | primary text |
| `textSecondary` | `var(--cream-soft)` | body |
| `textMuted` | `var(--mute)` | meta |
| `textDim` | `var(--rule)` | hint |
| `border` | `var(--rule-soft)` | hairlines |
| `borderLight` | `var(--rule)` | hairlines (active/hover) |
| `emerald` | `var(--ledger)` | primary accent |
| `emeraldSubtle` | `var(--ledger-low)` | accent surface |
| `emeraldBorder` | `var(--ledger)` | accent border |
| `emeraldGlow` | drop / `transparent` | not used in v2 |
| `green / greenSubtle / greenBorder` | a new desaturated v2 `--lichen` token (see §4.1) | status-ok |
| `red` | `var(--oxide)` | danger |
| `redSubtle` | `color-mix(in oklch, var(--oxide), transparent 80%)` | danger surface |
| `redBorder` | `var(--oxide)` | danger border |
| `purple / purpleSubtle` | `var(--mute) / var(--ink-rise)` | desaturated to neutral |
| `blue / blueSubtle` | `var(--mute) / var(--ink-rise)` | desaturated to neutral |
| `amber` | `var(--ledger)` | merge into ledger |

`GLASS_STYLE` becomes a flat card style:
- `backdropFilter: none`
- `borderRadius: 2px`
- `boxShadow: none`
- `backgroundColor: var(--ink-rise)`
- `border: 1px solid var(--rule-soft)`

`GLASS_CARD_HOVER` becomes:
- `backgroundColor: color-mix(in oklch, var(--ink-rise), var(--cream) 4%)`
- drop `y: -4`, drop `boxShadow`

### 4.1 · New `--lichen` token for status-ok

Add to `globals.css` `:root`:

```css
--lichen: oklch(0.70 0.10 145);
--lichen-low: oklch(0.70 0.10 145 / 0.14);
```

Used only where dashboard semantically needs a "success/active" state distinct from "CTA". The landing/audit pages keep using `--ledger` for active status (consistent with current audit page convention).

## 5 · Dashboard shell — `dashboard/layout.tsx`

Edits:
1. Remove the radial green glow div (lines 25-26 of current `layout.tsx`).
2. Remove the 32px grid mask div if it visually clashes; alternative: replace with a hairline `<div className="rule-h" />` at the top of `<main>` if needed.
3. Change `fontFamily: "'Geist', sans-serif"` on `DashboardShell` root to omit the inline override (let body inherit v2 body font).
4. Add `useEffect(() => { document.body.classList.add("v2"); return () => document.body.classList.remove("v2"); }, [])` so v2 typography utilities apply inside `/dashboard`.
5. Sidebar `DashboardSidebar` and `DashboardHeader`: replace any `borderRadius >= 8px` decor with flat borders. Convert any glass surfaces to `background: var(--ink-deep); border-right: 1px solid var(--rule-soft)`.

## 6 · `GlassCard` component

File: `apps/vault/app/dashboard/_components/ui/GlassCard.tsx` (path inferred from import; confirm in implementation).

Replace internal style with:
```ts
{
  background: "var(--ink-rise)",
  border: "1px solid var(--rule-soft)",
  padding: "24px",
  borderRadius: "2px",
}
```

Keep API surface identical so all callsites continue to work.

## 7 · Motion downgrade

In `dashboard/page.tsx` and any other page using `motion.div whileHover={{ y: -2, ... }}`:
- Drop the `y: -2` lift; the v2 system does not bounce surfaces.
- Replace with `whileHover={{ backgroundColor: "var(--ink-rise)" }}` (and a transition: 200ms).
- Page-level `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` stays — harmless.

## 8 · Iconography + copy register (dashboard)

In `dashboard/page.tsx` stat cards:
- Keep lucide icons (Database, Wallet, Bot) — they help functional clarity.
- Recolor all icon chips to a single accent: background `var(--ledger-low)`, border `var(--rule-soft)`, icon stroke `var(--ledger)`.
- Drop the per-icon emerald/green/purple variants.
- Labels ("Total Vaults", "Total Balance", "Active Delegates"): convert to lowercase with the `t-eyebrow` class for consistency with the landing/audit register. Numeral remains large; switch font to `var(--font-display), serif` (Vollkorn) to match landing Stat component.

## 9 · Landing page polish — `apps/vault/app/page.tsx`

### 9.1 · Footer links (P1)
Current footer hardcodes `https://github.com/Fuin-Labs/Fuin` three times and a fake `#evidence` for predicate registry. Execution step:
1. Before editing: run `curl -sI https://github.com/Fuin-Labs/Fuin | head -1` to verify repo reachability.
2. If reachable (200/301): keep "Architecture", "@fuin-labs/sdk-v2", "Swarm demo" pointing at the repo URL; change "Predicate registry" from `#evidence` to a non-link `<span>` with `style={{ opacity: 0.5, cursor: "default" }}` and "(soon)" suffix.
3. If not reachable: convert all four to non-link `<span>` with the same soon-style.
- "Solana Explorer" stays (valid).
- "Devnet status" stays (valid).

### 9.2 · SVG intent tree mobile fallback (P1)
Current `IntentTreeFigure` uses a fixed-viewBox SVG that becomes tiny on phones. Add a CSS-grid vertical fallback at `< lg`:
- Three stacked flat cards (root → execute → research+audit as siblings), connected by 1px vertical rules.
- Hide the SVG via `className="hidden lg:block"` and add the CSS fallback with `className="lg:hidden"`.

### 9.3 · CodeBlock syntax tinting (P2)
Lightweight tokenizer (no library). Scan each line for:
- Keywords: `import|const|await|new|from|return|function|export` → `var(--ledger)`.
- Strings: anything between `"..."` or `'...'` → `var(--cream-soft)`.
- Comments: already tinted via the `kind === "muted"` branch.
- Default text: stay `var(--cream-soft)`.

Implementation: a small `tokenize(line: string): {text: string, color: string}[]` helper that returns spans rendered inline.

### 9.4 · Footer grid (P3)
Change `Protocol`, `Developers`, `Network` columns from `md:col-span-2` (×3 = 6) plus brand `md:col-span-5` (= 11 of 12) to: brand `md:col-span-3` + each col `md:col-span-3` (= 12). Closes the trailing whitespace gap.

### 9.5 · Stat row copy (P3)
Tighten labels:
- "root authorization · all leaves derive from it" → "root authorization · all leaves derive"
- "sibling-instruction verifier · zero integration burden" → "sibling-ix model · zero integration"
- "agent hierarchies bounded only by parent scope" → "bounded only by parent scope"

## 10 · Audit page polish — `apps/vault/app/audit/components/AuditView.tsx`

### 10.1 · Back-to-landing (P1)
In `Header` component (line 115-153), the existing Fuin wordmark `Link` already points to `/`. Add a left-arrow glyph prefix inside that same link so it visually reads as "back": change the contents of the existing `<Link href="/">` from `Fuin` to `← Fuin`, applying `color: var(--mute)` to the arrow and `color: var(--cream)` (unchanged) to the wordmark. Keeps a single anchor; signals navigation without adding a duplicate link.

### 10.2 · Error CTA (P2)
In `ErrorPanel` (line 524-561), promote the "open demo" inline link to a primary button styled like the landing's "Read the live audit tree" — `background: var(--ledger); color: var(--ink); padding: 12px 20px; font-mono`.

### 10.3 · Node depth label (P3)
Replace cryptic `d{node.depth}` (line 327) with `depth · {node.depth}` rendered in the existing `t-eyebrow` style.

### 10.4 · Known dex labels (P3)
Add a small const map in `lib/fuin-rpc.ts` (or a new `lib/known-programs.ts`):
```ts
export const KNOWN_PROGRAMS: Record<string, string> = {
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter v6",
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Whirlpool",
  // …
};
```
In `Detail` predicate dex list (line 411-426), prepend the label inline before the truncated address.

## 11 · Risks

- **Contrast on dashboard status states.** Ledger-yellow + cream on ink has high luminance contrast but lower hue contrast than emerald. The `--lichen` token (§4.1) is the mitigation — confined to dashboard status indicators, the landing/audit pages keep `--ledger` for active.
- **Framer-motion lift removal** will feel less "alive" to anyone who used the v1 dashboard. Acceptable trade for v2 coherence; opacity-on-hover preserves interactivity feedback.
- **Wallet adapter modal** is currently styled with v1 hex (lines 229-251 of globals.css). Out of scope for this pass — the modal is small and rare in the demo path. If it surfaces in the demo, restyle in a follow-up.
- **Token bridge regressions:** anywhere a dashboard component reads `COLORS.emerald` expecting an emerald-green visual treatment specifically, the result is now ledger-yellow. Grep for `COLORS.emerald` across `dashboard/` to confirm no callsites depend on the specific hue (vs. "the primary accent").

## 12 · Order of execution

1. Add `--lichen` token to `globals.css` (§4.1).
2. Rewire `dashboard/_lib/constants.ts` (§4).
3. Rewrite `GlassCard` component to flat (§6).
4. Update `dashboard/layout.tsx` shell — remove decor, opt body into v2 (§5).
5. Update `dashboard/page.tsx` motion + iconography + copy (§7, §8).
6. Landing fixes in order: 9.1 (footer links) → 9.4 (footer grid) → 9.5 (stat copy) → 9.3 (CodeBlock tokenizer) → 9.2 (SVG mobile fallback).
7. Audit fixes: 10.1 → 10.2 → 10.3 → 10.4.
8. Spot-check `/dashboard/vaults`, `/dashboard/vaults/[nonce]`, `/dashboard/agent` in browser — confirm token inheritance worked, no callsites need patching.
9. Commit.

## 13 · Success criteria

- Navigating landing → audit → dashboard → dashboard subpages feels like one product. No font-family mismatch, no color-system mismatch, no surface treatment mismatch.
- All P1 items closed: dead footer links, mobile SVG, audit back-link.
- All P2 items closed: CodeBlock tinting, audit error CTA.
- All P3 items closed: footer grid, stat copy, audit depth label, known-dex labels.
- Demo flow rehearsal — judge clicks every visible link from landing → none 404s.
