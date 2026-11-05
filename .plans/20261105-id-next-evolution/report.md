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

## Subsequent verified slices

- ID-017 adds a shared `Dialog` confirmation before session revocation. A synthetic authenticated browser session verified that cancel keeps the session listed and confirmed revocation redirects the current session to sign-in only after ARSY responds.
- ID-071 adds `noindex, nofollow` metadata to account, login, registration, and initial-setup routes, with metadata tests covering titles and robots policy.
- Responsive browser checks at 360, 768, and 1440 CSS pixels found no horizontal overflow; the confirmation dialog remained within the viewport. The browser check used an in-memory local ARSY instance and synthetic credentials only, not production origins or accounts.
- ID-020 remains pending: the full keyboard, screen-reader, and reduced-motion audit has not been completed.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/id test` | 9 passed, 0 failed |
| `pnpm --filter @moonwitness/id typecheck` | Passed |
| `pnpm --filter @moonwitness/id build` | Passed |
| `pnpm lint:arch` | Passed |
| `pnpm docs:check` | Passed, 100/100 |
| `git diff --check` | Passed |
