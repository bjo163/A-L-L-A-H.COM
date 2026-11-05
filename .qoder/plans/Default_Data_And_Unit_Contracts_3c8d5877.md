# Default Data And Unit Contracts

## Summary

The repo has four disconnected ways of writing platform seed rows and no enforced contract for the units that make it up:

- Default data is scattered across **`addons/works/data`** (loaded by `apps/arsy/src/seed.ts:runBootSeed`), the LLM-gateway plugin's **`seedDefaultsIfEmpty()`** (`packages/arsy-plugin-llm-gateway/src/router.ts:83`), a hand-wired **`POST /v1/admin/cron/seed/:companyId`** route (`apps/arsy/src/app.ts:1081`), and the migrator's system-bot insert (`packages/arsy-orm/src/migrator.ts:200`, which is infra bootstrap, not business data). Only `works` follows the clean, idempotent, typed pattern.
- `base` — the addon that in Odoo ships countries, currencies, languages and translations — has **no `data/` folder**. Most addons own no reference data at all, and none declare it in `__manifest__.json` (the schema has no `data` key: `addons/index.ts:28-33`).
- There is **no `CONTRACT.md` anywhere**, and the doc-contract engine (`scripts/check-doc-contracts.ts`) only inspects 16 hard-coded docs (4 app READMEs) with a loose schema. The arch gate (`packages/lint/src/check-architecture.mjs:595` `ADDON_MANIFEST_CONSISTENCY`) validates manifests/models but says nothing about default data or per-unit contracts.

This plan (1) generalizes the `works` default-data pattern into one ORM-backed, manifest-declared, registry-loaded mechanism and fills in the missing data (starting with `base`), and (2) introduces per-unit contracts for **addons, packages, and apps** — a factual `CONTRACT.md` per unit plus two new gates — and tightens the documentation contract to cover every unit and verify its declared surface against the code. "QL" here is the ARSY-ORM query layer; the seeder is built on it (`BaseRepository.find` with `IN` filters + `createMany`), so no ORM public API changes.

Guiding invariants (from `AGENTS.md`/memory and the existing gates): no new dependencies; keep every gate green; `company_id: 0` is the platform-owned tenant convention; tenant-scope + audit actor must be respected; parameterized queries only; kebab-case files.

## Grounded facts (verified this session)

- Boot order in `apps/arsy/src/app.ts:147-153` → `dbEngine.connect()`, `registerAllAddons()`, `new SchemaMigrator(dbEngine).sync()`; `apps/arsy/src/main.ts:17-23` calls `runBootSeed()` **after** build, wrapped in try/catch ("boot resilience"). The migrator creates the `system` bot (`res_users` `system_key='bot'`), which `BaseRepository.resolveActor` requires for `SYSTEM_ACTOR` writes → **seeding base data is safe after migration**, but the very first reference rows must not precede the bot (they won't: seeding is post-`sync()`).
- `BaseRepository` (`packages/arsy-orm/src/repository.ts`) exposes `find(QueryOptions)` (supports `filters:[{field,operator:'IN',value:[...]}]`, `limit`, `scope:{systemScope:true}`) and `createMany(rows, scope, actor)` (one txn, batched). This is the exact primitive `addons/works/data/index.ts:23-44` already uses. `SYSTEM_ACTOR = { type: 'system' }` (`packages/arsy-orm/src/model.ts:22`).
- `modelRegistry.get(name)` (`packages/arsy-orm/src/registry.ts:70`) resolves a `ModelDefinition` by name; `apps/arsy/src/seed.ts:4-8` shows the `repository(modelName)` factory pattern to reuse.
- `addons/index.ts` uses **static imports** for the catalog and `resolveLoadOrder` topo-sorts on `depends` (`addons/index.ts:62-107`) — evidence that dynamic `import()` of manifest-declared files is not viable in the bundle, hence the static-registry design below.
- Addon field shapes for default data: `res_country` (`code` unique, `currency_id` m2o), `res_currency` (`name` unique), `res_lang` (`code` unique, `company_id` default 0) — natural idempotency keys are `code`/`name`.
- Addons: `base, mw_llm_router, mw_qorpus, mw_storage, nexus, orbit, project, works` (8). Packages (12): `arsy-core, arsy-orm, arsy-plugin-auth, arsy-plugin-llm-gateway, arsy-plugin-sdui, arsy-plugin-storage, lint, sdk, sentinel-radius, types, ui, vscode-extension`. Apps (11): `arsy, dock, e-isp, gate, harbor, headquarter, id, jizz, moonsky, sentinel, server`. Addons have **no** `package.json`; packages/apps are keyed by scoped `package.json` `name`.
- Arch-gate helpers to reuse: `collectFiles`, `parseDefineModels`, `collectAllModels`, `addViolation`, and the `style-baseline.json` ratchet (`check-architecture.mjs:706-725`).

---

## Group 1 — Shared default-data runtime (ORM query layer + addons)

### G1.1 Seed primitive in the ORM query layer
- New `packages/arsy-orm/src/default_data.ts`, exported from `packages/arsy-orm/src/index.ts`.
- Types:
  - `SeedContext = { repository(modelName: string): BaseRepository<Record<string, unknown>>; actor: AuditActor }` (a seam so addons never import `dbEngine` directly; mirrors `apps/arsy/src/seed.ts`).
  - `SeedDataset = { model: string; keyFields: string[]; rows: Record<string, unknown>[] }` (keyFields = natural idempotency key, e.g. `['code']`).
- `async function seedIdempotent(repo, dataset, scope, actor): Promise<number>` — generalizes `works` `seedBySlug`: build one `IN` filter per keyField combo (composite key supported), one `find` to get existing keys, filter missing, one `createMany` insert. Returns rows created. Never raw SQL; always through `BaseRepository`.
- `seedDatasets(ctx, datasets, scope): Promise<SeedResult>` where `SeedResult = { model: string; created: number }[]`. Platform datasets run with `scope = { systemScope: true }` and stamp `company_id: 0` on each row (the `works` convention).

### G1.2 Addon default-data modules (normalized signature)
- Convention: each addon that owns platform data ships `addons/<name>/data/index.ts` exporting `async function loadDefaultData(ctx: SeedContext): Promise<SeedResult>` built on `seedDatasets`, plus `addons/<name>/data/default.ts` holding the typed row arrays.
- **`base`** (new `data/`): `addons/base/data/default.ts` — `DEFAULT_COUNTRIES` (ISO code, name, phone_code), `DEFAULT_CURRENCIES` (name, symbol, decimal_places), `DEFAULT_LANGS` (code, name, direction, formats) and a small platform `ir_translation` UI catalog. `addons/base/data/index.ts` orders datasets so currencies → countries (country `currency_id` m2o resolves after currencies exist). Company_id 0.
- **`project`** (new `data/`): default `project.task.stage` set (Backlog/In Progress/In Review/Done with `sequence`) keyed by `name` — moves the concept that today only appears via `ir.cron` seeding.
- **`works`**: keep `data/default.ts`; refactor `data/index.ts` to the `loadDefaultData(ctx)` signature using `seedIdempotent` (keyField `slug`); retain `export { loadWorksDefaultData }` as a thin back-compat alias so nothing outside the loader breaks mid-migration.
- **`mw_llm_router`**: relocate the default `ai.provider` / `ai.virtual_key` seed rows out of `packages/arsy-plugin-llm-gateway/src/router.ts:83 seedDefaultsIfEmpty` into `addons/mw_llm_router/data/`, keyed on provider identifier. The plugin init keeps a guard but defers to the addon dataset (single source of truth); if relocation is too invasive in one step, mark the plugin seed `@deprecated` and add a consistency note, but prefer moving it.
- **`mw_qorpus`, `mw_storage`, `orbit`, `nexus`**: no platform-owned reference rows (they hold tenant/user content) → declare an **empty** dataset (`data: []` in the manifest, and `loadDefaultData` returns `[]`). Empty-but-declared is the point: absence must be deliberate, not accidental.

### G1.3 Manifest declares its data
- Add `data: string[]` (relative module paths, e.g. `["data/index.ts"]`) to `AddonManifest` (`addons/index.ts:28-33`) and to every `addons/*/__manifest__.json`. Optional `demo?: string[]` for sample rows gated off in production.
- Addons with no data use `"data": []` explicitly.

### G1.4 Static seed registry + generic boot loader
- New `addons/default-data.ts`: `const DEFAULT_DATA_REGISTRY: Record<string, (ctx: SeedContext) => Promise<SeedResult>>` mapping each addon name to its `data/index.ts` loader (static imports, like `ADDON_CATALOG`). Export `resolveSeedOrder(roots)` = `resolveLoadOrder` filtered to addons that have a registry entry.
- Rewrite `apps/arsy/src/seed.ts:runBootSeed` to: build a `SeedContext` (`repository` factory over `modelRegistry`, `actor = SYSTEM_ACTOR`); walk addons in dependency order via `resolveSeedOrder(ALL_ADDON_NAMES)`; per addon call its loader, accumulating `{ created }` totals; log a one-line summary per addon. Preserve boot-resilience (a per-addon try/catch so one bad dataset can't abort the boot; aggregate rethrow is NOT desired).
- Move the `ir.cron` default seed out of the `POST /v1/admin/cron/seed/:companyId` route's bespoke body into `addons/project/data` as a per-company default (the route can call the same dataset with a tenant scope), so there is one cron definition, not two.

### G1.5 Demo vs production split
- `runBootSeed` seeds `data` always; seeds `demo` only when `process.env.ARSY_SEED_DEMO === 'true'` (non-production). Keeps the public e-isp demo footprint out of production tenants.

**Dependencies:** G1.1 → G1.2 → G1.4; G1.3 → G1.4 and → Group 3 gate. G1.5 after G1.4. Group 1 precedes Group 3 (the gate validates what Group 1 creates).

---

## Group 2 — Per-unit CONTRACT artifacts + the contract doc

### G2.1 Author `CONTRACT.md` for every unit (add-ons, packages, apps)
- File at each unit root: `addons/<name>/CONTRACT.md`, `packages/<name>/CONTRACT.md`, `apps/<name>/CONTRACT.md` (23 files total: 8 + 12 + 11… `packages/lint` included).
- Common YAML frontmatter (reuses `check-doc-contracts.ts` `parseFrontmatter`):
  `id` (UPPER_SNAKE unique), `tier` (`addon|package|app`), `name`, `owner`, `version` (semver), `status` (from the existing `VALID_STATUSES`), `last_verified` (YYYY-MM-DD), `summary`.
- Tier-specific keys:
  - **addon:** `depends[]`, `models[]`, `data[]` (must mirror `__manifest__.json`), `installable`.
  - **package:** `publicSurface[]` (the exported symbols / entry file), `depends[]`.
  - **app:** `routes[]`, `skin` (for Next apps rendering `<SkinRoot>`), `ports[]` (numeric only, no secrets/`NEXT_PUBLIC_*`).
- Body is factual (real models, real routes, real data files) so it passes the antislop/link checks by construction — not marketing filler.

### G2.2 Re-align and tighten the contract doc
- Update `DOCUMENTATION_CONTRACT.md` (and bump its frontmatter `version`) to declare: the default-data manifest requirement (`data` key on every addon, empty when intentional), the per-unit `CONTRACT.md` schema per tier, and the gates that enforce consistency (`ADDON DEFAULT DATA`, `UNIT_CONTRACT_CONSISTENCY`, the new `contract:check`, and the tightened `docs:check`).
- Tighten `scripts/check-doc-contracts.ts`:
  - **Coverage:** replace the hard-coded 4-app README list with dynamic enumeration that requires **every** app/package/addon to carry a valid `CONTRACT.md` (READMEs stay for the 4 existing apps; do not force synthetic READMEs and risk slop).
  - **Stricter schema:** require `owner`, valid semver, ISO `last_verified`, `status ∈ VALID_STATUSES`, and a `tier` field for contract docs; fail (not just subtract points) on a missing required field.
  - **Consistency vs code:** add a cross-check that an addon CONTRACT `models`/`data` equals its `__manifest__.json` values (thin check here; the deep code cross-check lives in Group 3).
  - Keep the 100/100 threshold.

**Dependencies:** G2.1 before G2.2 checks (a required file that does not yet exist would fail). Group 2 independent of Group 1 except both feed Group 3.

---

## Group 3 — Machine gates enforcing the contracts

### G3.1 New unit-contract gate: `scripts/check-unit-contracts.ts` + `contract:check`
- Mirrors the reporting style of `check-doc-contracts.ts`: enumerate `addons/*` (dirs), `packages/*` (dirs with `package.json`), `apps/*` (dirs with `package.json`).
- For each unit validate, and exit 1 on any violation:
  - **Presence:** `CONTRACT.md` exists with valid frontmatter and correct `tier`/`id`/`name` (name matches `__manifest__.json` `name` for addons, `package.json` `name` for packages/apps).
  - **Addon consistency:** CONTRACT `models` == `__manifest__.json` `models` == `defineModel` names found under the addon dir (reuse the same parse logic as the arch gate; or import a tiny shared parser); CONTRACT `data` == manifest `data`; every declared `data/<path>` file exists.
  - **Package consistency:** `publicSurface[]` symbols resolve in the package's `src/index.ts` exports; the seeder-relevant note: `arsy-orm` contract lists the new `default_data` exports.
  - **App consistency:** declared `routes` exist under `src/app`; declared `skin` matches the `layout.tsx` `<SkinRoot skin="…">` (same regex as `checkSkinRoot`).
- Add `"contract:check": "tsx scripts/check-unit-contracts.ts"` to `package.json` (scripts block). Keep it runnable in the gate list; optionally chain from `dev` next to `lint:arch`.

### G3.2 Arch-gate rules (`packages/lint/src/check-architecture.mjs`)
- **`ADDON_DEFAULT_DATA`** (new `checkAddonDefaultData()`, called in the "Run all rules" block after `checkAddonManifests`): every addon `__manifest__.json` must include a `data` array; each declared path exists under the addon; every non-empty dataset is wired into `DEFAULT_DATA_REGISTRY` (`addons/default-data.ts`) so a declared-but-unregistered dataset fails; addons that register `company_id`-bearing models (detected via `parseDefineModels`) must either declare data or an explicit empty `data: []` (no silent omission).
- **`UNIT_CONTRACT_CONSISTENCY`** (new function): the addon-side of G3.1 (models/data match manifest and registered `defineModel` names), reusing `collectAllModels`/`parseDefineModels`/`addViolation`. This keeps the code-vs-contract invariant inside the architectural gate that already owns model introspection.
- Add a `✓ Addon Default Data` and `✓ Unit Contract` line to the success print block (`check-architecture.mjs:1026-1043`) so PASS output stays honest.
- Use the existing `style-baseline.json` ratchet only if a transitional allowlist is needed; the target is to author all Group-2 artifacts first so the gate is strict from day one.

**Dependencies:** Group 3 runs after Groups 1 and 2 exist (else it correctly fails). G3.2 depends on the `DEFAULT_DATA_REGISTRY` shape from G1.4 and the manifests from G1.3.

---

## Group 4 — Verification & tests

- New integration test `apps/arsy/test/default_data.test.mjs`: boots against PGlite, runs `runBootSeed` twice, asserts the second run creates 0 rows (idempotency), that `base` countries/currencies/languages exist with `company_id: 0`, and that composite/country `currency_id` ordering resolves (currencies before countries).
- Unit test for `seedIdempotent` composite-key and empty-dataset paths (`packages/arsy-orm/src/default_data.test.ts`).
- Extend `scripts/check-doc-contracts.ts` self-coverage implicitly by running the gates.
- Gates that must all end green: `pnpm typecheck`, `pnpm lint` (`--max-warnings 0`), `pnpm lint:arch`, `pnpm docs:check`, `pnpm contract:check`, `pnpm --filter @allah/arsy-orm build`, `pnpm --filter @moonwitness/headquarter build` (and any touched app), `pnpm ui:test`, `pnpm ui:contrast`, SDK tests, `apps/arsy` tests. Run the arsy boot to confirm "boot resilience" still logs-and-continues on a simulated seed error.

---

## Risks and mitigations

- **Dynamic import of manifest files won't bundle** → declarative manifest `data` + **static** `DEFAULT_DATA_REGISTRY`; the gate enforces they agree (Odoo intent, this repo's reality).
- **Audit-FK / actor ordering** → seeding runs after `SchemaMigrator.sync()` creates the `system` bot; keep seed strictly post-build as today; covered by the boot test.
- **Strict new gates flip CI red** until every unit has a `CONTRACT.md` → author all Group-2 artifacts before enabling strict; no `@ts-ignore`/allowlist shortcuts.
- **Duplicate seed sources** (plugin + route + addon) → single source of truth in the addon dataset; plugin route/`seedDefaultsIfEmpty` delegate to it (or `@deprecated` with a tracked follow-up if a full move is too large for one pass).
- **Idempotency on wrong key** → explicit `keyFields` per dataset (composite supported); never blind-insert.
- **Antislop on CONTRACT docs** → docs are code-derived facts, not filler; run `docs:check`.
- **`company_id 0` leak into tenant reads** → datasets are platform rows only; tenant overrides stay per-tenant (already the i18n pattern in `app.ts:853-877`).
- **Scope size (23 CONTRACT files + 8 addons)** → Group ordering lets each subgroup land and verify independently; Group 1 is functional, Group 2/3 are the governance layer.

## Rejected alternatives

- **Dynamic `import()` of manifest-declared data files at boot** (purest Odoo) — rejected: the app is bundled via static imports (see `addons/index.ts`); dynamic paths break the bundler and hide wiring bugs. Kept the declarative contract and added a registry + gate to preserve the same guarantee.
- **Full React-Query-style / external seeding framework or new deps** — rejected: violates the no-extra-infra invariant; `BaseRepository` already offers the needed `find`/`createMany`.
- **Put the whole mechanism in the ORM and make addons data-less** — rejected: the row content is addon domain knowledge; the ORM owns only the generic `seedIdempotent` primitive, addons own the data. Keeps design-system/domain ownership boundaries.
- **Only a gate, no `CONTRACT.md`** — rejected: the user explicitly asked for per-addon/package/app contracts and a doc; docs are the human-readable source the gate validates.
- **Only a doc, no gate** — rejected: drift is exactly today's failure (scattered seeds, no coverage); machine enforcement is the point.
- **Force a fresh README for all 7 apps without READMEs** — rejected for this pass: high slop risk and no information gain; require factual `CONTRACT.md` for full coverage instead, leaving README authorship as an optional follow-up.
- **Ratchet the new gates with a permanent allowlist** — rejected as the default: allowlisting hides gaps; author the artifacts so strictness holds from day one (baseline only as a last-resort transitional aid).