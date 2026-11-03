# Rules: NEXUS Phase 1 — Network Inventory & MikroTik NAS Registry Foundation (Issue #8)

## 1. Security & Hygiene Invariants
1. **Zero Secret Leakage**: Shared secrets must NEVER be returned in cleartext via any API, log, websocket, fixture, or error message. All queries must return `[REDACTED]`.
2. **Encryption at Rest**: Stored NAS secrets must be encrypted using AES-256-GCM. Plaintext storage is strictly forbidden.
3. **Tenant Isolation**: All queries must enforce `company_id` filter. Cross-tenant NAS access is blocked.
4. **Source Restrictions**: NAS records must support source IP allowlists to reject RADIUS packets from spoofed or unauthorized IP addresses.

