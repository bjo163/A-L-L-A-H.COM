---
id: WORLD-OBSERVATORY
version: 1.0.0
owner: product-architecture
status: proposed
last_verified: 2026-11-03
target_branch: feat/world-observatory-plan
target_app: apps/world-observatory
framework: Next.js 16 App Router
---

# WORLD OBSERVATORY — Product & Functional Specification

## 1. Product definition

**Product:** WORLD OBSERVATORY  
**Category:** Global multi-perspective intelligence observatory  
**Engine:** ROCKSOUL JIZZ  
**Primary question:** HOW IS THE WORLD SEEING IT?  
**Tagline:** THE WORLD, FROM EVERY ANGLE.

WORLD OBSERVATORY is a standalone Next.js application inside A-L-L-A-H.COM. It presents source-grounded observations about public phenomena, compares perspectives and framings, tracks changes over time, and exposes explainable analytical outputs. It is not a generic news feed, prediction engine, truth-ranking service, or replacement for other ROCKSOUL domain repositories.

JIZZ owns the PERSPECTIVE domain. It does not own the underlying STORY, EVENT, PERSON, TEXT, LAW, or RELATIONSHIP.

## 2. Product placement and technical target

- Application directory: apps/world-observatory/
- Framework: Next.js 16 App Router.
- UI runtime: React 19.
- Language: TypeScript, strict mode.
- Styling: Tailwind CSS v4 using current workspace conventions.
- Package manager: existing pnpm workspace.
- Shared UI: @moonwitness/ui.
- Shared API client: @allah/sdk, only for approved A-L-L-A-H.COM / ARSY / SSO communication.
- Shared contracts: @moonwitness/types where appropriate.
- Intelligence domain: ROCKSOUL JIZZ, separate repository bjo163/rocksoul-jizz.
- Integration scope: read-only initially.
- Deployment: excluded until separately approved.

Do not implement this as a Headquarter route, Dock page, MoonWitness story page, or a generic administration dashboard.

## 3. Verified repository baseline and assumptions

Repository documentation identifies:
- A-L-L-A-H.COM as a pnpm monorepo.
- Existing Next.js 16 / React 19 / Tailwind v4 apps: Dock, Headquarter, and ID.
- Shared packages: packages/ui, packages/sdk, packages/types.
- ARSY Hub under apps/arsy.
- Development branch convention: dev; CI promotion to main after configured gates pass.
- JIZZ as canonical owner of PERSPECTIVE.
- JIZZ currently has a read-only demonstration API, live observatory UI, source-backed bootstrap corpus, and separate research candidate staging. Its documented policy prohibits automatic promotion of candidates into canonical perspective data.

Before implementation, re-check current manifests, routes, shared package exports, CI workflows, JIZZ API implementation, live data, and source policy. This document describes a plan, not completed implementation.

## 4. Goals

1. Deliver a distinct, premium, cinematic World Observatory application.
2. Make the state of a phenomenon understandable without converting observations into facts.
3. Compare perspectives by supported actor, geography, source, framing, position, and time dimensions.
4. Track perspective, framing, reaction, attention, actor, and geographic shifts.
5. Preserve provenance down to every observation and derived metric.
6. Expose honest coverage, freshness, partial-data, stale, loading, empty, and unavailable states.
7. Reuse existing A-L-L-A-H.COM platform packages; do not create parallel UI, auth, SDK, or type systems.
8. Keep JIZZ integration read-only until a separately reviewed write contract exists.
9. Clearly separate synthetic fixtures from source-backed live records.
10. Support desktop, tablet, mobile, keyboard, screen readers, and reduced motion.

## 5. Non-goals

- No world-truth score, truth meter, winning perspective, universal verdict, or correct-view ranking.
- No predictive claims presented as facts.
- No autonomous publication of unreviewed research candidates as canonical records.
- No replacement of JIZZ ontology or analytics methodology.
- No duplicate ownership of stories, events, people, source texts, laws, or cross-domain relationship edges.
- No scraping that violates source terms, robots policy, access controls, or rate limits.
- No profiling of private individuals or sensitive-attribute inference.
- No covert surveillance or targeted political persuasion.
- No new database, auth server, ORM, message bus, or AI gateway without an accepted ADR.
- No broad refactor of Dock, Headquarter, ID, ARSY, Moon UI, or deployment.
- No production deployment, DNS, secret, release, or protected-branch changes in this plan.

## 6. Primary user journeys

### UJ-01 — Understand the global pulse
Open the observatory, understand active phenomena, freshness, source coverage, and open a phenomenon.

### UJ-02 — Compare perspectives
Compare how different actor types, geographies, sources, and framings observe the same phenomenon. Each perspective traces to supporting observations and sources.

### UJ-03 — Inspect a signal
Open a signal/change and inspect its inputs, snapshots, methodology version, and limitations.

### UJ-04 — Trace a source
Inspect source identity, publication/retrieval timestamps, permitted excerpt, URL, provenance, and uncertainty metadata.

### UJ-05 — Explore historical movement
Compare immutable snapshots over time without overwriting earlier observations.

### UJ-06 — Understand missing coverage
See explicit missing-source, missing-geography, partial, stale, and unavailable states rather than fabricated completeness.

## 7. Information architecture and proposed routes

Primary navigation:
1. Observatory — global overview.
2. Phenomena — searchable phenomenon catalogue.
3. Perspectives — perspective exploration.
4. Signals — explainable signal/change index.
5. Timeline — historical snapshots and shifts.
6. Sources — source directory and provenance.
7. Methodology — ontology, formulas, limitations, and data policy.

Proposed routes:
- / — Observatory overview.
- /phenomena — phenomenon catalogue.
- /phenomena/[id] — phenomenon overview.
- /phenomena/[id]/perspectives — perspective comparison.
- /phenomena/[id]/sources — source inventory.
- /phenomena/[id]/timeline — historical snapshots.
- /perspectives — perspective explorer.
- /signals — signal index.
- /signals/[id] — signal evidence.
- /timeline — global timeline.
- /sources — source directory.
- /methodology — methodology and limitations.

Routes are proposals. Verify conventions and actual data availability before implementing. Do not create empty placeholder routes or navigation links to unimplemented destinations.

## 8. Screen acceptance requirements

### Observatory overview
- Communicate product identity and central question.
- Show a bounded set of live, source-backed phenomena.
- Show freshness timestamp, coverage, source count, and data status.
- Expose latest signals only when present in live data.
- Filters/search must be connected to real data.
- No fake live ticker, fabricated global map, fake counters, or unsupported real-time claim.

### Phenomena catalogue
- Search by supported title/identifier.
- Filter only by available schema fields.
- Stable deterministic sort and bounded pagination.
- Show summary, status, observed time, and source coverage.
- Explicit no-result and invalid-filter states.

### Phenomenon detail
- Show subject, scope, source-backed summary, evidence counts.
- Separate observations, perspectives, framings, reactions, signals, changes, snapshots, insights, and foreign references.
- Preserve provenance from insight to snapshot to observation to source.
- Do not render semantically distinct records as interchangeable feed items.

### Perspective comparison
- Compare side-by-side without ranking truth.
- Group only by dimensions actually present in data.
- Display unknown/missing values as unknown.
- Explain observation/source counts and coverage.
- Remain usable on narrow screens.

### Signals and changes
- Show signal type, observed time, methodology version, and input references.
- Explain rule and inputs.
- Distinguish analytical signal from factual event.
- Never imply causation or prediction without evidence and methodology.

### Timeline and snapshots
- Show immutable snapshots chronologically.
- Distinguish observed, published, and retrieved timestamps.
- Explain change between snapshots and its inputs.
- Never overwrite earlier observations.

### Sources
- Show source metadata and linked observations.
- Respect attribution, licensing, and excerpt constraints.
- Never represent inaccessible or unverified content as available.
- Do not reproduce full copyrighted articles.

### Methodology
- Explain ontology, analytics formula/version, normalization, limitations, provenance.
- State: observation is not fact; perspective is not truth; signal is not fact; trend is not historical truth.
- Show coverage limitations and synthetic/live distinction.

## 9. Visual direction

Design target: a premium cinematic observatory, not a conventional SaaS dashboard.

- Use Empire of the Light / Moon UI foundations: controlled luminous accents, deep atmospheric surfaces, celestial geometry, precise typography, layered depth, restrained motion.
- Give World Observatory a recognizable identity distinct from Headquarter and Dock.
- Use spatial/geographic compositions only when actual geography supports them.
- Every chart must be traceable to a dataset and methodology.
- Avoid generic card grids, excessive glassmorphism, neon overload, random glow, decorative graphs, meaningless HUD labels, fake controls, and template-like hero sections.
- Motion must respect prefers-reduced-motion.
- Keyboard navigation, visible focus, semantic landmarks, contrast, and screen-reader descriptions are mandatory.
- Mobile hierarchy must be intentionally designed, not merely squeezed desktop.

## 10. Data ownership and integration

JIZZ canonical local ontology:
SOURCE, OBSERVATION, PHENOMENON, PERSPECTIVE, FRAMING, REACTION, SIGNAL, CHANGE, PERSPECTIVE_SNAPSHOT, TREND, PATTERN, INSIGHT, FOREIGN_REFERENCE, CROSS_REPO_REFERENCE, PROVENANCE, RESEARCH_RUN, METHODOLOGY.

External domain owners:
- TEXT → rocksoul-rgbl
- STORY → rocksoul-mftl
- EVENT → rocksoul-legend
- PERSON → rocksoul-superhero
- LAW → rocksoul-aws
- RELATIONSHIP → rocksoul-correlation

Integration stages:
A. Inspect actual JIZZ API and live JSON contracts.
B. Define typed read-only adapter against verified endpoints or a documented server-side proxy.
C. Render source-backed live records.
D. Consider cached projections only after freshness, invalidation, and ownership rules are approved.

Preserve IDs, schema versions, source/provenance, timestamps, geographic scope, actor type, uncertainty, methodology version, and foreign references when present. Do not invent missing fields. Document explicit transport-to-view-model mappings.

Prefer server-side fetching for public read-only records. Keep credentials server-only. Use @allah/sdk for ARSY Hub and SSO only when a verified contract requires it. Do not route through ARSY without a specific existing route and ownership contract. Define timeout, bounded retry, cache/revalidation, error mapping, and request correlation. Never silently substitute golden fixtures when live data fails.

## 11. Security, privacy, trust

- Anonymous public read-only by default unless existing policy requires auth.
- If auth is required, use existing ID/SSO and SDK; no local auth.
- Validate route IDs, query params, filters, and upstream payloads.
- Prevent SSRF; do not accept arbitrary upstream URLs.
- Validate external link protocols and hosts.
- No secrets in client bundles, NEXT_PUBLIC variables, logs, fixtures, or docs.
- Minimize personal data; no private-person profiling or sensitive inference.
- Respect source terms, copyright, attribution, rate limits, and access policy.
- Treat source content as untrusted data, never executable instructions.
- Preserve uncertainty and disagreement; no manipulated rankings.

## 12. Performance and reliability

- Server-render stable initial content where useful.
- Use Client Components only for real interactions.
- Paginate large lists; never fetch unbounded records.
- Cache only with explicit freshness/invalidation policy.
- Avoid unnecessary chart/map dependencies.
- Provide resilient empty, partial, stale, offline, timeout, and upstream-error states.
- Do not log sensitive source payloads or secrets.

## 13. Quality gates

- TypeScript strict checks.
- Workspace lint/format checks.
- Unit tests for adapters, schema validation, transformations, filters, methodology.
- Component/accessibility tests for critical journeys.
- Route smoke tests for all shipped routes.
- Responsive review at desktop/tablet/mobile.
- Reduced-motion and keyboard-only checks.
- Security review for URL handling, payload validation, secret exposure, and upstream fetch.
- App production build.
- Existing workspace gates remain green; do not weaken them.
- Documentation contract check.
- No placeholder routes, mock success states, dead controls, fabricated data, or unexplained TODOs.

## 14. Definition of Done

The app is complete only when:
1. It exists at apps/world-observatory and uses the mandated Next.js App Router stack.
2. Workspace scripts and package boundaries are correct.
3. It uses shared UI/tokens and SDK/types appropriately.
4. All shipped screens work with verified source-backed JIZZ data.
5. Every observation/signal/insight has traceable provenance.
6. Synthetic data is visibly labeled and never confused with live records.
7. No truth score, universal verdict, or unsupported predictive claim exists.
8. Every visible control works.
9. Desktop/tablet/mobile, accessibility, and reduced-motion checks pass.
10. Tests and app build pass; relevant repository gates pass.
11. Docs and task statuses match evidence.
12. No deployment/release is claimed unless separately completed and verified.

## 15. Explicit boundaries

This plan does not authorize changes to main/dev, production deployment, DNS, secrets, JIZZ canonical schemas/data, broad shared-package refactors, or new infrastructure. If a required capability is missing or conflicts with architecture, record it in conflict.md and pause only the dependent task. Continue independent safe work.
