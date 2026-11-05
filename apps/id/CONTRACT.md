---
contract: unit
id: APP_ID
tier: app
name: @moonwitness/id
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Identity and account front-end on the lunar-chronicles skin
routes: [account, login, onboarding, register]
skin: lunar-chronicles
ports: [3003]
---

# @moonwitness/id — Unit Contract

The identity front-end on the `lunar-chronicles` skin: registration, login,
account management, and onboarding, backed by `better-auth` and the hub SDK.

## Routes / skin / ports

Top-level `src/app` route segments: `account`, `login`, `onboarding`, `register`.
Skin `lunar-chronicles` matches `layout.tsx`. Port 3003.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`, `better-auth`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
