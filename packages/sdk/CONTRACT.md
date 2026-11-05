---
contract: unit
id: PKG_SDK
tier: package
name: @allah/sdk
owner: developer-experience
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Typed client SDK for the Arsy hub API used by every front-end app
publicSurface: [MoonWitnessClient, createClient, mwClient, SdkOptions]
depends: [@moonwitness/types]
---

# @allah/sdk — Unit Contract

The typed HTTP client every front-end app uses to reach the hub: auth/session
handling, agent pairing, swarm execution, and the public ISP catalog projections.

## Public surface

`MoonWitnessClient` class, `createClient` factory, `mwClient` default instance,
and `SdkOptions` (plus session/swarm/ISP types).

## Depends

`@moonwitness/types`.
