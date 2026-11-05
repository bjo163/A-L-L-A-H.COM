---
contract: unit
id: APP_JIZZ
tier: app
name: @moonwitness/jizz
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-11-05
summary: Riot-anarchy media and phenomena front-end with skin previews
routes: [api, phenomena, riot-anarchy, rocksoul, signals]
skin: mycelium
ports: [3004]
---

# @moonwitness/jizz — Unit Contract

The `mycelium`-skinned media/phenomena front-end, which also mounts per-skin
preview route groups (`riot-anarchy`, `rocksoul`).

## Routes / skin / ports

Top-level `src/app` route segments: `api`, `phenomena`, `riot-anarchy`,
`rocksoul`, `signals`. Skin `mycelium` matches `layout.tsx`. Port 3004.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle. The build does not require upstream environment
variables; `JIZZ_API_URL` and `JIZZ_API_KEY` are read lazily when the server-side
proxy handles a request.

Docker Compose routes the default upstream through `host.docker.internal:4000`
and maps that hostname to the host gateway. The adapter allows this exact origin
alongside the local development endpoints; other upstreams remain blocked.
