# Task: packages/assets

- [x] Scaffold `packages/assets` (package.json, manifest.json, CONTRACT.md)
- [x] Copy canonical artwork (7 skins), per-app brand emblems (8), favicon
- [x] Download 6 font binaries (woff2+woff) + 3 OFL licenses
- [x] Write idempotent `sync.mjs` (all-apps and single-app/Docker modes)
- [x] Add `@moonwitness/assets` workspace dep + predev/prebuild hooks to 8 apps
- [x] Add `COPY packages/assets` lines to 8 Dockerfiles
- [x] Retarget `generate-world-artwork.mjs` to write into the package
- [x] Add `assets:sync` root script; run sync before `ui:test` in `verify:release`
- [x] Gitignore synced `public/` copies and managed favicons
- [x] Update BLUEPRINT.md and DECISIONS.md; regenerate contract index
- [x] Verify: `ui:test` 78/78, docker/platform/contract gates for assets pass
- [x] Un-track the duplicated files via `git rm --cached` (34 public/brand/favicon paths removed from index)
- [x] Commit the assets-scoped paths (commit `39adafe`; concurrent arsy-orm access-control work landed in `165a641`)
- [ ] `verify:fast` repo-wide green — blocked only by two untracked other-workstream plan dirs (`.plans/20261106-skin-laboratory-home`, `.plans/20261106-sdk-cross-app-integration`) missing `rules.md`; not an assets defect
- [ ] Push (held; pre-push runs `verify:fast`, so it waits on the same external dirs)
