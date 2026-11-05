# Design: packages/assets

## Layout
```
packages/assets/
  package.json          # @moonwitness/assets, private, type:module, sync script
  manifest.json         # app -> { artwork[], emblem, favicon? }; shared fonts[]
  sync.mjs              # copy logic, resolves paths from its own location
  CONTRACT.md           # tier:package, publicSurface: [] (data-only package)
  artwork/<skin>.png    # 7 worlds, byte-identical to prior committed heroes
  artwork/<skin>.svg
  brand/<app>.svg       # 8 emblems, canonicalized per app to preserve drift
  favicon/favicon.ico   # shared by dock + headquarter
  fonts/<Name>.woff2    # Inter, CormorantGaramond, CascadiaCode (woff2 + woff)
  fonts/<Name>.woff
  LICENSES/*-OFL.txt    # three SIL Open Font License texts
```

## Sync mechanism
- Default (no args): iterate `manifest.apps`, skip any app whose directory is absent (partial checkouts).
- Single app (`sync.mjs gate`): sync only that app; errors if the app is unknown or its directory is missing. This is the Docker and `predev`/`prebuild` path, where only the current app tree is COPYed into the builder.
- For each app: copy each artwork skin's `.png`+`.svg`, `brand/<app>.svg` to `public/brand/emblem.svg`, every shared font to `public/fonts/`, and `favicon.ico` to `src/app/` when the manifest declares one.
- Paths resolve from `import.meta.url` (the script lives in the package, so the Dockerfile's missing root `scripts/` dir is irrelevant).
- Idempotent: `mkdir -p` + overwrite; repeated runs produce identical trees.

## Why not module imports
Registry paths, OG images, and the favicon factory all point at public string URLs, and `assets.test.ts` reads files off disk. Importing assets through the package would break all three. Build-time copy keeps every consumer unchanged.

## Font provenance
Static weight 400 normal from the `@fontsource` packages via jsDelivr: `inter`, `cormorant-garamond`, `cascadia-code`, latin subset. Both `woff2` (preferred) and `woff` (legacy) are vendored because `fonts.css` lists both in each `src`. All three families are OFL-licensed; license texts ship in `LICENSES/`.

## Docker wiring
Each app's `package.json` declares `@moonwitness/assets: workspace:*`; `docker:contract:check` then requires a `COPY packages/assets ./packages/assets` line (plus the package.json pre-copy for `--frozen-lockfile`), which is added to all eight Dockerfiles. `prebuild` runs the sync inside the builder, so the app image bakes the same public files as local dev.

## Authoritative heroes
The legacy `generate-world-artwork.mjs` rasterizer now writes far smaller PNGs (rocksoul 11.8KB vs the committed 45.6KB), so it no longer reproduces the shipped detail. The committed PNGs are kept as canonical; the script is retained retargeted to the package for deliberate manual regeneration only, never in the gate chain.
