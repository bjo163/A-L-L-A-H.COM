---
title: "First Light — Initial Owner Onboarding — Execution Report"
status: "completed"
---

# Execution Report — First Light — Initial Owner Onboarding

## Status
Completed in `apps/id/src/app/onboarding/page.tsx`; one-time authority and atomicity remain in ARSY.

## Evidence by task
- **FL-001:** Traced the SDK status/create operations to ARSY onboarding handlers and race tests.
- **FL-002–FL-004:** States are checking, available, closed, unavailable, submitting, created/sign-in-required; the form exists only while ARSY reports availability. A ref guard and disabled submit prevent duplicate create.
- **FL-005:** Create failure triggers an authoritative status reread; closed/unavailable never retries creation automatically.
- **FL-006:** Added `signInAfterOnboarding()`; failed sign-in shows that the account already exists and provides the login route rather than rerunning setup.
- **FL-007:** Unit tests cover available/closed/unavailable rechecks and sign-in success/failure; ARSY race and Better Auth tests pass; 12-character validation is tested.
- **FL-008:** Browser verified the one-time setup form is shown only when available, mismatch error is associated/focused, and required widths/reduced motion remain usable.

## Verification
- `pnpm --filter @moonwitness/id test` — passed, 8/8.
- ARSY onboarding race/auth focused tests — passed, 2/2.
- `pnpm --filter @moonwitness/id typecheck` — passed.

## Limits
No account was created during browser verification; state and result handling were exercised through unit tests and mocked reads.

## Completion
Initial-owner setup remains fail-closed and ARSY-controlled.
