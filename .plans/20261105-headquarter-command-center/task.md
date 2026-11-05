# Headquarter execution task index
Small dependency-ordered tasks for local coding agents. Update report.md with evidence.

## Phase 00 — source and contract reconciliation (P0)
- [ ] HQ-0001 Read root/app agent, autonomous, docs, quality, design, architecture and decision contracts.
- [ ] HQ-0002 Capture branch, dirty state, latest commit, package manager and runtime versions.
- [ ] HQ-0003 Inventory every app route, page, client/server boundary and utility route.
- [ ] HQ-0004 Inventory SDK calls; map method, request/response type and ARSY endpoint.
- [ ] HQ-0005 Verify consumed ARSY schemas, auth hooks, tenant filters and audit behavior.
- [ ] HQ-0006 Inventory tests and route/contract/authorization/interaction coverage gaps.
- [ ] HQ-0007 Compare HQ_NAV, shell, Overview cards and route tree; record drift.
- [ ] HQ-0008 Trace Agent Studio stream lifecycle, abort/cancel semantics, SSE events and errors.
- [ ] HQ-0009 Trace pairing/revocation and mission submit/cancel; verify tenant isolation.
- [ ] HQ-0010 Map overlap with GATE, DOCK, COCKPIT, ID, ARSY, Sentinel, Qorpus and domain apps.
- [ ] HQ-0011 Record evidence; no runtime edits in this phase.

## Phase 01 — navigation and shell (P0)
- [ ] HQ-0101 Define typed nav metadata and primary-vs-utility categories.
- [ ] HQ-0102 Derive shell rail and Overview index from HQ_NAV.
- [ ] HQ-0103 Remove duplicate arrays only after parity tests exist.
- [ ] HQ-0104 Support nested active routes and utility pages.
- [ ] HQ-0105 Add registry-to-route existence test.
- [ ] HQ-0106 Standardize route header/context using shared UI blocks.
- [ ] HQ-0107 Verify keyboard, focus, responsive rail and reduced motion.
- [ ] HQ-0108 Update README inventory from verified routes.

## Phase 02 — executive Overview (P0)
- [ ] HQ-0201 Define executive questions and map fields to existing APIs.
- [ ] HQ-0202 Identify source-backed decision, priority, exception, delivery and recent-decision signals.
- [ ] HQ-0203 Mark missing sources unavailable; record gaps instead of mocking.
- [ ] HQ-0204 Build strategic header with tenant, period and last refresh.
- [ ] HQ-0205 Build decision queue from verified records or truthful empty state.
- [ ] HQ-0206 Build priority horizon from existing project/milestone contracts.
- [ ] HQ-0207 Build exceptions with source, time, freshness, severity and detail.
- [ ] HQ-0208 Build execution pulse from persisted task/mission transitions.
- [ ] HQ-0209 Build curated ecosystem map with verified state only.
- [ ] HQ-0210 Add refresh, stale, partial, offline and authorization states.
- [ ] HQ-0211 Add data-state, tenant and navigation tests.
- [ ] HQ-0212 Verify spatial composition, not generic card grid.

## Phase 03 — projects and portfolio (P0/P1)
- [ ] HQ-0301 Audit /projects, SDK, backend source, Odoo/Turso references.
- [ ] HQ-0302 Determine canonical project/task source; resolve competing storage claims.
- [ ] HQ-0303 Document contracts and tenant permissions.
- [ ] HQ-0304 Verify pagination, filters, sorting and stable IDs.
- [ ] HQ-0305 Verify create/update/status/assignment and server validation.
- [ ] HQ-0306 Build project overview with source-backed milestones/blockers.
- [ ] HQ-0307 Add task views only where contracts support them.
- [ ] HQ-0308 Show dependencies without duplicating project source.
- [ ] HQ-0309 Add workflow and tenant-isolation tests.
- [ ] HQ-0310 Document Odoo/Turso boundaries; remove misleading copy.

## Phase 04 — agent/device/mission governance (P0)
- [ ] HQ-0401 Audit RemoteAgentControlPanel and device SDK contracts.
- [ ] HQ-0402 Verify pairing expiry, one-time display, redaction and revocation.
- [ ] HQ-0403 Verify personal/org tenant isolation and roles.
- [ ] HQ-0404 Verify mission scope, target, mode and policy validation.
- [ ] HQ-0405 Treat cancellation as request until server confirmation.
- [ ] HQ-0406 Bound event history; handle duplicates/order/reconnect.
- [ ] HQ-0407 Ensure no workspace paths/local file content are exposed.
- [ ] HQ-0408 Test pending/running/cancel-requested/completed/failed/offline.
- [ ] HQ-0409 Show result, safe change summary and validation evidence.
- [ ] HQ-0410 Add auditable confirmation for privileged/destructive actions.

## Phase 05 — AI Gateway and Swarm (P1)
- [ ] HQ-0501 Audit routes, SDK methods, provider catalog and server policy.
- [ ] HQ-0502 Separate catalog presence from configured/healthy state.
- [ ] HQ-0503 Verify model IDs, routing/fallback policy and secret isolation.
- [ ] HQ-0504 Verify usage/cost source, period, currency and freshness.
- [ ] HQ-0505 Audit swarm lifecycle, SSE, roles, tools, cancellation and persistence.
- [ ] HQ-0506 Present concise rationale/actions/evidence; never hidden chain-of-thought.
- [ ] HQ-0507 Add human review only where API supports it.
- [ ] HQ-0508 Add contract and failure-state tests.

## Phase 06 — tools and knowledge (P1)
- [ ] HQ-0601 Audit registry ownership, schema, permissions and invocation.
- [ ] HQ-0602 Distinguish discovery from execution authorization.
- [ ] HQ-0603 Verify Qorpus citations, source identity, freshness and tenant visibility.
- [ ] HQ-0604 Add provenance/evidence detail.
- [ ] HQ-0605 Add empty/stale/partial/forbidden states.
- [ ] HQ-0606 Add registry and knowledge contract tests.

## Phase 07 — decisions and audit (P1)
- [ ] HQ-0701 Search ARSY for decision/approval/audit APIs and schema.
- [ ] HQ-0702 Map append-only audit and explicit admin constraints (D-014).
- [ ] HQ-0703 If missing, propose backend contract and ADR before implementation.
- [ ] HQ-0704 Define lifecycle: draft, submitted, needs-evidence, approved, rejected, deferred, superseded, executed, evaluated.
- [ ] HQ-0705 Define provenance, uncertainty, impact, alternatives, owner and reason.
- [ ] HQ-0706 Define immutable event history and tenant-scoped policy.
- [ ] HQ-0707 Implement decision UI only after API and permission tests.
- [ ] HQ-0708 Link decisions to projects/missions and evaluate outcomes.

## Phase 08 — NEXUS design/accessibility/performance (P0)
- [ ] HQ-0801 Audit routes against NEXUS DNA and UI blueprint.
- [ ] HQ-0802 Reuse shared blocks; prove missing variants before package changes.
- [ ] HQ-0803 Replace generic grids with purposeful spatial composition.
- [ ] HQ-0804 Define executive, governance and evidence density tiers.
- [ ] HQ-0805 Audit contrast, semantics, focus and keyboard paths.
- [ ] HQ-0806 Verify desktop/tablet/mobile and no overflow.
- [ ] HQ-0807 Verify reduced motion and low-power behavior.
- [ ] HQ-0808 Run contrast/visual checks and capture evidence.

## Phase 09 — integration/security/release (P0)
- [ ] HQ-0901 Add auth/session/tenant/navigation smoke tests.
- [ ] HQ-0902 Add server authorization and cross-tenant denial tests.
- [ ] HQ-0903 Add redaction tests for tokens, keys, prompts and personal data.
- [ ] HQ-0904 Ensure mock/demo values cannot leak into production.
- [ ] HQ-0905 Verify every control has a working action and confirmed feedback.
- [ ] HQ-0906 Run focused tests and Headquarter typecheck.
- [ ] HQ-0907 Run pnpm headquarter:build.
- [ ] HQ-0908 Run docs:check, lint:arch, lint, typecheck, ui:test, ui:contrast.
- [ ] HQ-0909 Run pre-push checks; document environment blockers.
- [ ] HQ-0910 Update README, blueprint status, changelog, backlog and report.
- [ ] HQ-0911 Commit verified slices to existing dev.
- [ ] HQ-0912 Verify pushed commit and remote dev head.

## Acceptance
No dead/duplicate navigation; Overview only shows source-backed values; primary workflows have full states; tenant authorization tested server-side; no overlap with COCKPIT/ID/ARSY/Qorpus; NEXUS accessible/responsive; quality gates pass or blockers are evidenced.
