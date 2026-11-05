---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DOCUMENTATION_CONTRACT"
version: "1.5.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-05"
---
# Documentation Contract

One canonical source per topic. Link — never copy rules across files. Read with [AGENTS.md](AGENTS.md).

## Document Ownership

| Document | Owns |
|---|---|
| `README.md` | Entry point · capabilities · setup · deployment |
| `AGENTS.md` | Always-on engineering rules · monorepo map · invariants · quality gates · plans standard |
| `AUTONOMOUS.md` | Execution loop · security audit steps · git workflow |
| `GOAL.md` | Mission · /goal directive |
| `DOCUMENTATION_CONTRACT.md` | These rules |
| `BLUEPRINT.md` | Target architecture · layer stack · swarm endpoints · delivery |
| `DESIGN.md` | Product experience · Moon UI doctrine · DNA app assignments · interaction |
| `BACKLOG.md` | Tasks · priorities · statuses · evidence |
| `ROADMAP.md` | Strategic stages only |
| `CHANGELOG.md` | Changes that actually happened |
| `DECISIONS.md` | Accepted ADRs · rationale · consequences |
| `QUALITY.md` | Definition of done · verification baseline |
| `LEGACY_RECONCILIATION.md` | Source inventory · provenance · disposition |
| `addons/*/__manifest__.json` | Addon metadata · `depends` · `models` · `data` (default-data modules; `[]` when deliberate) |
| `addons/*`·`packages/*`·`apps/*` `CONTRACT.md` | Per-unit contract: factual surface validated against code by the gates |
| `packages/lint/src/contract/schema.json` | The one machine-readable unit-contract schema (per-tier required scalars/lists, status/tier allowlists, id/version/date patterns) shared by all three gates |
| `.contracts/units.json` | Derived, read-only index of every unit's contract surface; regenerated from `CONTRACT.md` by `pnpm contract:index` (never a source of truth) |
| `docs/architecture/PLATFORM_CONTRACT.md` | Cross-unit Compose, runtime, environment, CI, API, model, and release contract |
| `apps/*/README.md` | App-specific purpose + verified commands |
| `apps/*/AGENTS.md` | App-specific rules extending root |

Source-of-truth priority: `source code + manifests + tests + runtime > DECISIONS.md > BACKLOG.md > this contract`

## Writing Rules

- One `#` heading per document.
- Tables + lists over prose. No filler, unsupported claims, or repeated policy text.
- No time/budget estimates unless requested and evidence-backed.
- Repo-relative links only. Verify target exists.
- Format: commands · paths · identifiers · statuses → `` `code` ``.
- States: `proposed` · `in_progress` · `implemented` · `verified` · `released` · `deployed` — mark distinctly.
- Cite source/test/decision when claim depends on evidence. Record failures; never imply skipped check passed.
- No secrets, private URLs, credentials, or personal data.

## Change Matrix

| Changed | Update |
|---|---|
| Capability / setup / deployment | `README.md` + `CHANGELOG.md` + affected app README |
| Architecture / ownership / integration | `BLUEPRINT.md` + `DECISIONS.md` |
| Product experience / visual system | `DESIGN.md` |
| Task / status / evidence | `BACKLOG.md`; `ROADMAP.md` only when strategic stages change |
| Quality criteria / agent execution | `QUALITY.md` + `AUTONOMOUS.md` or `AGENTS.md` |
| Provenance / legacy | `LEGACY_RECONCILIATION.md` |
| Documentation rules | This file + root agent guidance |

## Lifecycle

1. Identify owner doc and inspect linked source of truth.
2. Smallest change that fully reflects verified behavior or accepted decision.
3. Check links · commands · names · statuses · branch refs still match repo.
4. Review rendered Markdown. Run `git diff --check`.
5. Changelog: actual changes only. Backlog: update when tracked task affected.

## Unit Contracts & Default Data

Every unit (addon, package, app) carries a `CONTRACT.md` at its root: a factual, code-derived declaration of its surface. The gate verifies the doc against the code, so a contract that drifts fails CI.

Shared frontmatter (all tiers): `id` (UPPER_SNAKE, unique) · `tier` (`addon|package|app`) · `name` · `owner` · `version` (semver) · `status` (see Writing Rules states) · `last_verified` (ISO date) · `summary`. Lists use the bracket-comma form (`[a, b]`) since the frontmatter parser reads only scalar lines. The canonical required-field set, tier allowlists and patterns live in `packages/lint/src/contract/schema.json` — the single source all three gates read (this table mirrors it, it is not the definition).

| Tier | `name` source | Tier-specific keys |
|---|---|---|
| addon | `__manifest__.json` `name` | `depends[]` · `models[]` · `data[]` (mirror the manifest) · `installable` |
| package | `package.json` `name` | `publicSurface[]` (exported symbols) · `depends[]` |
| app | `package.json` `name` | `routes[]` · `skin` (Next apps rendering `<SkinRoot>`) · `ports[]` (numeric only, no secrets) |

Default data (Odoo-style, ORM-backed): every addon manifest declares `data: string[]` — relative module paths, `[]` when the addon deliberately owns no platform reference rows (absence must be explicit, never accidental). Each non-empty module exports `loadDefaultData(ctx: SeedContext): Promise<SeedResult>` built on `seedIdempotent`/`seedDatasets` (`packages/arsy-orm`). Loaders are wired statically into `addons/default-data.ts` (`DEFAULT_DATA_REGISTRY`); the generic `runBootSeed` walks them in dependency order, `company_id: 0`, idempotently. `demo: string[]` is seeded only when `ARSY_SEED_DEMO=true` and not production.

Enforcing gates:

| Gate | Command | Checks |
|---|---|---|
| `ADDON_DEFAULT_DATA` | `pnpm lint:arch` | manifest has a `data` array; each path exists and exports `loadDefaultData`; non-empty datasets registered in `DEFAULT_DATA_REGISTRY` |
| `UNIT_CONTRACT_CONSISTENCY` | `pnpm lint:arch` | code<->contract mirror for every tier: addon `models`/`data` equal the manifest; package `publicSurface` symbols are exported from src; app `routes` exist under `src/app` and `skin` matches `<SkinRoot>` |
| unit-contract gate | `pnpm contract:check` | presence + `tier`/`id`/`name` per unit; addon/package/app surface resolves against code |
| documentation contract | `pnpm docs:check` | `CONTRACT.md` coverage for every unit; stricter schema; thin addon `models`/`data`==manifest cross-check |
| contract index freshness | `pnpm contract:index:check` | `.contracts/units.json` (derived from `CONTRACT.md` + manifests) is current; a stale digest fails the gate — regenerate with `pnpm contract:index` |

## Platform Contract

Cross-unit deployment and release invariants are owned by
`docs/architecture/PLATFORM_CONTRACT.md` and enforced by
`pnpm platform:contract:check`. CI and production publication also run unit,
architecture, Arsy API, and ORM persistence gates before image publication.

## Generated Docs

Framework-generated files + Arsy Hub reference (`apps/arsy/`) follow upstream format. Do not reformat. Edit only through source or generator.
