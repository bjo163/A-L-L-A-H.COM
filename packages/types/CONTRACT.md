---
contract: unit
id: PKG_TYPES
tier: package
name: @moonwitness/types
owner: platform-core
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Shared TypeScript contracts for auth agent and ISP domain shapes
publicSurface: [UserSubject, AuthResponse, AgentMode]
depends: []
---

# @moonwitness/types — Unit Contract

The shared type contracts imported across the SDK, the gateway plugin, and every
front-end app: auth/session subjects, agent modes and tool-policy shapes, paired
device and remote-mission types, and ISP public projections.

## Public surface

`UserSubject`, `AuthResponse`, `AgentMode` (representative; the package is
types-only and exports many more interfaces and union types).

## Depends

None — types-only, zero runtime dependencies.
