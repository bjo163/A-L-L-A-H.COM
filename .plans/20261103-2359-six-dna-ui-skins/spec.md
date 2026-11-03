---
title: "Six DNA UI Skins"
status: completed
owner: "engineering"
---

# Six DNA UI Skins

## Problem

`@moonwitness/ui` currently exposes a single set of hard-coded dark and amber recipes. The six approved Master DNA worlds have no runtime skin implementation, making the shared UI unable to express their distinct visual languages consistently.

## Goal

Implement a typed, SSR-safe skin foundation in `packages/ui` for all six approved DNA worlds, and assign an approved skin to each existing consumer app in scope.

## Scope

- Implement `imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, and `mycelium` as package-owned skin definitions and shared component recipes.
- Keep behavior, semantic markup, accessible names, keyboard interaction, focus visibility, and form state behavior independent from skin selection.
- Apply app roots as follows: Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and Jizz / Mycelium.
- Exclude `apps/web`, which does not currently consume `@moonwitness/ui`.
- Defer the Skin Laboratory and app-specific page-composition redesign.

## Requirements and acceptance criteria

1. The package exports a stable, typed skin ID contract, registry, token definitions, and a server-rendered root API.
2. Missing skin IDs resolve deterministically to the documented safe default. Invalid runtime IDs are visibly reported and resolve safely. No browser-only detection or preference persistence is introduced.
3. Each skin has independent semantic color, typography, spacing/density, geometry, material/depth, and motion tokens, plus component recipes reflecting its DNA beyond palette changes.
4. Existing shared component APIs and behavior remain compatible. The existing Base UI foundation remains; no second component framework or token engine is added.
5. Skin styling is loaded consistently by each of the four in-scope Next.js consumers and scoped to the selected root.
6. Components retain contrast, visible focus, keyboard use, responsive reflow, touch affordances, and reduced-motion behavior in each skin.
7. Type checks, builds for affected applications, and documentation checks pass. Any unverified visual comparison is reported as pending.
8. The DNA status documentation distinguishes package implementation and app assignment from Skin Laboratory comparison and full verification.

## Out of scope

- Skin Laboratory or a visual comparison route.
- Rewriting each app's page composition or replacing app-local Tailwind styling.
- `apps/web`, because it does not depend on the shared UI package.
- New animation, icon, or component framework dependencies.
- Replacing Base UI or duplicating application business logic.
