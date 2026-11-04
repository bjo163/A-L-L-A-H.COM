---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1950-ui-design-consistency"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
source: "UltraPlan: UI Design Consistency Wave (approved plan, 7 phases)"
---

# UI Design Consistency Wave

## 1. Problem statement

Four measured conditions made the five web applications look like five products:

1. two token systems ran in parallel: `@moonwitness/ui` published 32 `--mw-*` variables while every app declared its own `--background`/`--foreground` and mapped them to Tailwind through a local `@theme inline` block;
2. literal colour beat tokens: app stylesheets carried hex, rgb, and oklch values while `var(--mw-*)` was used in far fewer places;
3. the composition vocabulary was duplicated per app: five kickers, five heroes, six route shells, four section headings, four destination cards, four `.dark` blocks, and a skip link in one app only;
4. states and enforcement were hollow: three apps had no `error.tsx`, `loading.tsx`, or `not-found.tsx` although `QUALITY.md` required them, `apps/gate` was absent from CI, and the design-system tests were never wired to any command.

## 2. Acceptance criteria

- AC-1: one file defines colour, type, spacing, radius, shadow, and motion for every app; no app declares its own theme variables.
- AC-2: the shared composition vocabulary exists once in `@moonwitness/ui` as props-only blocks, with a per-world variant, and the five apps compose it.
- AC-3: every app ships the three route states built from one block, and every layout offers one skip link against a single landmark.
- AC-4: the gate ratchets the deviations and reaches an absolute rule: `STYLE_PURITY`, `INLINE_STYLE_PURITY`, `PALETTE_PURITY`, `STATE_PARITY`, `SKIN_ROOT` with empty baselines.
- AC-5: `apps/gate` builds in CI, `pnpm ui:test` runs in CI, and the design-system suite covers the new blocks.
- AC-6: one world per application is real, and contrast for every skin pair is measured, not claimed.
- AC-7: documentation, ADR, DNA mapping, and this plan folder describe the shipped state.

## 3. Out of scope

- New product features, data-model changes, and backend behaviour.
- Introducing a fourth theming system (token JSON, CSS-in-JS) or reverting to Base UI as the primitive engine.
- Visual redesign of the six DNA identities: the wave moves responsibility for existing appearance into the package, it does not restyle the worlds.

## 4. Definition of done

`pnpm lint:arch`, `pnpm lint`, `pnpm typecheck`, `pnpm docs:check`, `pnpm ui:test`, and the five application builds pass together, and every acceptance criterion has a verification record in `report.md`.
