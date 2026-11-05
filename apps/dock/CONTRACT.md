---
contract: unit
id: APP_DOCK
tier: app
name: @moonwitness/dock
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Dock launcher front-end mounting the imperium-lumen skin
routes: []
skin: imperium-lumen
ports: [3001]
---

# @moonwitness/dock — Unit Contract

A Next.js App Router front-end. `src/app/layout.tsx` mounts the design system via
`<SkinRoot skin="imperium-lumen">` and talks to the hub through `@allah/sdk`.

## Routes / skin / ports

Only a root page (no nested route segments beyond `src/app`), so `routes` is
empty. Skin `imperium-lumen` matches `layout.tsx`. Dev/start port 3001.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
