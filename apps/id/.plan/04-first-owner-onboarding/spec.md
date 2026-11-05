---
title: "First Light — Initial Owner Onboarding"
status: "proposed"
owner: "engineering"
---

# First Light — Initial Owner Onboarding

## Goal
Make one-time initial-owner setup clear and fail-safe while ARSY retains atomic setup and privilege authority.

## Context and authority
MoonWitness ID is the human-facing identity gateway. LUNAR CHRONICLES is its approved visual DNA. ARSY alone owns canonical identity, credentials, authentication, sessions, tenant, roles, authorization, and initial-owner atomicity. ID must consume existing typed SDK contracts.

## Dependencies
- `00-contract-baseline`
- `01-lunar-visual-foundation`

## Scope
Modify only the existing ID route/components/styles/tests needed for this outcome. Inspect source and shared exports first. Keep implementation narrow and reversible.

## Non-goals
- No auth backend, database, schema, migration, cookie, CORS, or identity policy change.
- No production, DNS, proxy, TLS, secret, or deployment operation.
- No new identity provider, role editor, tenant selector, or shadow store.
- No invented API fields, route, SDK method, or capability.

## Acceptance criteria
- [ ] No form appears while setup status is unknown or closed.
- [ ] Only ARSY decides availability and atomic completion.
- [ ] Regular registration cannot acquire superuser through this UI.
- [ ] A created account is never asked to repeat onboarding because sign-in failed.
- [ ] All async/error states are explicit and tested.

## Definition of done
All tasks have evidence; focused tests and package gates actually run; docs/report are truthful; no security boundary was crossed. Mark completed only when every criterion is proven.
