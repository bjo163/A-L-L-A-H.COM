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
- [x] Un-track the duplicated files via `git rm --cached` (index now shows `D` for 34 public/brand/favicon paths)
- [x] Verify scoped gates in isolation: `ui:test` 78/78, `docker:contract:check` 10 apps, `platform:contract:check` 10 apps, `contract:check`/`lint:arch` clean for `packages/assets`
- [ ] `verify:fast` full-chain green — BLOCKED by concurrent unrelated work in `addons/base` (new `ir_model_access.ts`/`ir_rule.ts` missing `company_id`, undeclared in `__manifest__.json`, stale `CONTRACT.md`); not an assets defect
- [ ] Commit and push (paused for operator approval; working tree carries unrelated in-progress work — must not be swept into this commit)
