---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DESIGN"
version: "1.4.0"
owner: "product-design"
status: "implemented"
last_verified: "2026-11-04"
---
# DESIGN.md

Product experience + Moon UI doctrine. DNA canonical specs: [DNA/README.md](DNA/README.md). ADRs: [DECISIONS.md](DECISIONS.md) D-006 / D-007.

## Principles

| Rule | Detail |
|---|---|
| Purpose before decoration | Every element: hierarchy · state · meaning |
| Distinctive composition | No repetitive dashboard grids or generic hero templates |
| Coherent ecosystem | Shared engine. Distinct product identities. |
| Honest states | loading · empty · error · offline · permission · success — all required |
| Accessibility | WCAG AA · keyboard · focus · semantics · `prefers-reduced-motion` |
| Responsive | desktop → tablet → mobile |
| Asset canon | Preserve provenance. No discard without documented decision. Never depict ALLAH. |

## Seven Master DNA

Canonical specs: [DNA/README.md](DNA/README.md). ADR: [DECISIONS.md](DECISIONS.md) D-006.
One shared functional UI engine. No behavioral or accessibility forking across DNAs.

| ID | World | App |
|---|---|---|
| IMPERIUM LUMEN | A-L-L-A-H.COM / Empire of the Light | `apps/gate/` · `apps/dock/` |
| LUNAR CHRONICLES | MoonWitness Universe | `apps/id/` |
| ROCKSOUL | Silent-storyteller poster identity | `apps/harbor/` |
| SIMPUL NUSANTARA | Neighborhood network atlas | `apps/e-isp/` |
| NEXUS PARADOX | Diegetic future-game HUD, spatial technology | `apps/headquarter/` |
| RIOT ANARCHY | Manga · xerox punk · underground poster · controlled anti-design | `apps/moonsky/` |
| MYCELIUM | Biomorphic · generative · organic interconnected systems | `apps/jizz/` |

## Implementation Rules

- UI controls: `@moonwitness/ui` only. Blocked by `@moonwitness/lint` (`UI_PURITY`).
- Primitives engine: native-first. `<select>`, `<dialog>`, `<table>`, and `<form>` carry the behaviour; Base UI is added only inside `packages/ui` where native cannot meet a documented requirement. See D-012. Do not migrate the primitive layer during skin work.
- Token source: `packages/ui/src/theme.css` maps Tailwind colour and font utilities onto the skin tokens published by `SkinRoot`. Applications define no colour, type, or theme variables and paint no colour inline (`STYLE_PURITY`, `INLINE_STYLE_PURITY`).
- Markup colour: a Tailwind palette hue in app JSX is blocked by `PALETTE_PURITY`. Use a component variant, a composition block, or a mapped utility such as `text-muted-foreground`, so the world keeps authority over colour.
- Composition blocks: `Kicker`, `PageHero`, `SectionHeading`, `RouteShell`, `StatusMessage`, `DestinationCard`, `DestinationGrid`, `StatePanel`, and `SkipLink` live in `packages/ui/src/blocks/` and are styled in `skins.css` with a variant per world. They take props only: no fetching, no business logic.
- One world per application: gate and dock both present IMPERIUM LUMEN as the shared public entrance · headquarter NEXUS PARADOX · id LUNAR CHRONICLES · jizz MYCELIUM · moonsky RIOT ANARCHY · harbor ROCKSOUL · e-isp SIMPUL NUSANTARA. The lint gate permits the gate/dock duplicate through an explicit exception rather than silent re-declaration.
- Product-specific variants: only when behavior genuinely differs from shared.
- Inspect existing UI package before extending.
- Skin Laboratory comparison: shipped at `/skin-lab` in headquarter; it renders the shared blocks, not a private copy of them.

## Interaction Standards

| Concern | Rule |
|---|---|
| Control states | hover · focus · pressed · disabled · loading · success · error — all required |
| Motion | Communicates transition/feedback. Respects `prefers-reduced-motion`. Never obstructs. |
| VS Code agent | Explicit consent before workspace context. Edits reviewable before apply. |
| Headquarter remote | Manage paired devices/missions. No workspace path exposure. |

## Review Checklist

IA · task flow · visual hierarchy · responsive · a11y · keyboard/focus · loading/empty/error/offline · functional controls · performance · motion fallback · asset licensing · Moon UI consistency · **verify running implementation, not mockup**
