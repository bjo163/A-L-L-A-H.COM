---
contract: unit
id: PKG_SENTINEL_RADIUS
tier: package
name: @allah/sentinel-radius
owner: network
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: RADIUS protocol codec server and subscriber password helpers
publicSurface: [RadiusServer, RadiusCodec, RadiusCode]
depends: [@allah/arsy-core, @allah/arsy-orm]
---

# @allah/sentinel-radius — Unit Contract

The RADIUS building blocks the `sentinel` app runs: packet codec, the UDP auth /
accounting / CoA server, standard attribute and vendor-specific dictionaries, and
subscriber password helpers.

## Public surface

`RadiusServer`, `RadiusCodec`, `RadiusCode` (plus `RadiusAttributeType`,
`RadiusPacket`, `RadiusAttribute`, and `./subscriber_password`).

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`.
