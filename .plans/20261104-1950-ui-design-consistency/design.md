---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1950-ui-design-consistency-design"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
---

# Design: One Token Source, One Vocabulary, One Gate

## 1. Layers

| Layer | Owner | Decides |
|---|---|---|
| `packages/ui/src/skins/registry.ts` | package | The six worlds: 32 tokens each, emitted by `getSkinStyle` onto `SkinRoot` |
| `packages/ui/src/theme.css` | package | How Tailwind utilities resolve: every colour and font utility maps to a `--mw-*` token |
| `packages/ui/src/skins.css` | package | Component and block appearance, including a `[data-moonframe-skin]` variant per world |
| `packages/ui/src/blocks/` | package | Composition vocabulary: hero, kicker, section heading, route shell, status, destination, state, skip link |
| `apps/<app>/src/app/globals.css` | application | Only application-specific layout, tuned through documented knobs |

An application never declares a colour, a font stack, a `--background` variable, or a private `mw-*` selector. That is what makes the world authoritative.

## 2. Block contracts

Blocks take props and nothing else: no fetching, no business logic, no state beyond presentation.

- `PageHero` `kicker · title · titleAs · summary · actions · media · mediaLayout(side|backdrop) · captionLeft · captionRight · titleId`. Backdrop mode lays the media under a scrim that ends at 94% canvas, which is where the title sits, so contrast is measured at the worst point.
- `RouteShell` `as(div|main) · kicker · title · description · actions · titleId · id`. With `as="main"` it carries the skip target and `tabindex="-1"`.
- `SectionHeading` `kicker · title · as(h1|h2|h3) · description · trailing · titleId`.
- `StatusMessage` `tone(info|success|warning|danger) · title · action · role`. Role defaults to `alert` for danger and `status` otherwise; the tone is also carried by a glyph, so it survives greyscale.
- `StatePanel` `kind(empty|loading|error|offline|permission) · cause · nextAction · title · label · action · role · as`. `cause` is required: a state without a reason is decoration. Loading uses `aria-busy` and a spinning marker that stops under `prefers-reduced-motion`.
- `DestinationCard` `index · role · title · description · status · href · external`. Without `href` it renders an `<article>`, so a route that does not exist is never presented as a link.
- `SkipLink` `targetId · label`, defaulting to the exported `mainLandmarkId`. The id is deliberately not an `mw-` name, because app code may not reference private package classes.

## 3. Application tuning instead of overrides

`.mw-route` reads `--mw-route-gutter`, `--mw-route-max`, `--mw-route-padding-block`, and `--mw-route-gap`. An app sets custom properties on its own class rather than fighting the package for specificity, which keeps `STYLE_PURITY`'s ban on app CSS naming `mw-*` selectors enforceable.

## 4. Enforcement

`packages/lint/src/check-architecture.mjs` adds four rules that all read `packages/lint/style-baseline.json`:

| Rule | Scans | Fails on |
|---|---|---|
| `STYLE_PURITY` | `apps/**/*.css` | hex, rgb, hsl, oklch, lab, hwb literals; `--background`/`--foreground`; Arial/Helvetica/system-ui fallbacks; any `mw-*` selector |
| `INLINE_STYLE_PURITY` | `apps/**/*.tsx` | `style={{}}` with a colour, background, border, outline, fill, stroke, or font-family key |
| `PALETTE_PURITY` | `apps/**/*.tsx` | a Tailwind hue utility such as `text-zinc-400` or `bg-red-950/40` |
| `STATE_PARITY` | `apps/*/src/app` | a missing `error.tsx`, `loading.tsx`, or `not-found.tsx` |
| `SKIN_ROOT` | `apps/*/src/app/layout.tsx` | no `SkinRoot`, unknown skin, or a world claimed twice |

Ratchet semantics: a count above the baseline fails and the message prints both numbers. Every baseline is now empty, so the rules are absolute.

## 5. Known gaps

- Tabs and progress have no shared implementation; DNA/07 records them as specification.
- `PALETTE_PURITY` covers palette hues, not raw hex inside `.tsx` data structures. The gate would only see those once they are painted inline, which is how headquarter's swarm role colours were found and replaced.
- Contrast is measured from the registry token pairs. Composited results over artwork or gradients still need the visual check that `SkinLaboratory` provides per world.
