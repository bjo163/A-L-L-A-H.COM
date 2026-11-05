---
title: "Session Archive — Revocable Trust — Execution Report"
status: "completed"
---

# Execution Report — Session Archive — Revocable Trust

## Status
Completed using ARSY-backed SDK operations and the shared `SessionCard`.

## Evidence by task
- **SA-001–SA-002:** Display is limited to device name, IP, expiry, and server-provided current marker; no session token or user-agent is rendered. Expiry is explicitly described as UTC.
- **SA-003:** Current session is marked with visible “Current” text and an icon, not color alone.
- **SA-004–SA-006:** Revoke has pending/disabled state and duplicate guard. `revokeSessionAndSignOut()` calls local sign-out only after ARSY confirms revocation of the current session; rejected revocation leaves the list unchanged.
- **SA-007:** Tests cover rejected/confirmed revoke, current-session local sign-out success/failure, non-current session behavior, and mutually exclusive action guards. ARSY integration tests passed, including current-session revocation.
- **SA-008:** Shared button accessible names identify the device; UI test asserts the name. Mocked browser verified failure retains the row, success removes it, and current-session revoke routes to login after sign-out confirmation.

## Verification
- `pnpm --filter @moonwitness/id test` — passed, 8/8.
- `pnpm ui:test` — passed, 48/48.
- Browser session tests used synthetic data and mocked API responses; no real sessions were revoked.

## Limits
Production session cookies, remote devices, and cross-domain revocation propagation were not tested or claimed.

## Completion
Session display/actions honor API confirmation and preserve failed operations.
