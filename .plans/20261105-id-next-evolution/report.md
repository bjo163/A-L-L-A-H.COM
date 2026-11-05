---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-BASELINE-REPORT"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# ID Next Evolution Baseline Report

## Delivered

- Mapped current ID routes, SDK auth methods, Better Auth proxy/configuration, identity/session models, cookie options, tests, and shared UI/state components.
- Added [`capability-matrix.md`](./capability-matrix.md) with implemented, partial, unsupported, and proposed boundaries.
- Confirmed LUNAR CHRONICLES remains the current ID skin. No product claims were added for recovery, federation, profile editing, privacy rights, device intelligence, or developer registration.
- Wave 0 tasks ID-001–008 and ID-010 are complete. ID-009 is in progress because source defaults and environment-variable names are known, but deployed origins and production callback configuration are not available.

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/id test` | 8 passed, 0 failed |
| `pnpm --filter @moonwitness/id typecheck` | Passed |
| `pnpm --filter @allah/arsy test` | 75 passed, 0 failed; includes Better Auth configuration, identity/session behavior, and NAS APIs. |
| `pnpm --filter @allah/arsy-orm test` | 32 passed, 0 failed |
| `pnpm --filter @allah/arsy build` | Passed |
| `pnpm docs:check` | Passed, 100/100 |
| `git diff --check` | Passed |

No browser, production-origin, visual-regression, or accessibility automation was run. Those gates remain pending rather than inferred from unit tests.

## Delivery boundary

This is a verified baseline, not completion of the full product roadmap. New routes are blocked where ARSY does not provide an accepted contract and runtime evidence. Keep unsupported features out of the active navigation.
