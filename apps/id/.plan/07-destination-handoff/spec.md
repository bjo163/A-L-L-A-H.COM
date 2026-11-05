---
title: "Destination Orbit — Safe Ecosystem Handoff"
status: "proposed"
owner: "engineering"
---

# Destination Orbit — Safe Ecosystem Handoff

## Goal
Present connected products with clear purpose and safe navigation without implying links grant permissions or universal SSO is proven.

## Context
MoonWitness ID is the human-facing identity gateway; LUNAR CHRONICLES is its visual DNA. ARSY alone owns canonical identity, authentication, session state, tenant, roles, and authorization. Destination apps authorize their own protected operations.

## Dependencies
- `00-contract-baseline`
- `01-lunar-visual-foundation`
- `05-personal-orbit-account`

## Scope
Present connected products with clear purpose and safe navigation without implying links grant permissions or universal SSO is proven. Inspect existing routes, shared types, SDK contracts, and endpoint configuration before changing code. Keep the implementation bounded to ID UI and tests.

## Non-goals
- No backend, database, schema, migration, cookie, CORS, DNS, proxy, TLS, secrets, or deployment changes.
- No new identity authority, auth provider, local token store, or client-owned authorization.
- No unsupported route/API/dependency or capability claim.

## Acceptance criteria
- [ ] Only configured and valid destinations are actionable.
- [ ] Each destination has a truthful name and concise purpose.
- [ ] No arbitrary URL, open redirect, token, or session identifier is passed.
- [ ] The UI clearly states that destination services authorize independently.
- [ ] No universal SSO claim is made without full hostname/browser proof.

## Definition of done
All tasks and criteria are proven with tests/evidence; package and relevant root gates actually run; report.md records exact outcomes. Never mark completed on visual appearance alone.
