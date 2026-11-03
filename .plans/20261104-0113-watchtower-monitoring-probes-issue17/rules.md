# Rules: WATCHTOWER Phase 1 — Monitoring Targets, Probes, Alerts & Incidents (Issue #17)

## 1. Monitoring Invariants
1. **No Duplicate Inventory**: WATCHTOWER references NEXUS devices; it must not create a second hardware table.
2. **Idempotent Probing**: Probe timeouts must cancel cleanly and not leak open sockets or background timer handles.
3. **Flap Suppression**: A target oscillating between up and down must be dampened to prevent notification floods.

