# Design: MoonWitness ID Secrets Control Plane

## Product intent
The ID app becomes the human-facing control plane for service identity, credential issuance, environment configuration, and approval workflows. The user experience stays tenant-scoped and server-authoritative, with secret content never crossing the browser boundary.

## Layout
- Header with tenant overview and quick actions
- Service identities and API keys inventory
- Secrets vault with redacted entries and rotation actions
- Environment manager with approval and promotion status
- Audit timeline and policy notices

## UI states
Each panel must include an empty state, loading state, and error state. All state transitions should be explicit and accessible.
