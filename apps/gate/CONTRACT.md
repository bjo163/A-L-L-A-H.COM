---
contract: unit
id: APP_GATE
tier: app
name: @moonwitness/gate
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Public imperium-lumen marketing and content portal
routes: [about, community, discover, explore, journey, privacy, sources, transmissions, universe]
skin: imperium-lumen
ports: [3000]
---

# @moonwitness/gate — Unit Contract

The public content portal on the `imperium-lumen` skin.

## Routes / skin / ports

Top-level `src/app` route segments: `about`, `community`, `discover`, `explore`,
`journey`, `privacy`, `sources`, `transmissions`, `universe`. Skin matches
`layout.tsx`. Port 3000.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
