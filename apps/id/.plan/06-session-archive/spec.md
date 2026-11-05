---
title: "Session Archive — Revocable Trust"
status: "completed"
owner: "engineering"
---

# Session Archive — Revocable Trust

## Goal
Make sessions inspectable and revocation precise, accessible, and confirmed by ARSY.

## Context and authority
MoonWitness ID is the human-facing identity gateway. LUNAR CHRONICLES is its approved visual DNA. ARSY alone owns canonical identity, credentials, authentication, sessions, tenant, roles, authorization, and initial-owner atomicity. ID must consume existing typed SDK contracts.

## Dependencies
- `00-contract-baseline`
- `01-lunar-visual-foundation`
- `05-personal-orbit-account`

## Scope
Modify only the existing ID route/components/styles/tests needed for this outcome. Inspect source and shared exports first. Keep implementation narrow and reversible.

## Non-goals
- No auth backend, database, schema, migration, cookie, CORS, or identity policy change.
- No production, DNS, proxy, TLS, secret, or deployment operation.
- No new identity provider, role editor, tenant selector, or shadow store.
- No invented API fields, route, SDK method, or capability.

## Acceptance criteria
- [x] Only fields present in ActiveSession and approved for display are shown.
- [x] Current session is unmistakable and accessible.
- [x] Failed revoke leaves session visible.
- [x] Successful revoke updates UI only after ARSY confirmation.
- [x] Current-session revoke safely ends local session.

## Definition of done
All tasks have evidence; focused tests and package gates actually run; docs/report are truthful; no security boundary was crossed. Mark completed only when every criterion is proven.
