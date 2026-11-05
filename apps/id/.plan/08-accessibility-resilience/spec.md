---
title: "Accessibility and Resilient State System"
status: "proposed"
owner: "engineering"
---

# Accessibility and Resilient State System

## Goal
Apply consistent accessibility, responsive behavior, and honest failure/recovery states across all existing ID routes.

## Context
MoonWitness ID is the human-facing identity gateway; LUNAR CHRONICLES is its visual DNA. ARSY alone owns canonical identity, authentication, session state, tenant, roles, and authorization. Destination apps authorize their own protected operations.

## Dependencies
- `02-arrival-experience`
- `03-authentication-journeys`
- `04-first-owner-onboarding`
- `05-personal-orbit-account`
- `06-session-archive`
- `07-destination-handoff`

## Scope
Apply consistent accessibility, responsive behavior, and honest failure/recovery states across all existing ID routes. Inspect existing routes, shared types, SDK contracts, and endpoint configuration before changing code. Keep the implementation bounded to ID UI and tests.

## Non-goals
- No backend, database, schema, migration, cookie, CORS, DNS, proxy, TLS, secrets, or deployment changes.
- No new identity authority, auth provider, local token store, or client-owned authorization.
- No unsupported route/API/dependency or capability claim.

## Acceptance criteria
- [ ] Every route is usable by keyboard only with visible logical focus.
- [ ] Errors and status updates are announced and associated correctly.
- [ ] Text/control contrast meets WCAG AA; no color-only state.
- [ ] No horizontal overflow at 320px; required viewports verified.
- [ ] Reduced-motion experience retains all meaning and controls.
- [ ] Failure and retry states are clear and do not duplicate non-idempotent operations.

## Definition of done
All tasks and criteria are proven with tests/evidence; package and relevant root gates actually run; report.md records exact outcomes. Never mark completed on visual appearance alone.
