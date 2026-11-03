---
id: WORLD-OBSERVATORY-TASKS
version: 1.0.0
owner: engineering
status: proposed
progress: 0/258
---

# WORLD OBSERVATORY — Granular Execution Checklist

Status: [ ] pending, [/] in progress, [x] completed, [!] blocked. Mark complete only when evidence exists. Update this file and spec.md during execution.

## Phase 00 — Governance and repository discovery
- [ ] T0001 Read AGENTS.md and record constraints.
- [ ] T0002 Read AUTONOMOUS.md and record execution gates.
- [ ] T0003 Read DOCUMENTATION_CONTRACT.md and map affected docs.
- [ ] T0004 Read LEGACY_RECONCILIATION.md.
- [ ] T0005 Read QUALITY.md and identify mandatory gates.
- [ ] T0006 Read DECISIONS.md and search for existing app decisions.
- [ ] T0007 Read ROADMAP.md and check for duplicate work.
- [ ] T0008 Read core antislop skill and verify operating mode.
- [ ] T0009 Read UI antislop skill.
- [ ] T0010 Read code antislop skill.
- [ ] T0011 Read human antislop skill.
- [ ] T0012 Inspect active branch and worktree state in implementation environment.
- [ ] T0013 Verify pnpm workspace version and package globs.
- [ ] T0014 Verify Next.js/React/TypeScript/Tailwind versions in existing apps.
- [ ] T0015 Inspect Dock route/layout conventions.
- [ ] T0016 Inspect Headquarter route/layout conventions.
- [ ] T0017 Inspect ID route/layout conventions.
- [ ] T0018 Inventory shared UI exports, tokens, themes, and primitives.
- [ ] T0019 Inventory SDK exports and server-side request patterns.
- [ ] T0020 Inventory shared types exports and conventions.
- [ ] T0021 Inspect root and app-specific scripts.
- [ ] T0022 Inspect CI workflows and app build-gate patterns.
- [ ] T0023 Inspect Docker/deployment conventions without modifying them.
- [ ] T0024 Search repository docs/issues for existing Observatory/JIZZ work.
- [ ] T0025 Record baseline, unknowns, and implementation constraints.

## Phase 01 — JIZZ domain/API audit
- [ ] T0101 Read JIZZ README and identity.
- [ ] T0102 Read JIZZ DOMAIN.md and ontology.
- [ ] T0103 Read JIZZ ECOSYSTEM.md and ownership map.
- [ ] T0104 Read JIZZ BOUNDARIES.md and forbidden overlaps.
- [ ] T0105 Read JIZZ SCHEMA.md and schema versions.
- [ ] T0106 Read JIZZ DATA_MODEL.md and relationships.
- [ ] T0107 Read JIZZ API.md and implemented endpoints.
- [ ] T0108 Read JIZZ INTEROP.md and foreign-reference contract.
- [ ] T0109 Read JIZZ PROVENANCE.md.
- [ ] T0110 Read JIZZ ANALYTICS.md and metric formulas/version.
- [ ] T0111 Read JIZZ RESEARCH_POLICY.md.
- [ ] T0112 Inspect live corpus and distinguish it from golden fixtures.
- [ ] T0113 Inspect actual server/API implementation, not docs alone.
- [ ] T0114 Inspect GET /phenomena response.
- [ ] T0115 Inspect GET /phenomena/:id response.
- [ ] T0116 Inspect observations response.
- [ ] T0117 Inspect perspectives response.
- [ ] T0118 Inspect framings and reactions responses.
- [ ] T0119 Inspect signals and changes responses.
- [ ] T0120 Inspect snapshots and insights responses.
- [ ] T0121 Inspect source and foreign-reference responses.
- [ ] T0122 Determine external reachability of JIZZ API.
- [ ] T0123 Determine CORS/network/server-side access constraints.
- [ ] T0124 Determine pagination, filtering, sorting, and response-size limits.
- [ ] T0125 Determine freshness and update cadence from implementation.
- [ ] T0126 Determine error/404/405 response formats.
- [ ] T0127 Determine auth/public-read policy.
- [ ] T0128 Map JIZZ fields to frontend view models.
- [ ] T0129 Mark unsupported fields explicitly; invent no data.
- [ ] T0130 Record read-only integration strategy or create conflict.md.

## Phase 02 — Product and information architecture
- [ ] T0201 Confirm public name WORLD OBSERVATORY.
- [ ] T0202 Confirm engine credit POWERED BY ROCKSOUL JIZZ.
- [ ] T0203 Confirm primary question and tagline.
- [ ] T0204 Define user roles/jobs without sensitive profiling.
- [ ] T0205 Define Observatory home hierarchy.
- [ ] T0206 Define Phenomena catalogue hierarchy.
- [ ] T0207 Define Phenomenon detail hierarchy.
- [ ] T0208 Define Perspective comparison hierarchy.
- [ ] T0209 Define Signals index/detail hierarchy.
- [ ] T0210 Define Timeline/snapshot hierarchy.
- [ ] T0211 Define Sources directory hierarchy.
- [ ] T0212 Define Methodology hierarchy.
- [ ] T0213 Define primary navigation and route ownership.
- [ ] T0214 Define breadcrumbs and deep-link behavior.
- [ ] T0215 Define filters supported by actual schema.
- [ ] T0216 Define empty/filtered-empty/stale/partial/unavailable/error states.
- [ ] T0217 Define source attribution display rules.
- [ ] T0218 Define uncertainty presentation from schema only.
- [ ] T0219 Define synthetic/live labeling and isolation.
- [ ] T0220 Review boundaries against Dock/Headquarter/ID.

## Phase 03 — Design system and visual direction
- [ ] T0301 Inspect Moon UI tokens and theme behavior.
- [ ] T0302 Inspect typography/font loading strategy.
- [ ] T0303 Inspect iconography and icon package policy.
- [ ] T0304 Inspect shared nav/tabs/menu/button/input/data primitives.
- [ ] T0305 Define World Observatory visual identity.
- [ ] T0306 Define color roles using existing tokens first.
- [ ] T0307 Define typography hierarchy.
- [ ] T0308 Define spacing/density/radius/border/elevation rules.
- [ ] T0309 Define chart color semantics.
- [ ] T0310 Define signal/change visual semantics without truth ranking.
- [ ] T0311 Define map eligibility and no-map fallback.
- [ ] T0312 Define desktop home composition.
- [ ] T0313 Define tablet home composition.
- [ ] T0314 Define mobile home composition.
- [ ] T0315 Define desktop phenomenon detail.
- [ ] T0316 Define mobile phenomenon detail.
- [ ] T0317 Define responsive perspective comparison.
- [ ] T0318 Define timeline visualization and accessible alternative.
- [ ] T0319 Define motion and reduced-motion behavior.
- [ ] T0320 Review and remove generic-dashboard patterns.

## Phase 04 — App foundation/workspace
- [ ] T0401 Confirm apps/world-observatory does not already exist.
- [ ] T0402 Confirm app/package naming convention.
- [ ] T0403 Create package manifest using verified workspace conventions.
- [ ] T0404 Configure Next.js 16 App Router.
- [ ] T0405 Align React 19 dependencies.
- [ ] T0406 Configure TypeScript strict mode.
- [ ] T0407 Configure Tailwind v4 using repository conventions.
- [ ] T0408 Add shared UI dependency.
- [ ] T0409 Add shared types dependency.
- [ ] T0410 Add SDK dependency only where required.
- [ ] T0411 Define server-only environment schema; commit no secrets.
- [ ] T0412 Add root dev script.
- [ ] T0413 Add root build script.
- [ ] T0414 Add typecheck/lint scripts consistent with repo.
- [ ] T0415 Define metadata and approved favicon/asset strategy.
- [ ] T0416 Build root layout with semantic landmarks and Moon UI theme.
- [ ] T0417 Add app styles without duplicate resets/tokens.
- [ ] T0418 Add not-found and error boundaries.
- [ ] T0419 Add useful loading boundaries.
- [ ] T0420 Verify independent app startup without mock-success claims.

## Phase 05 — Typed read-only JIZZ adapter
- [ ] T0501 Define server-only upstream base URL.
- [ ] T0502 Validate upstream URL configuration.
- [ ] T0503 Reject arbitrary URL overrides from request parameters.
- [ ] T0504 Define Phenomenon transport schema.
- [ ] T0505 Define Source transport schema.
- [ ] T0506 Define Observation transport schema.
- [ ] T0507 Define Perspective transport schema.
- [ ] T0508 Define Framing and Reaction schemas.
- [ ] T0509 Define Signal and Change schemas.
- [ ] T0510 Define Snapshot and Insight schemas.
- [ ] T0511 Define ForeignReference schema.
- [ ] T0512 Add runtime response validation.
- [ ] T0513 Define explicit transport-to-view-model mapping.
- [ ] T0514 Preserve IDs and schema versions.
- [ ] T0515 Preserve source/provenance references.
- [ ] T0516 Preserve observed/published/retrieved timestamps separately.
- [ ] T0517 Preserve unknown/absent fields without guessing.
- [ ] T0518 Implement bounded request timeout.
- [ ] T0519 Implement bounded retry for safe GET only.
- [ ] T0520 Define cache/revalidation from freshness requirements.
- [ ] T0521 Define timeout/upstream/invalid-payload/not-found errors.
- [ ] T0522 Add redacted request correlation logs.
- [ ] T0523 Test valid adapter payloads.
- [ ] T0524 Test malformed and partial payloads.
- [ ] T0525 Test stale/unavailable/timeout cases.

## Phase 06 — Observatory overview
- [ ] T0601 Implement home route.
- [ ] T0602 Implement product identity header.
- [ ] T0603 Implement central question and explanatory copy.
- [ ] T0604 Fetch live phenomenon index through adapter.
- [ ] T0605 Render only source-backed phenomena.
- [ ] T0606 Show observed/retrieved timestamp accurately.
- [ ] T0607 Show coverage counts with explicit denominators.
- [ ] T0608 Render latest signals only when present.
- [ ] T0609 Render perspective shifts only with evidence.
- [ ] T0610 Implement loading state.
- [ ] T0611 Implement empty state.
- [ ] T0612 Implement partial/stale state.
- [ ] T0613 Implement upstream unavailable state.
- [ ] T0614 Add responsive layout and keyboard behavior.
- [ ] T0615 Add overview route/component tests.

## Phase 07 — Phenomena catalogue/detail
- [ ] T0701 Implement /phenomena.
- [ ] T0702 Add search by supported title/ID.
- [ ] T0703 Add filters only for validated schema fields.
- [ ] T0704 Add deterministic stable sorting.
- [ ] T0705 Add bounded pagination.
- [ ] T0706 Add no-results state.
- [ ] T0707 Add invalid-filter state.
- [ ] T0708 Implement /phenomena/[id].
- [ ] T0709 Validate phenomenon route ID.
- [ ] T0710 Render phenomenon identity and scope.
- [ ] T0711 Render source-grounded summary.
- [ ] T0712 Render evidence counts and definitions.
- [ ] T0713 Render observation list with source links.
- [ ] T0714 Render perspectives without truth ranking.
- [ ] T0715 Render signal/change summaries with methodology.
- [ ] T0716 Render foreign references with owner labels.
- [ ] T0717 Add invalid/unknown phenomenon state.
- [ ] T0718 Test detail route and provenance assertions.

## Phase 08 — Perspectives and comparison
- [ ] T0801 Implement /perspectives.
- [ ] T0802 Define supported filters from schema.
- [ ] T0803 Render perspective list with provenance summary.
- [ ] T0804 Implement phenomenon perspective view.
- [ ] T0805 Add actor-type grouping only when supported.
- [ ] T0806 Add geography grouping only when supported.
- [ ] T0807 Add framing grouping only when supported.
- [ ] T0808 Add position grouping only when supported.
- [ ] T0809 Add chronological grouping when timestamps exist.
- [ ] T0810 Implement wide-screen side-by-side comparison.
- [ ] T0811 Implement mobile stacked comparison.
- [ ] T0812 Show source/observation count per group.
- [ ] T0813 Show unknown/missing dimensions explicitly.
- [ ] T0814 Verify no winner/truth score/credibility rank.
- [ ] T0815 Test conflicting, incomplete, and sparse perspectives.

## Phase 09 — Signals, changes, timeline, methodology
- [ ] T0901 Implement /signals.
- [ ] T0902 Add filters by supported signal type.
- [ ] T0903 Implement /signals/[id].
- [ ] T0904 Display methodology version.
- [ ] T0905 Display exact input snapshot/observation references.
- [ ] T0906 Explain signal rule and limitations.
- [ ] T0907 Distinguish signal from event/prediction.
- [ ] T0908 Implement /timeline.
- [ ] T0909 Render snapshots chronologically.
- [ ] T0910 Distinguish observed/published/retrieved times.
- [ ] T0911 Compare snapshots only when both exist.
- [ ] T0912 Add accessible timeline list alternative.
- [ ] T0913 Implement /methodology.
- [ ] T0914 Explain ontology and ownership boundaries.
- [ ] T0915 Explain formulas and normalization.
- [ ] T0916 Explain uncertainty, coverage, and limitations.
- [ ] T0917 Explain synthetic versus live data.
- [ ] T0918 Test signal/timeline evidence chains.

## Phase 10 — Sources and provenance
- [ ] T1001 Implement /sources.
- [ ] T1002 Render source identity/type when available.
- [ ] T1003 Validate source URL protocol.
- [ ] T1004 Render publication/retrieval timestamps separately.
- [ ] T1005 Link sources to supported observations.
- [ ] T1006 Render inaccessible/stale/unknown state honestly.
- [ ] T1007 Apply attribution and copyright-safe excerpt policy.
- [ ] T1008 Implement observation provenance panel.
- [ ] T1009 Implement insight → snapshot → observation → source trace.
- [ ] T1010 Test provenance completeness and broken references.

## Phase 11 — Security/accessibility/resilience
- [ ] T1101 Review server/client module boundaries.
- [ ] T1102 Verify no secret in NEXT_PUBLIC or browser bundle.
- [ ] T1103 Test URL validation and SSRF rejection.
- [ ] T1104 Test invalid query params and route IDs.
- [ ] T1105 Test malformed upstream payload handling.
- [ ] T1106 Test bounded timeout/retry.
- [ ] T1107 Test response-size and pagination limits.
- [ ] T1108 Audit source links and output encoding.
- [ ] T1109 Audit privacy and unnecessary personal-data exposure.
- [ ] T1110 Test keyboard-only navigation.
- [ ] T1111 Test screen-reader labels/landmarks for core journeys.
- [ ] T1112 Test visible focus states.
- [ ] T1113 Test contrast.
- [ ] T1114 Test reduced-motion preference.
- [ ] T1115 Test desktop viewport.
- [ ] T1116 Test tablet viewport.
- [ ] T1117 Test mobile viewport and horizontal overflow.
- [ ] T1118 Test empty/stale/partial/offline/timeout/error states.
- [ ] T1119 Verify synthetic data is never mislabeled live.
- [ ] T1120 Verify no unsupported truth/prediction/coverage claims.

## Phase 12 — Documentation, CI, final verification
- [ ] T1201 Add app README with verified local instructions.
- [ ] T1202 Update BLUEPRINT.md with app boundary/status.
- [ ] T1203 Update DESIGN.md with approved product-specific design.
- [ ] T1204 Update BACKLOG.md with stable IDs and evidence.
- [ ] T1205 Update DECISIONS.md with accepted ADR.
- [ ] T1206 Update CHANGELOG.md only for implemented changes.
- [ ] T1207 Update root README app map only after app exists.
- [ ] T1208 Inspect CI structure before changing it.
- [ ] T1209 Add app build/typecheck/lint/test to correct gates.
- [ ] T1210 Run app unit/integration tests.
- [ ] T1211 Run app lint and typecheck.
- [ ] T1212 Run app production build.
- [ ] T1213 Run pnpm docs:check.
- [ ] T1214 Run Dock build.
- [ ] T1215 Run Headquarter build.
- [ ] T1216 Run ID build.
- [ ] T1217 Run Arsy build where required/feasible.
- [ ] T1218 Review diff for unrelated changes and secrets.
- [ ] T1219 Verify every visible link/control and shipped route.
- [ ] T1220 Create report.md with exact commands/results/evidence/limitations.
- [ ] T1221 Set spec status completed only after all DoD criteria pass.
- [ ] T1222 Prepare PR/handoff; do not merge or deploy without authorization.

## Phase 13 — Release readiness (separate authorization)
- [ ] T1301 Confirm user approval for deployment scope.
- [ ] T1302 Confirm hosting/runtime topology and resources.
- [ ] T1303 Confirm environment variables and secret ownership.
- [ ] T1304 Confirm health/readiness checks.
- [ ] T1305 Confirm rollback strategy.
- [ ] T1306 Confirm domain/subdomain and DNS ownership.
- [ ] T1307 Confirm deployment workflow and image policy.
- [ ] T1308 Deploy to approved preview environment.
- [ ] T1309 Run preview smoke tests.
- [ ] T1310 Record evidence; do not label production released unless verified.

## Phase 14 — Product acceptance
- [ ] T1401 Review UJ-01 global pulse end-to-end.
- [ ] T1402 Review UJ-02 perspective comparison end-to-end.
- [ ] T1403 Review UJ-03 signal evidence end-to-end.
- [ ] T1404 Review UJ-04 source tracing end-to-end.
- [ ] T1405 Review UJ-05 historical movement end-to-end.
- [ ] T1406 Review UJ-06 missing coverage honesty end-to-end.
- [ ] T1407 Confirm identity distinct from Headquarter and Dock.
- [ ] T1408 Confirm JIZZ remains PERSPECTIVE owner only.
- [ ] T1409 Confirm no fabricated/misleading UI or data.
- [ ] T1410 Record final acceptance evidence and close plan.
