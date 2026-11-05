---
contract: unit
id: APP_E_ISP
tier: app
name: @moonwitness/e-isp
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Public ISP storefront for the works catalog with a coverage checker
routes: [api, coverage, plans]
skin: rocksoul
ports: [3007]
---

# @moonwitness/e-isp — Unit Contract

The public ISP site rendering the `works` ISP catalog and coverage footprint,
keyed to the `rocksoul` skin.

## Routes / skin / ports

Top-level `src/app` route segments: `api`, `coverage`, `plans`. Skin `rocksoul`
matches `layout.tsx`. Port 3007. The catalog it displays is seeded by the `works`
addon's default data (and its demo footprint only outside production).

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
