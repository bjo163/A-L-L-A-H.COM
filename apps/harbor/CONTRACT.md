---
contract: unit
id: APP_HARBOR
tier: app
name: @moonwitness/harbor
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Harbor console front-end on the rocksoul skin
routes: []
skin: rocksoul
ports: [3006]
---

# @moonwitness/harbor — Unit Contract

The Harbor front-end on the `rocksoul` skin, served through `@allah/sdk`.

## Routes / skin / ports

Only a root page (no nested `src/app` segments), so `routes` is empty. Skin
`rocksoul` matches `layout.tsx`. Port 3006.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
