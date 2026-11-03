# Rules: JIZZ Phase 2 — Typed Read-Only JIZZ Adapter & Data Contracts

## Security & Integrity Rules
1. **No Mutations**: Read-only operations only. Never attempt `POST`, `PUT`, `PATCH`, or `DELETE` against JIZZ canonical records.
2. **SSRF Guard**: All requests to upstream JIZZ hosts must be strictly validated. Private networks, loopbacks, and cloud metadata IPs are rejected.
3. **No Verdicts or Truth Scores**: The adapter must never synthesize a single "winning" perspective or truth score. Multi-perspective uncertainty must be preserved.

