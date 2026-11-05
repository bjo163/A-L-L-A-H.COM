---
contract: unit
id: APP_SENTINEL
tier: app
name: @allah/sentinel
owner: network
version: 0.1.0
status: released
last_verified: 2026-11-05
summary: RADIUS auth accounting and change-of-authorization daemon for NAS control
routes: []
ports: [1812, 1813, 3799, 9181]
---

# @allah/sentinel — Unit Contract

The RADIUS daemon built on `@allah/sentinel-radius`: PAP authentication, RFC 2866
accounting, and CoA/disconnect against the NAS registry, plus a small HTTP control
port. Authentication failures append `mw_notify` events for the hub dispatcher.

## Routes / ports

A Node UDP service, not a Next app: no `src/app` route tree. Default ports 1812
(auth), 1813 (acct), 3799 (CoA), 9181 (HTTP control), each overridable via
`SENTINEL_*_PORT`.

The sync and alert throttles are configurable:

| Variable | Default | Purpose |
|---|---:|---|
| `SENTINEL_NAS_SYNC_POLL_MS` | `5000` | Poll interval for NAS secret invalidation |
| `SENTINEL_RADIUS_AUTH_ALERT_COOLDOWN_MS` | `60000` | Per-NAS/user auth failure alert cooldown |

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`, `@allah/sentinel-radius`, `dotenv`.

## Container contract

The builder and runner must copy the complete `addons/` tree. `src/server.ts`
loads `addons/index.ts`, whose registry imports every installable addon before
selecting the `nexus` and `mw_notify` roots at startup. It registers the ORM auth
models before schema synchronization and seeds the notification templates.
