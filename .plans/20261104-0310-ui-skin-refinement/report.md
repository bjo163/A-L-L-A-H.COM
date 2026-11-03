---
title: "UI and MoonFrame Skin Refinement Audit"
status: completed
---

# UI and MoonFrame Skin Refinement Audit

## Scope and visual assessment

Reviewed the twelve existing routes across Dock, Headquarter, ID, and WORLD OBSERVATORY. The scores below are a visual snapshot, not an interaction or accessibility certification.

| Skin | App | Score | Assessment |
|---|---|---:|---|
| Imperium Lumen | Dock | 8/10 | Strong threshold composition and clear destination hierarchy. The shared desktop navigation is information-dense, but collapses before tablet widths. |
| Nexus Paradox | Headquarter | 8/10 | Distinct operations instrument with a clear section rail and route hierarchy. Dense workspaces still need live task interaction checks. |
| Lunar Chronicles | ID | 7/10 | Lunar artwork and form composition give the identity app a clear voice. Account loading and empty-session states now have explicit headings and announcements. |
| Mycelium | WORLD OBSERVATORY | 8/10 | The organic motif is recognizable, and the empty research state is explicit about the missing source connection rather than inventing records. |
| Rocksoul | No assigned app route | Not rated | Skin tokens and recipes are registered and tested, but there is no live app route to assess visually. |
| Riot Anarchy | No assigned app route | Not rated | Skin tokens and recipes are registered and tested, but there is no live app route to assess visually. |

The four assigned applications have distinct compositions and visual identities. A live six-skin comparison remains unverified for the two unassigned skins; this report does not claim that all six have been visually approved in an application.

## Verified evidence

- The responsive browser audit covered all twelve routes at 320, 360, 390, 768, 1024, 1280, and 1440 CSS pixels: zero horizontal overflow in the 84 route/width checks.
- At 320 pixels, the open-menu layout was inspected on all four app shells. The four ecosystem links and the controls fit without horizontal overflow.
- Skin contract tests passed: 10/10, including token contrast checks, six distinct skin recipes, server markup, labels, and reduced-motion coverage.
- `pnpm typecheck` passed across all 24 TypeScript projects.
- `pnpm --filter @moonwitness/id typecheck` and ESLint for the changed account page passed.
- The account loading view now has an `h1` and a `role="status"` region. The loaded account view has a primary heading and an explicit empty-session message.
- `git diff --check` passed.
- Production builds passed for Dock, Headquarter, ID, and WORLD OBSERVATORY.
- Production `next start` passed for all four browser preview ports: 3001, 3002, 3003, and 3004.
- Hydrated mobile-menu click-through passed at 390 pixels on Dock, Headquarter, ID, and WORLD OBSERVATORY.
- Escape closed the menu and restored focus to the menu control on all four app shells.
- Pause/resume visual effects and sound toggles changed the exposed button state on all four app shells.
- No horizontal overflow was observed at 390 pixels in production on all four app shells.

## Verification blockers and failures

- Development-preview HMR WebSocket failures were isolated to the development runtime. Production `next start` reruns attached React handlers and passed the interactive checks.
- `pnpm lint:arch` is blocked by an unrelated `ToolResult` declaration in `packages/arsy-plugin-llm-gateway/src/agent/loop.ts`.
- `pnpm docs:check` scored 90/100 and is blocked by missing `design.md` and `rules.md` in `.plans/20261104-0520-ir-translation-phase2-sdui-lowering`. Those unrelated plan files were left untouched.
- The Arsy production build gate and repository-wide documentation gate remain separate from this UI plan.

## Status

The route composition, responsive visual audit, production builds, and hydrated mobile interaction checks for the four UI applications are complete. Separate repository-wide baseline failures are recorded above and remain outside this UI scope.
