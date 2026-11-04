---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1950-ui-design-consistency-rules"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
---

# Rules: UI Consistency Invariants

## R-A Appearance has one source

Colour, type, spacing, radius, shadow, and motion come from `packages/ui/src/skins/registry.ts` and reach markup through `theme.css` and `skins.css`. An app stylesheet adds no colour literal, no font fallback, no `--background`/`--foreground`, and never names an `mw-*` selector. Enforced by `STYLE_PURITY` with an empty baseline.

## R-B Markup colour is never a palette hue

`text-zinc-400`, `bg-red-950/40`, and friends are forbidden in app JSX (`PALETTE_PURITY`). A palette utility cannot be re-themed, so the world stops deciding the look the moment one appears. Use a component variant, a block, or a mapped utility such as `text-muted-foreground`.

## R-C Paint is not inline

Colour and type never appear in `style={{}}` (`INLINE_STYLE_PURITY`). An inline paint cannot be themed, animated per world, or overridden by a skin. Layout-only inline values remain allowed.

## R-D The vocabulary exists once

Hero, kicker, section heading, route shell, status message, destination card, state panel, and skip link are implemented in `packages/ui/src/blocks/`. An application that needs one of these composes the block; a genuinely different behaviour becomes a prop or a new block in the package, never a second copy in an app.

## R-E Every route states its non-happy paths

Each app ships `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel` (`STATE_PARITY`). A state panel names its cause and the next action, announces through `role="status"` or `role="alert"`, and never signals by colour alone.

## R-F One world per application

Each app renders `SkinRoot` with one skin from `skinIds`, and no two apps claim the same skin (`SKIN_ROOT`). Current assignment: dock imperium-lumen, headquarter nexus-paradox, id lunar-chronicles, jizz mycelium, gate rocksoul. RIOT ANARCHY remains unassigned and is proven in the Skin Laboratory.

## R-G Accessibility parity is not per app

The skip link, focus ring, labelled controls, 44px targets, and reduced-motion behaviour come from the package and are identical in all six worlds. Contrast for each skin's token pairs is measured with `pnpm ui:contrast`; a claim without a printed ratio does not count as verified.

## R-H The ratchet only tightens

A finding count is recorded in `packages/lint/style-baseline.json` and may only fall. When it reaches zero, the entry is deleted so the rule becomes absolute. Deleting an entry without removing the findings is a gate regression.

## R-I A rule that cannot fire is a bug

`STYLE_PURITY` originally matched hex with `#\h{3,8}`, which in JavaScript is the letter `h` repeated, so it never matched a colour and reported a clean gate over real findings. When a rule reports PASS unexpectedly, prove it against a known bad input before trusting the number.
