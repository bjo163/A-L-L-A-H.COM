---
title: "Personal Orbit — Account Identity Space"
status: "completed"
owner: "engineering"
---

# Personal Orbit — Account Identity Space

## Goal
Make /account a personal identity composition that separates identity facts, trust controls, and product destinations.

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
- [x] Only API-supported safe identity fields are displayed.
- [x] Identity, sessions, and destinations have distinct hierarchy.
- [x] No fake stats, unsupported profile editing, or internal IDs as decoration.
- [x] Loading/empty/expired/unavailable/error states are actionable.
- [x] Sign-out success follows authoritative confirmation.

## Definition of done
All tasks have evidence; focused tests and package gates actually run; docs/report are truthful; no security boundary was crossed. Mark completed only when every criterion is proven.
