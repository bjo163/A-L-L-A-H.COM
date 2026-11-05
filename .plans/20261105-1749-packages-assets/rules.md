# Rules: packages/assets

## Invariants
- I1. Single source. The only tracked copies of artwork, brand emblems, favicon, and font binaries live under `packages/assets/`. App `public/` copies are generated and gitignored.
- I2. `@moonwitness/ui` must never add `@moonwitness/assets` as a dependency. The design system references files by runtime public path; a package dependency would create a false coupling and break the string-path model.
- I3. Sync is byte-faithful. A synced file must equal its canonical source; the sync never transforms, re-encodes, or redesigns an asset.
- I4. `assets.test.ts` stays authoritative. The artworkOwners map, the SVG byte-match against `WorldArtwork`, the 1600x900 PNG dimensions, the 350KB hero budget, and the per-app emblem presence must all pass after a sync.
- I5. Manifest mirrors disk. `manifest.json` lists exactly what each app currently serves; adding an app asset means adding it to the manifest and the canonical directory together.
- I6. Deterministic order. Files resolve from `import.meta.url`, so local, CI, and Docker runs behave identically regardless of the caller's working directory.

## Security / licensing
- Font binaries are OFL; their license texts are vendored in `LICENSES/` and must remain alongside the fonts. No font is synced without its license present in the package.
- Sync writes only inside `apps/<app>/public` and `apps/<app>/src/app/favicon.ico`. It refuses unknown app names and never writes outside an app directory.

## Platform gates
- `docker:contract:check` requires a `COPY packages/assets ./packages/assets` builder line for every app that declares the workspace dependency; all eight must carry it.
- `verify:release` runs `pnpm assets:sync` before `pnpm ui:test`, so a fresh checkout with un-tracked copies still passes the asset contract.

## Scope guardrails
- Do not unify or redesign the per-app emblem drift; it is preserved byte-for-byte.
- Do not run the legacy hero rasterizer as part of verification; the committed heroes are authoritative.
