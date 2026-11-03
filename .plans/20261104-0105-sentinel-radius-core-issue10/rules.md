# Rules: SENTINEL Phase 1 — Native RADIUS Protocol Core & Packet Test Suite (Issue #10)

## 1. Security & Protocol Invariants
1. **Zero FreeRADIUS**: FreeRADIUS must never be included as a dependency, sidecar, fallback, or hidden operational prerequisite.
2. **Zero Secret Leakage**: Shared secrets, plain user passwords, and decrypted credentials must never be written to console output, log streams, or error messages.
3. **Strict Bounds Checking**: Any packet shorter than 20 bytes or longer than 4096 bytes, or with TLVs overflowing packet length, must be discarded immediately.
4. **Independent UDP Daemon**: The RADIUS server runs over UDP and must not be wrapped inside Fastify HTTP routes.

