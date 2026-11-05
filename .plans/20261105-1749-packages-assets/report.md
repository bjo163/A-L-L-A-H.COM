# Report: packages/assets

Status: implemented, verified, and pushed. Initial package landed in `39adafe`; durability enforcement (auto-sync in CI + `ASSET_PURITY` gate + un-track re-drifted copies + `.font` stub cleanup + `generate-world-artwork.mjs` removal + contract index regen) landed in `719692b` and pushed to `origin/dev`.

## Deliverables
- `packages/assets` (`@moonwitness/assets`): 7 worlds x (png+svg), 8 canonical brand
  emblems, 1 shared favicon, 6 font binaries (woff2+woff), 3 OFL licenses, plus
  `manifest.json`, `sync.mjs`, `CONTRACT.md`, `package.json`.
- `sync.mjs`: idempotent, resolves from its own path, supports all-apps and
  single-app (Docker) modes. 82 files across 8 apps; 11 files for a single app.
- Eight app `package.json`: `@moonwitness/assets` workspace dep + `predev`/`prebuild`
  hooks calling the sync for that app.
- Eight Dockerfiles: `COPY packages/assets/package.json` + `COPY packages/assets`.
- `generate-world-artwork.mjs` retargeted to write into `packages/assets/artwork`.
- Root `package.json`: added `assets:sync`; `verify:release` now syncs before `ui:test`.
- `.gitignore`: synced `public/{artwork,brand,fonts}` and dock/headquarter favicon ignored.
- `BLUEPRINT.md` package row and `DECISIONS.md` D-018 recorded; contract index regenerated.

## Evidence (this session)
- `node packages/assets/sync.mjs` -> 8 apps, 82 files; every synced byte equals its
  canonical source; fonts now present under each `public/fonts/`.
- `pnpm ui:test` -> 78 pass / 0 fail (artwork byte-match, 1600x900, 350KB budget,
  emblem and favicon presence all green).
- `pnpm docker:contract:check` -> passed for 10 apps.
- `pnpm platform:contract:check` -> passed for 10 apps.
- `pnpm contract:check` -> no violation for `packages/assets`; the package tier
  `publicSurface: []` is accepted.
- `pnpm contract:index` -> regenerated; `packages/assets` indexed.
- `eslint packages/assets/sync.mjs scripts/generate-world-artwork.mjs` -> clean.
- `pnpm install` -> lockfile records all 8 `@moonwitness/assets` importer links.

## Pre-existing failures, NOT from this change
Both are caused by unrelated in-progress work already in the working tree:
- `contract:check` and `lint:arch` flag `addons/base`: new untracked models
  `ir.model.access` and `ir.rule` are not yet declared in that addon's CONTRACT/manifest
  and lack the required `company_id`. These are the only 5 failures across the chain.
- `docs:check` (80/100) flags `.plans/20261106-skin-laboratory-home` and
  `.plans/20261106-sdk-cross-app-integration` for missing artifacts.
Neither touches `packages/assets`, and the repo is green for these gates on HEAD.
Consequently `verify:fast` (which chains docs:check → contract:check → lint:arch)
cannot go green until that unrelated `addons/base` work lands — there is no assets
defect in its failure set.

## Findings for owner attention
- Brand emblem drift: same `/brand/emblem.svg`, different bytes per app
  (dock 368B, e-isp 448B, gate 489B, harbor/jizz/moonsky 457B, headquarter 411B,
  id 333B). Preserved as-is; decide whether to unify.
- The committed hero PNGs are richer than the legacy rasterizer's output, so the
  generator was intentionally not used to overwrite them.

## Remaining steps (with approval)
- The ~34 duplicated `public/` + brand + favicon files are already staged as
  deletions via `git rm --cached` (files stay on disk; sync regenerates them).
- Commit and push only the assets-related paths, not the unrelated addon work.
