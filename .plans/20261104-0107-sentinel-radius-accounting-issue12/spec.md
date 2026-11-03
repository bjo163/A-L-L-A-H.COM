---
title: "SENTINEL Phase 3: RADIUS Accounting & Subscriber Session Lifecycle (Issue #12)"
status: "completed"
timestamp: "2026-11-04T01:07:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 12
parent_issue: 5
depends_on:
  - 9
  - 10
  - 11
---

# SPEC: SENTINEL Phase 3 — RADIUS Accounting & Subscriber Session Lifecycle

## 1. Context & Purpose
- **Scope**: GitHub Issue #12 — `[SENTINEL] Implement RADIUS accounting and subscriber session lifecycle`.
- **Purpose**: Provide authoritative, tamper-evident network session tracking for PPPoE connections, handling Accounting-Request packets (Start, Stop, Interim-Update) with deduplication, session timeout reconciliation, and bandwidth consumption recording in PGlite.

```mermaid
flowchart LR
    NAS["MikroTik NAS (UDP 1813)"]
    AcctEngine["SENTINEL Accounting Engine"]
    Dedup["Packet Deduplicator & Ordering Buffer"]
    SessionStore["sentinel.session (PGlite)"]
    Audit["Session Audit Log"]

    NAS -->|Acct-Status-Type: Start / Interim / Stop| AcctEngine
    AcctEngine --> Dedup
    Dedup --> SessionStore
    SessionStore --> Audit
```

---

## 2. Requirements & Deliverables

### 2.1 Accounting Protocol Handler
1. **RFC 2866 Accounting Handler (Port 1813)**:
   - Evaluates Request Authenticator: $\text{MD5}(\text{Code} + \text{ID} + \text{Length} + 16\text{ zero octets} + \text{Attributes} + \text{Secret})$.
   - Responds with `Accounting-Response` (Code 5).
2. **Status Types**:
   - `Start` (1): Initializes active session, records `start_time`, `nas_ip`, `framed_ip`, and `calling_station_id` (MAC address).
   - `Interim-Update` (3): Updates `last_interim_time`, `input_octets`, `output_octets`, `session_time`.
   - `Stop` (2): Marks session closed, records `stop_time`, `terminate_cause`, final octet totals.

### 2.2 Deduplication & Out-of-Order Packet Handling
- Idempotency key: composite of `(nas_ip, acct_session_id, username)`.
- If identical `Acct-Delay-Time` or duplicate packets arrive within window (10s), acknowledge immediately without double-counting bytes.

### 2.3 Stale Session Reconciliation
- Periodic worker reconciles sessions where `last_interim_time` exceeds $2\times$ interim interval without a Stop packet (e.g. NAS reboot or power failure).
- Reconciled with cause `Stale-Session-Reconciled`, preserving last known byte counts without fabricating stop times.

---

## 3. Acceptance Criteria
1. Accounting packets (Start, Interim, Stop) reliably update `sentinel.session` in PGlite.
2. Duplicate packets do not inflate total upload/download octets.
3. Accounting-Response packets conform to RFC 2866 authenticator requirements.
4. Tenant isolation (`company_id`) enforced across all session queries.

