---
contract: unit
id: APP_MOONSKY
tier: app
name: @moonwitness/moonsky
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Moonsky front-end on the riot-anarchy skin
routes: []
skin: riot-anarchy
ports: [3005]
---

# @moonwitness/moonsky — Unit Contract

The Moonsky front-end on the `riot-anarchy` skin, served through `@allah/sdk`.

## Routes / skin / ports

Only a root page (no nested `src/app` segments), so `routes` is empty. Skin
`riot-anarchy` matches `layout.tsx`. Port 3005.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
