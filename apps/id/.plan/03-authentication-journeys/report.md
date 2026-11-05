---
title: "Identity Gate — Authentication Journeys — Execution Report"
status: "completed"
---

# Execution Report — Identity Gate: Login and Registration

## Status
Completed in the existing `/login` and `/register` journeys. ARSY/Better Auth policy and persistence were not changed.

## Evidence by task
- **IG-001:** Traced `authClient.signIn.email()` / `signUp.email()` and ARSY Better Auth endpoints before editing.
- **IG-002–IG-003:** Login retains required email/password, appropriate autocomplete, pending/duplicate-submit protection, generic rejection, onboarding-status unavailable/retry states, and a route-specific title.
- **IG-004–IG-005:** Registration exposes only name/email/password, keeps the eight-character minimum, validates confirmation, focuses and associates the mismatch error with its input, and guards duplicate submit.
- **IG-006:** Credential/provider failures map to generic context-specific messages; no raw server error is rendered.
- **IG-007:** ID unit tests cover validation/error mapping; ARSY auth integration tests passed. Browser mismatch validation verified `aria-invalid`, `aria-describedby`, linked message, and focus. No real credentials or account were used.
- **IG-008:** Browser checks covered keyboard validation, 320/375/768/1024/1440 px, reduced motion, and measured shared skin contrast.

## Verification
- `pnpm --filter @moonwitness/id test` — passed, 8/8.
- ARSY auth/onboarding focused tests — passed, 2/2 (see plan 09 for command).
- `pnpm ui:test` — passed, 48/48.

## Limit
No production identity was created and no cross-host SSO behavior was asserted.

## Completion
Login and regular registration remain separate, accessible journeys and do not expose elevated role or tenant controls.
