---
contract: unit
id: PKG_ASSETS
tier: package
name: @moonwitness/assets
owner: design-system
version: 1.0.0
status: released
last_verified: 2026-11-05
summary: Canonical single source for public assets synced into each app's public directory
publicSurface: []
---

# @moonwitness/assets — Unit Contract

Single canonical home for the static files every front-end app serves from its
`public/` directory: world artwork (`artwork/<skin>.png|svg`), per-app brand
emblems (`brand/<app>.svg`), the shared favicon, and the three vendored font
families (Inter, Cormorant Garamond, Cascadia Code) referenced by
`@moonwitness/ui`.

## How it is consumed

Apps declare `@moonwitness/assets` as a workspace dependency and run
`node ../../packages/assets/sync.mjs <app>` in their `predev`/`prebuild` hooks.
The sync script reads `manifest.json` and copies each app's subset into
`apps/<app>/public/` (and `src/app/favicon.ico` for dock/headquarter). Those
copies are gitignored — the package is the only tracked source.

## Public surface

None. This package exports no module; it is a data-only package consumed by the
sync script. The registry string paths in `@moonwitness/ui` (identity.hero /
emblem and `buildAppIcons`) resolve to the files synced into each app's public
root, so `@moonwitness/ui` must never depend on this package.

## Fonts

`fonts/` holds `woff2` + `woff` at weight 400 normal for the three families
declared in `packages/ui/src/fonts/fonts.css`. Each is OFL-licensed; the license
texts live in `LICENSES/`.
