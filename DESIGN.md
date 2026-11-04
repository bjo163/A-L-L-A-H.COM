---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DESIGN"
version: "1.2.0"
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

## Six Master DNA

Canonical specs: [DNA/README.md](DNA/README.md). ADR: [DECISIONS.md](DECISIONS.md) D-006.
One shared functional UI engine. No behavioral or accessibility forking across DNAs.

| ID | World | App |
|---|---|---|
| IMPERIUM LUMEN | A-L-L-A-H.COM / Empire of the Light | `apps/dock/` |
| LUNAR CHRONICLES | MoonWitness Universe | `apps/id/` |
| ROCKSOUL | Silent-storyteller poster identity | — |
| NEXUS PARADOX | Diegetic future-game HUD, spatial technology | `apps/headquarter/` |
| RIOT ANARCHY | Manga · xerox punk · underground poster · controlled anti-design | — |
| MYCELIUM | Biomorphic · generative · organic interconnected systems | `apps/jizz/` |

## Implementation Rules

- UI controls: `@moonwitness/ui` only. Blocked by `@moonwitness/lint`.
- Primitives engine: Base UI. Do not assume Radix. Do not migrate primitive layer during skin work.
- Product-specific variants: only when behavior genuinely differs from shared.
- Inspect existing UI package before extending.
- Skin Laboratory comparison: pending.

## Interaction Standards

| Concern | Rule |
|---|---|
| Control states | hover · focus · pressed · disabled · loading · success · error — all required |
| Motion | Communicates transition/feedback. Respects `prefers-reduced-motion`. Never obstructs. |
| VS Code agent | Explicit consent before workspace context. Edits reviewable before apply. |
| Headquarter remote | Manage paired devices/missions. No workspace path exposure. |

## Review Checklist

IA · task flow · visual hierarchy · responsive · a11y · keyboard/focus · loading/empty/error/offline · functional controls · performance · motion fallback · asset licensing · Moon UI consistency · **verify running implementation, not mockup**
