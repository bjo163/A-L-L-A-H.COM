---
id: packages-assets
status: in_progress
owner: design-system
last_verified: 2026-11-05
---
# Spec: packages/assets, single source for public assets

## Problem
The eight front-end apps duplicated 40+ static files byte-for-byte under `public/`
(seven world hero PNG+SVG pairs, eight brand emblems, two favicons). The three
font families named in `packages/ui/src/fonts/fonts.css` shipped no binaries, so
every page fell back to a `local()` font. All references are runtime public
string paths declared in `packages/ui/src/skins/registry.ts`.

## Goal
Make `@moonwitness/assets` the only tracked home for these files, and copy each
app's subset into its `public/` directory automatically. Keep every existing
consumer (registry paths, OG metadata, favicon factory, `assets.test.ts`) green.

## Requirements
- R1. Canonical artwork, brand emblems, shared favicon, and font binaries live only in `packages/assets/`.
- R2. `sync.mjs` populates `apps/<app>/public/{artwork,brand,fonts}` and `src/app/favicon.ico` for dock/headquarter from `manifest.json`.
- R3. Sync runs automatically on `predev` and `prebuild` for all eight apps and is idempotent.
- R4. The per-app copies are gitignored; the package is the single tracked source.
- R5. Real `woff2`+`woff` binaries for Cormorant Garamond, Inter, Cascadia Code (weight 400 normal), with OFL licenses.
- R6. `packages/ui` never depends on `@moonwitness/assets`.
- R7. Docker builds succeed: each app Dockerfile copies `packages/assets`, and `docker:contract:check` passes.

## Acceptance
- `pnpm assets:sync` then `pnpm ui:test` → 78/78 pass, artwork byte-identical to the prior committed files.
- `pnpm docker:contract:check` and `pnpm platform:contract:check` → pass for all apps.
- `pnpm contract:check` reports no violation for `packages/assets`.
- Byte-compare: every synced `public/` file equals its canonical source.

## Non-goals
- Serving assets from S3/CDN. The operator already runs an S3 endpoint to connect later.
- Redesigning drifting brand emblems; drift is preserved, not unified.
- Regenerating hero PNGs; the committed heroes stay authoritative.
