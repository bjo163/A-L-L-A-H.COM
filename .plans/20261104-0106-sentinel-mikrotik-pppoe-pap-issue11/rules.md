# Rules: SENTINEL Phase 2 — MikroTik PPPoE PAP Authentication End-to-End (Issue #11)

## 1. Network Access Safety Invariants
1. **MikroTik Vendor Accuracy**: Do not invent fake VSA IDs or attributes. Use authoritative MikroTik Vendor ID `14988` and tested attribute types.
2. **Credential Decoupling**: PPPoE network credentials (`sentinel.account`) must never be confused with or linked to platform MoonWitness ID / admin passwords.
3. **Fail-Closed on Unrecognized NAS**: If the source IP does not match an active NAS in NEXUS, the request is immediately rejected.

