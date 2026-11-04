---
status: "proposed"
---
# Invariants & Security Rules: Sentinel Standalone Microservice Daemon (`apps/sentinel`) & High-Performance UDP RADIUS Service

## 1. Architectural & Protocol Invariants
- **No External Dependency on FreeRADIUS**: The RADIUS protocol engine must be 100% native Node.js / TypeScript. Spawning external CLI daemons (like `freeradius` or `radiusd`) is strictly prohibited.
- **Constant-Time Secret & Password Verification**: NAS shared secret validation and PAP/CHAP credential checks MUST use `crypto.timingSafeEqual` to eliminate timing-attack vulnerabilities.
- **Fail-Closed Principle**: If a NAS identifier cannot be resolved, the shared secret does not match, or the subscriber's account state is not `active`, the engine MUST immediately reply with `Access-Reject` (or drop packet if NAS secret is invalid) and never grant access.

## 2. High-Performance UDP & Network Security Rules
- **Packet Length Bounds Checking**: All incoming UDP buffers must be strictly validated against RFC packet length fields (`length >= 20 && length <= 4096`). Corrupted or truncated packets must be rejected immediately to prevent buffer overflow or denial-of-service conditions.
- **Deduplication Sliding Window**: Accounting packets must be deduplicated across a sliding window of at least 300 seconds using `(NAS-IP, Acct-Session-Id, Acct-Status-Type)` to prevent double billing / duplicate session records.
- **SSRF & NAS Source Validation**: Outbound CoA / Disconnect-Requests must strictly target registered NAS IP addresses recorded in `nexus.nas`. Dynamic user-supplied IPs are rejected.

## 3. Quality Gate Compliance
- `pnpm docs:check` passes at 100/100 score.
- `pnpm lint:arch` passes without architectural violations.
- `pnpm typecheck` compiles cleanly.
