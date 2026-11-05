---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SESSION-SYNC-RULES"
version: "1.0.0"
owner: "security"
status: "proposed"
---

# Cross-application session synchronization rules

- Derive principal and tenant from verified server-side identity; never trust request-body tenant IDs.
- Keep credentials and session tokens out of client storage, URLs, logs, and shared preference records.
- Require explicit authorization and tenant scoping on every preference read or write route.
- Record changes through the established append-only audit path when the operation is auditable.
- Treat UI preference synchronization as non-authoritative; failure must not change authentication or policy.
- Validate endpoint URLs before requests and re-check resolved IP addresses; fail closed for private and loopback destinations.
- Reuse canonical `SkinId` values from `@moonwitness/ui`; do not invent alternate theme names.
- Do not add SDK methods until a matching server route and its request/response contract are verified.
- Do not claim implementation, cross-app SSO behavior, or downstream plan enablement without source-backed tests.
