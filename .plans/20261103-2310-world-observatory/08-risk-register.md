---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-RISK"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Risk Register

## 8.1 High-Level Risk Summary

| Risk ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---------|------|------------|--------|------------|-------|--------|
| **R-001** | JIZZ API unavailable or inaccessible | Medium | High | Implement mock fixtures, graceful degradation, clear error states; Phase 1 starts with mock data | frontend/lead | Active |
| **R-002** | API schema changes between versions | Medium | Medium | Runtime validation with Zod/yup or custom validators, explicit schema versions, version tolerance in view model | frontend | Active |
| **R-003** | Lint violations (UI purity) | Low | Medium | Pre-commit hook, CI gate, code review enforcement, regular lint runs during development | lead | Active |
| **R-004** | TypeScript errors | Medium | Medium | Strict mode incremental adoption, type reviews, incremental `typecheck` fixes, type reviews | frontend | Active |
| **R-005** | Dependency version breaking | Low | Medium | Version pinning with semver ranges, monitor package changelogs, automated compatibility checks | lead | Active |
| **R-006** | Deprecation of Next.js 16 / React 19 | Low | Low | Track official release notes, subscribe to maintainability alerts, plan migration path if needed | lead | Active |
| **R-007** | Accessibility gaps | Medium | Medium | Early axe-core audit, component library compliance (Moon UI), keyboard navigation, reduced-motion support, color contrast checks | frontend | Active |
| **R-008** | Responsive design issues | Medium | Medium | Mobile-first Tailwind v4 design, test at 320px/768px/1440px+, real device testing if possible | frontend | Active |
| **R-009** | SSRF vulnerabilities | Low | High | URL protocol validation (http/https only), host whitelisting, no arbitrary URL overrides from request params, link validation in UI, never log raw source payloads with URLs | lead | Active |
| **R-009** | Secrets in client bundles | Low | High | No `NEXT_PUBLIC` variables with secrets, all credentials server-only, `.env.local` only, import sanity checks | lead | Active |
| **R-009** | Source content as untrusted data | Medium | Medium | Runtime validation of all upstream payloads, never execute source content, preserve uncertainty, encode output, XSS prevention | frontend | Active |
| **R-010** | Performance below targets | Low | Medium | Lighthouse audits, optimize images, code splitting, dynamic imports, efficient data fetching, pagination for lists | frontend | Active |
| **R-011** | Cross-browser inconsistencies | Low | Medium | Test on Chrome, Firefox, Safari, Edge, capture inconsistencies, polyfills if needed, standard CSS/JS patterns | frontend | Active |
| **R-012** | Documentation contract violations | Medium | Medium | Early `docs:check` runs in CI, fix violations before commit, maintain frontmatter, check relative links, antislop compliance | lead | Active |
| **R-013** | Dependency conflicts in monorepo | Low | Medium | `pnpm` workspaces, lockfile precision, avoid root-level installs, consistent package versions across apps | lead | Active |
| **R-014** | Scope creep / feature creep | Medium | High | Explicit out-of-scope definitions in spec, roadmap gatekeeping, change control board, AC-001 through AC-050 as gate criteria | product-architecture | Active |
| **R-015** | Team onboarding gaps | Low | Medium | Onboarding documentation, `pnpm jizz:dev` runs for new members, quality gate pass requirements, buddy system for first week | lead | Active |

---

## 8.2 Risk Matrix

| Likelihood ↓ / Impact → | **Low** | **Medium** | **High** |
|--------------------------|---------|------------|----------|
| **High** | R-007, R-011 | R-001, R-009 (SSRF), R-014 | R-001 (if API completely down) |
| **Medium** | R-002, R-006, R-012, R-014 | R-001, R-008, R-009 (secrets), R-015 | — |
| **Low** | R-003, R-005, R-013 | R-005 (version bump), R-014 (scope) | — |

---

## 8.3 Risk Mitigation Details

### R-001: JIZJ API Unavailable

**Likelihood:** Medium  
**Impact:** High — App cannot display any data without API

**Mitigation Strategy:**
- **Phase 1 (Foundation):** Implement mock fixtures with realistic observation/perspective data shapes
- **Graceful Degradation:** Error boundaries show meaningful messages when API fails
- **Circuit Breaker:** After N consecutive failures, show cached/stale data with timestamp
- **Fallback States:** Empty/partial/unavailable states already built into component architecture
- **Testing:** Simulate API unavailable in development, verify UI handles gracefully

**Evidence/Traceability:**
- Related to AC-005 (loading/error/not-found states)
- Related to AC-023 (Phase 3 features depend on API)
- Related to Phase 1 Exit Criteria

### R-002: API Schema Changes

**Likelihood:** Medium  
**Impact:** Medium — Components break if data shape changes

**Mitigation Strategy:**
- **Runtime Validation:** Validate all upstream payloads against JSON Schema or TypeScript types before use
- **Explicit Schema Versions:** Track API schema version, add to view model metadata
- **Type Adaptations:** Components accept partial/optional fields, gracefully handle missing data
- **Version Tolerance:** View model maps API fields to internal model with defaults for missing
- **Change Detection:** Lint rule or CI step to detect schema drift between spec and implementation

**Evidence/Traceability:**
- Related to AC-020 (API client operational)
- Related to AC-024 (Typecheck still passes)
- Related to Phase 2 Exit Criteria

### R-003: Lint Violations (UI Purity)

**Likelihood:** Low  
**Impact:** Medium — Failed quality gate, blocks CI/CD

**Mitigation Strategy:**
- **Pre-Commit Hook:** `husky` or equivalent runs `pnpm lint:arch` before commit
- **CI Gate:** `pnpm lint:arch` must pass for PR merge
- **Code Review:** Reviewers check for raw `<button>` or `<input>` additions
- **Education:** Team familiar with `@moonwitness/ui` import pattern, forbidden elements list
- **Automated Detection:** `grep '<button ' apps/jizz/src/**/*.tsx` in CI, fail on matches (excluding comments/`//`)

**Evidence/Traceability:**
- Related to AC-008 (no raw HTML controls, ongoing)
- Related to AC-019 (full quality gates pass)
- Related to Phase 4 Exit Criteria (T-4001–T-4006)

### R-004: TypeScript Errors

**Likelihood:** Medium  
**Impact:** Medium — Failed `pnpm typecheck`, blocks CI/CD

**Mitigation Strategy:**
- **Incremental Adoption:** Fix errors file-by-file, avoid suppressing with `// @ts-ignore`
- **`@ts-nocheck` only on large legacy files, not new code**
- **Type Reviews:** Pull request requires typecheck pass
- **Type-First Development:** Write TypeScript interfaces before implementation
- **Baseline Tracking:** Capture current error count, track reductions over time

**Evidence/Traceability:**
- Related to AC-003 (typecheck passes)
- Related to AC-011 (Phase 2 typecheck passes)
- Related to Phase 2 Exit Criteria

### R-005: Dependency Version Breaking

**Likelihood:** Low  
**Impact:** Medium — Build breaks, compatibility issues

**Mitigation Strategy:**
- **Version Pinning:** Use exact versions or `^`/`~` semver ranges in `package.json`
- **Lockfile Precision:** `pnpm` lockfile ensures reproducible installs
- **Compatibility Checks:** `pnpm audit`, regular dependency update reviews
- **Workspace Consistency:** All apps use same package versions where shared
- **Update Monitoring:** Subscribe to package maintainers' release notes, CI fails on known vulnerabilities

**Evidence/Traceability:**
- Related to AC-011 (typecheck passes after deps)
- Related to AC-019 (full quality gates pass)
- Related to Phase 4 Exit Criteria (T-4001–T-4006)

### R-006: Deprecation of Next.js 16 / React 19

**Likelihood:** Low  
**Impact:** Low — Long-term maintenance, migration planning

**Mitigation Strategy:**
- **Official Monitoring:** Track Next.js and React release notes, blog posts
- **Compatibility Matrix:** Maintain table of tested versions, known issues
- **Migration Path:** Plan Next.js 17+ / React 20+ migration when ecosystem stabilizes
- **Long-Term Support:** Ensure current versions remain supported until migration ready
- **Roadmap Inclusion:** Migration task in future roadmap phases

**Evidence/Traceability:**
- Related to AC-027 (performance + accessibility within bounds, long-term)
- Related to roadmap Phase 5+ considerations
- Related to product strategy horizon

### R-007: Accessibility Gaps

**Likelihood:** Medium  
**Impact:** Medium — Failed WCAG AA audit, exclusion of users

**Mitigation Strategy:**
- **Early Audit:** Run axe-core in development, fix violations before they compound
- **Component Library:** Reuse `@moonwitness/ui` which has accessibility built-in
- **Keyboard Navigation:** Tab-through all functionality, logical focus order
- **Color Contrast:** Minimum 4.5:1 ratio, verify with DevTools Color Contrast Analyzer
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables nonessential transitions
- **Screen Reader:** Semantic HTML, aria-labels where meaningful
- **Color Not Sole Encoding:** Supplementary indicators (text, icons) alongside color

**Evidence/Traceability:**
- Related to AC-010 (accessibility baseline)
- Related to AC-027 (accessibility within bounds)
- Related to AC-032 (accessibility audit passed)
- Related to Phase 4 Exit Criteria (T-4002)

### R-008: Responsive Design Issues

**Likelihood:** Medium  
**Impact:** Medium — Poor UX on mobile/tablet, decreased usability

**Mitigation Strategy:**
- **Mobile-First:** Tailwind v4 mobile-first breakpoints by design
- **Test at Breakpoints:** 320px (phone), 768px (tablet), 1440px+ (desktop)
- **Real Device Testing:** If possible, test on actual iOS/Android devices
- **Touch Targets:** Minimum 48px × 48px for tap targets
- **No Horizontal Overflow:** Ensure content flows vertically on narrow screens
- **Media Queries:** Only for exceptional cases, not primary responsive strategy

**Evidence/Traceability:**
- Related to AC-014 (responsive layout)
- Related to AC-033 (responsive QA complete)
- Related to Phase 4 Exit Criteria (T-4003)

### R-009: SSRF Vulnerabilities

**Likelihood:** Low  
**Impact:** High — Security risk, potential data exfiltration

**Mitigation Strategy:**
- **URL Protocol Whitelist:** Only allow `http:` and `https:` protocols
- **Host Validation:** Validate all external URLs against approved patterns
- **No Arbitrary Overrides:** Request parameters cannot modify base API URL
- **Link Validation:** All displayed links validated before rendering in UI
- **Console Logging:** Never log raw source payloads containing URLs
- **Input Sanitization:** Runtime validate all upstream data before any use

**Evidence/Traceability:**
- Related to AC-034 (security review complete)
- Related to AC-018 (no raw HTML controls, includes URL validation)
- Related to AC-039 (cross-browser security no critical issues)
- Related to NFR-009 (SSRF prevention in requirements)
- Related to T-4004 (security review task)

### R-009: Secrets in Client Bundles

**Likelihood:** Low  
**Impact:** High — Credential exposure, potential compromise

**Mitigation Strategy:**
- **No `NEXT_PUBLIC`:** Never prefix secrets with `NEXT_PUBLIC`
- **Server-Only:** All credentials loaded from `.env.local` (Node-only)
- **Import Sanity:** `import` from server-only modules fails in browser (enforced by Next.js)
- **Credential Rotation:** Regular rotation policy for any stored credentials
- **Audit:** Regular code review checks for secret exposure patterns

**Evidence/Traceability:**
- Related to AC-034 (security review complete)
- Related to AC-039 (cross-browser security no critical issues)
- Related to AC-019 (full quality gates include security considerations)
- Related to T-4004 (security review task)

### R-010: Performance Below Targets

**Likelihood:** Low  
**Impact:** Medium — Poor UX, high bounce rate

**Mitigation Strategy:**
- **Lighthouse Audits:** FCP < 2s, TTI < 5s targets
- **Image Optimization:** Next.js `next/image`, compressed formats, appropriate sizes
- **Code Splitting:** Dynamic imports for heavy components/Page Routes
- **Data Fetching:** Server Components for initial render, minimize Client Component hydration
- **Pagination:** Never fetch unbounded lists, paginate with client-controlled page/limit
- **Caching:** Explicit freshness/invalidation policy, avoid redundant fetches

**Evidence/Traceability:**
- Related to AC-027 (performance within bounds)
- Related to AC-031 (performance audit passed)
- Related to AC-038 (performance optimizations)
- Related to T-4001 (performance audit task)

### R-011: Cross-Browser Inconsistencies

**Likelihood:** Low  
**Impact:** Medium — Inconsistent UX across browsers

**Mitigation Strategy:**
- **Standard CSS/JS:** Use patterns with broad browser support, avoid browser-specific hacks
- **Test on Chrome, Firefox, Safari, Edge:** Core browsers
- **Polyfills:** If needed for specific features, minimal and well-documented
- **Feature Queries:** `@supports` for CSS feature detection, not browser detection
- **Fallbacks:** Graceful degradation if specific feature unavailable in browser

**Evidence/Traceability:**
- Related to AC-035 (cross-browser testing complete)
- Related to AC-039 (cross-browser compatibility, no critical issues)
- Related to Phase 4 Exit Criteria (T-4005)

### R-012: Documentation Contract Violations

**Likelihood:** Medium  
**Impact:** Medium — Failed `pnpm docs:check`, blocks CI/CD, score < 95/100

**Mitigation Strategy:**
- **Early Runs:** Run `docs:check` during development, not just before commit
- **Frontmatter Standards:** All required docs have proper YAML frontmatter (id, version, owner, status, last_verified)
- **Relative Links:** Verify all links resolve, no broken links
- **Antislop Patterns:** Check for `lorem ipsum`, `TODO: write description`, `placeholder for future`, `[insert ... here]`
- **Documentation Reviews:** PR requires docs review, not just code review

**Evidence/Traceability:**
- Related to AC-004 (docs check ≥ 95/100)
- Related to AC-019 (full quality gates pass)
- Related to AC-026 (docs contract in Phase 3)
- Related to T-1011 (plan artifacts created), T-5003 (release checklist)

### R-013: Dependency Conflicts in Monorepo

**Likelihood:** Low  
**Impact:** Medium — Inconsistent package versions, build breaks

**Mitigation Strategy:**
- **`pnpm` Workspaces:** Use `pnpm` workspaces for monorepo management
- **Lockfile Precision:** `pnpm-lock.yaml` ensures exact versions
- **Avoid Root Installs:** Don't `pnpm add -D` at root unless necessary
- **Consistent Versions:** Shared packages (`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`) same version across apps
- **Regular Audits:** `pnpm audit` for known vulnerabilities, `pnpm ls` for version consistency

**Evidence/Traceability:**
- Related to AC-019 (full quality gates pass)
- Related to AC-011 (typecheck passes with deps)
- Related to Phase 4 Exit Criteria (T-4001–T-4006 includes dependency checks)

### R-014: Scope Creep / Feature Creep

**Likelihood:** Medium  
**Impact:** High — Project expands beyond bounds, delays, diluted focus

**Mitigation Strategy:**
- **Explicit Out-of-Scope:** Document what current phase explicitly does NOT include (Section 2.4 in requirements)
- **Roadmap Gatekeeping:** New features must be prioritized against existing roadmap, not added ad-hoc
- **Change Control Board:** Architecture + lead approval for scope changes
- **Phase Gates:** Each phase has exit criteria; new features go into next phase
- **Stakeholder Alignment:** Product lead + engineering lead agree on priorities before scope changes

**Evidence/Traceability:**
- Related to AC-043 (release checklist 100% includes scope verification)
- Related to AC-045 (no critical post-release issues, scope verification)
- Related to Phase 5 Exit Criteria

### R-015: Team Onboarding Gaps

**Likelihood:** Low  
**Impact:** Medium — New members slow to contribute, knowledge silos

**Mitigation Strategy:**
- **Onboarding Documentation:** `pnpm jizz:dev` runs, quality gates pass, key files documented
- **First-Week Tasks:** T-1001–T-1011 type tasks for new members
- **Buddy System:** Pair new member with experienced team member for first week
- **Quality Gate Pass:** New member must pass `pnpm jizz:dev`, lint, typecheck, docs check
- **Knowledge Sharing:** Regular syncs, recorded walkthroughs of key files

**Evidence/Traceability:**
- Related to AC-049 (team onboarding complete)
- Related to roadmap T-5003 (post-launch activities)
- Related to Phase 5 Exit Criteria

---

## 8.4 Risk Acceptance Table

| Risk ID | Acceptance Criteria | Accepted By | Date Accepted |
|---------|-------------------|-------------|---------------|
| **All listed risks** | Mitigation strategies documented and resource-appropriate | product-architecture + lead | 2026-11-04 |
| **Residual risks** | Accepted with documented contingency | lead | 2026-11-04 |

---

## 8.5 Monitoring & Review

| Activity | Frequency | Owner | Triggers |
|----------|-----------|---------|----------|
| **Risk Review** | Every phase transition + monthly | lead | New risks identified, mitigation effectiveness |
| **New Risk Log** | Continuous (as issues arise) | lead + team | Issue reported, triaged |
| **Mitigation Status Update** | Every phase | lead | Mitigation implemented or needs adjustment |
| **Risk Register Update** | Every phase + monthly | lead | New info, status changes, closure |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [03-requirements.md](03-requirements.md)
- [04-current-state.md](04-current-state.md)
- [05-target-architecture.md](05-target-architecture.md)
- [06-implementation-roadmap.md](06-implementation-roadmap.md)
- [07-acceptance-criteria.md](07-acceptance-criteria.md)