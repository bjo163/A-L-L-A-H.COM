---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SESSION-SYNC-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# Cross-application session synchronization design

## Proposed boundary

The SDK may expose typed client operations only when an existing same-origin server route enforces identity, tenant scope, authorization, and audit requirements. It must not distribute trusted session credentials between applications or make client state authoritative.

## Session and preference behavior

Authentication remains verified by the server for each request. Cross-app navigation may reuse the established SSO flow; it must not copy tokens through browser storage or query strings. Preferences are non-authoritative presentation data and may be synchronized only through a verified server contract. The canonical skin type must match the six values owned by `@moonwitness/ui`.

## Endpoint resolution

Endpoint selection remains server-side. A resolver must validate the URL before the request and re-check resolved IP addresses, refusing private and loopback destinations. A client helper cannot establish SSRF safety by itself.

## Open design gate

The source/API audit must confirm the principal source, preference persistence endpoint, session propagation mechanism, and canonical type names. Until then, methods and workflows in the proposal remain unimplemented and unavailable to callers.
