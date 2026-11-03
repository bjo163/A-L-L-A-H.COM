---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-ROADMAP"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Implementation Roadmap

## 6.1 Phased Implementation Plan

### 6.1.1 Phase 1: Foundation (Current Sprint)

| Task ID | Task | Description | Owner | Dependencies | Effort | Exit Criteria |
|---------|------|-------------|-------|--------------|--------|---------------|
| **T-1001** | Initialize repository structure | Create `apps/jizz/` directory, `package.json`, config files | frontend | None | 1 day | Directory exists, `pnpm install` succeeds |
| **T-1002** | Configure Next.js 16 App Router | `next.config.ts`, `tsconfig.json`, `next-env.d.ts` | frontend | T-1001 | 0.5 day | Next dev server starts on port 3004 |
| **T-1003** | Set up Tailwind CSS v4 | `globals.css`, `components.json`, base configuration | frontend | T-1001 | 0.5 day | Tailwind utilities apply, dark mode works |
| **T-1004** | Create root layout | `layout.tsx` with `JizzNavbar`, semantic landmarks | frontend | T-1002, T-1003 | 1 day | Layout renders, navbar shows ecosystem links |
| **T-1005** | Create home page | `page.tsx` with hero section, observations, perspectives | frontend | T-1004 | 2 days | Home renders without errors, core question visible |
| **T-1006** | Create boundary files | `loading.tsx`, `error.tsx`, `not-found.tsx` | frontend | T-1004 | 1 day | All three boundary components render correctly |
| **T-1007** | Configure package scripts | Add `jizz:dev`, `jizz:build` to root `package.json` | lead | None | 0.5 day | `pnpm jizz:dev` and `pnpm jizz:build` work |
| **T-1008** | Create README.md | App documentation with commands and guidance | frontend | None | 0.5 day | README exists, frontmatter valid |
| **T-1009** | Create AGENTS.md | Agent guidance following repo conventions | frontend | None | 0.5 day | AGENTS.md exists, frontmatter valid |
| **T-1010** | Run quality gates | `pnpm lint:arch`, verify no violations | lead | T-1001–T-1009 | 0.5 day | `pnpm lint:arch` passes 100% |
| **T-1011** | Create plan artifacts | `spec.md`, `task.md`, `design.md`, `rules.md`, `decision.md` | lead | None | 1 day | All plan artifacts exist in `.plans/` |

**Phase 1 Milestone:** All T-1001–T-1011 complete, `pnpm lint:arch` passes

### 6.1.2 Phase 2: Core Features

| Task ID | Task | Description | Owner | Dependencies | Effort | Exit Criteria |
|---------|------|-------------|-------|--------------|--------|---------------|
| **T-2001** | Implement JIZZ API client | `src/lib/api.ts` with Phenomena, Perspectives, Signals methods | frontend | Phase 1, API contract | 3 days | API client renders data without errors |
| **T-2002** | Implement Observations component | Observation card grid with source attribution | frontend | Phase 1, T-2001 | 2 days | Observations render with attribution |
| **T-2003** | Implement Perspectives component | Perspective list by actor with framing badges | frontend | Phase 1, T-2001 | 2 days | Perspectives render with actor/framing |
| **T-2004** | Implement Responsive Layout | Grid adapts mobile/tablet/desktop | frontend | Phase 1, T-2001–T-2003 | 1 day | Layout functions at 320px–1920px+ |
| **T-2005** | Add Loading State | `loading.tsx` overlay with spinner + text | frontend | Phase 1 | 0.5 day | Loading state visible during fetch |
| **T-2006** | Add Error State | `error.tsx` with message + retry button | frontend | Phase 1 | 0.5 day | Error state renders on failure |
| **T-2007** | Add Not-Found State | `not-found.tsx` with home link | frontend | Phase 1 | 0.5 day | Not-found renders on invalid route |
| **T-2008** | TypeScript type definitions | Type exports, interface adaptations | frontend | Phase 1 | 1 day | No TypeScript errors in component files |
| **T-2009** | Run full quality gates | `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check` | lead | T-1001–T-2008 | 0.5 day | All gates pass or known issues documented |

**Phase 2 Milestone:** All T-2001–T-2009 complete, typecheck passes, lint passes

### 6.1.3 Phase 3: Feature Integration

| Task ID | Task | Description | Owner | Dependencies | Effort | Exit Criteria |
|---------|------|-------------|-------|--------------|--------|---------------|
| **T-3001** | Implement Phenomena Catalog | Searchable/filterable list with counts and status | frontend | Phase 2, JIZZ API | 3 days | Catalog renders, filters work |
| **T-3002** | Implement Phenomenon Detail Page | Comprehensive detail with overview, signals, perspectives, sources | frontend | Phase 2, T-3001, JIZZ API | 4 days | Detail page renders, all sections present |
| **T-3003** | Implement Perspective Comparison | Side-by-side actor framing comparison UI | frontend | Phase 2, T-2003, JIZZ API | 3 days | Comparison renders, actors visible |
| **T-3004** | Implement Signal Index | Meaningful changes index with methodology | frontend | Phase 2, T-2001, JIZZ API | 3 days | Signals render with methodology |
| **T-3005** | Implement Sources Directory | Complete provenance chain for each observation | frontend | Phase 2, JIZZ API | 3 days | Sources render with URLs/identities |
| **T-3006** | Add Temporal Tracking | Timeline visualization of perspective evolution | frontend | Phase 2, API data | 3 days | Timeline renders, navigation works |
| **T-3006** | Add Methodology Documentation | Ontology, formulas, uncertainty presentation | frontend | Phase 2, API data | 2 days | Methodology renders, clear |

**Phase 3 Milestone:** All T-3001–T-3006 complete, features operational

### 6.1.4 Phase 4: Hardening

| Task ID | Task | Description | Owner | Dependencies | Effort | Exit Criteria |
|---------|------|-------------|-------|--------------|--------|---------------|
| **T-4001** | Performance Audit | Lighthouse audit: FCP < 2s, TTI < 5s | frontend | Phase 3 | 2 days | FCP < 2s, TTI < 5s on broadband |
| **T-4002** | Accessibility Audit | axe-core WCAG AA compliance check | frontend | Phase 3 | 2 days | AA compliance or documented gaps |
| **T-4003** | Responsive QA | Test at 320px, 768px, 1440px+; mobile devices | frontend | Phase 3 | 2 days | Layout works at all breakpoints |
| **T-4004** | Security Review | SSRF validation, secrets check, input sanitization | lead | Phase 3 | 2 days | No critical security findings |
| **T-4005** | Cross-Browser Testing | Chrome, Firefox, Safari, Edge | frontend | Phase 3 | 1 day | No critical browser inconsistencies |
| **T-4006** | Final Quality Gates | `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch` | lead | T-1001–T-4005 | 0.5 day | All gates pass or documented |

**Phase 4 Milestone:** All T-4001–T-4006 complete, hardening complete

### 6.1.5 Phase 5: Release Preparation

| Task ID | Task | Description | Owner | Dependencies | Effort | Exit Criteria |
|---------|------|-------------|-------|--------------|--------|---------------|
| **T-5001** | Production Build | `pnpm jizz:build` creates `.next/` directory | frontend | Phase 4 | 1 day | Build succeeds, `.next/` exists |
| **T-5002** | Staging Deployment | Deploy to staging environment, verify | lead | T-4006, ops | 1 day | Staging serves correctly on port |
| **T-5003** | Release Checklist | Verify all criteria from roadmap | lead | T-4006 | 0.5 day | Checklist 100% complete |
| **T-5003** | Deployment Approval | Separate approval for DNS/secrets/production | lead | T-5002, stakeholder | Varies | Approval granted or denied |
| **T-5003** | Post-Release Monitoring | Observe for 48h, log any issues | lead | T-5002 | 2 days | No critical issues in monitoring |

**Phase 5 Milestone:** Deployment approval or documented blockers

### 6.1.6 Parallel Workstreams

| Workstream | Tasks | Can Run Parallel With | Reason |
|------------|-------|----------------------|--------|
| **UI Components** | T-1001–T-2003 | API integration | Components don't depend on API data |
| **Documentation** | T-1008, T-1009, T-2008–T-2009 | Code development | Docs can be written from spec |
| **TypeScript Types** | T-2001–T-2003, T-2008 | Feature development | Types defined from API contracts |
| **Quality Gates** | T-1011, T-2009, T-4005 | Feature development | Gates run on stable builds |
| **Design Review** | T-1003–T-1005, T-2001–T-2003 | Any | Design review before code freeze |

### 6.1.7 Milestone Summary

| Milestone | Criteria | Status |
|-----------|----------|--------|
| **M-01** | Foundation complete | ✅ In progress (T-1001–T-1011) |
| **M-02** | Core features operational | Pending (T-2001–T-2009) |
| **M-03** | Feature integration complete | Pending (T-3001–T-3006) |
| **M-04** | Hardening complete | Pending (T-4001–T-4006) |
| **M-04** | Release ready | Pending (T-5001–T-5003) |

### 6.1.8 Dependency Chain

```
T-1001 → T-1002 → T-1003 → T-1004 → T-1005 → T-1005
  │           │           │           │           │
  └─ T-1005 ──┘           │           │           │
                          │           │           │
                          └─ T-1006 ──┘           │
                                                │
                                                └─ T-1007–T-1011
                                                  (quality gates, docs)

Phase 1 → Phase 2 (T-2001–T-2009) → Phase 3 (T-3001–T-3006) → Phase 4 (T-4001–T-4006) → Phase 5 (T-5001–T-5003)
```

### 6.1.9 Risk Mitigation per Task

| Task | Risk | Mitigation |
|------|------|------------|
| **T-2001** | JIZZ API unavailable | Implement mock fixtures, graceful degradation, clear error states |
| **T-2002** | API schema changes | Runtime validation, version tolerance, explicit schema versions |
| **T-3001** | API pagination limits | Implement pagination-aware components, test at limits |
| **T-3002** | API data shape changes | Component adapts to optional fields, TypeScript types |
| **T-4001** | Performance issues below threshold | Optimize images, code split, dynamic imports |
| **T-4002** | Accessibility gaps | Early axe-core audit, component library compliance |
| **T-4003** | Responsive issues | Mobile-first design, test at all breakpoints real devices |
| **T-5001** | Build failures | Incremental typecheck, lint on CI, incremental adoption |

---

## 6.2 Acceptance Criteria by Phase

### 6.2.1 Phase 1 Acceptance Criteria (AC-001 through AC-010)

| AC-ID | Criteria | Verification |
|-------|----------|--------------|
| **AC-001** | App builds independently | `pnpm jizz:build` succeeds, `.next/` created |
| **AC-002** | Passes architectural lint | `pnpm lint:arch` 100% compliance, no violations |
| **AC-003** | TypeScript typecheck passes | `pnpm --filter @moonwitness/jizz typecheck` no errors |
| **AC-004** | Documentation contract passes | `pnpm docs:check` score ≥ 95/100 |
| **AC-005** | Home page renders | Visual inspection, no console errors, core question visible |
| **AC-005** | Observations display | Observations grid renders, source attribution present |
| **AC-005** | Perspectives display | Perspective list renders, actor/framing visible |
| **AC-005** | Responsive layout | Layout functions at 320px, 768px, 1440px viewport |
| **AC-005** | Loading state | `loading.tsx` renders during initial data fetch |
| **AC-005** | Error state | `error.tsx` renders on failed fetch, retry works |
| **AC-005** | Not-found state | `not-found.tsx` renders on invalid route navigation |
| **AC-006** | Engine credit visible | "Powered by ROCKSOUL JIZZ" gold badge present on home |
| **AC-007** | Ecosystem navigation | Navbar links: Dock (3001), Headquarter (3002), ID (3003) |
| **AC-008** | No raw HTML controls | No raw `<button>` or `<input type="text/password/email">` in app |
| **AC-009** | SDK usage (if applicable) | Any hub comms route through @allah/sdk (not raw fetch) |
| **AC-010** | Accessibility baseline | Manual keyboard tab, contrast check, reduced-motion test |

### 6.2.2 Phase 2 Acceptance Criteria (AC-011 through AC-020)

| AC-ID | Criteria | Verification |
|-------|----------|--------------|
| **AC-011** | Typecheck passes | `pnpm --filter @moonwitness/jizz typecheck` 0 errors |
| **AC-012** | Observations component | Grid renders, source attribution, coverage badge |
| **AC-013** | Perspectives component | List renders, actor names, framing badges visible |
| **AC-014** | Responsive layout | Adapts mobile (1 col), tablet (2 col), desktop (3+ col) |
| **AC-015** | Loading state | Visible during data fetch, dismissed on data arrival |
| **AC-016** | Error state | Renders on fetch failure, retry button functional |
| **AC-017** | Not-found state | Renders on invalid route, home link works |
| **AC-018** | No raw HTML controls | Lint gate confirms UI purity |
| **AC-019** | Full quality gates | All three: lint, typecheck, docs check pass |
| **AC-020** | API client operational | `api.ts` fetches data, runtime validation works |

### 6.2.3 Phase 3 Acceptance Criteria (AC-021 through AC-030)

| AC-ID | Criteria | Verification |
|-------|----------|--------------|
| **AC-021** | Phenomena catalog | Renders with search/filters, counts visible |
| **AC-022** | Phenomenon detail | Comprehensive view, all sections present |
| **AC-023** | Perspective comparison | Side-by-side, actor/framing visible, comparison works |
| **AC-023** | Signal index | Renders with methodology, observable changes |
| **AC-023** | Sources directory | Provenance chain renders, URLs/identities present |
| **AC-023** | Timeline visualization | Chronological tracking, navigation functional |
| **AC-023** | Methodology documentation | Ontology, formulas, uncertainty present |
| **AC-024** | Typecheck still passes | No regressions from Phase 2 |
| **AC-025** | Lint still passes | No new UI purity violations |
| **AC-026** | Documentation contract | `pnpm docs:check` passes or close to 100/100 |
| **AC-027** | Performance within bounds | Lighthouse FCP < 2s, TTI < 5s (if applicable) |
| **AC-027** | Accessibility within bounds | axe-core AA compliance or documented gaps |

### 6.2.4 Phase 4 Acceptance Criteria (AC-031 through AC-040)

| AC-ID | Criteria | Verification |
|-------|----------|--------------|
| **AC-031** | Performance audit passed | Lighthouse FCP < 2s, TTI < 5s |
| **AC-032** | Accessibility audit passed | WCAG AA compliance or documented remediation |
| **AC-033** | Responsive QA complete | Layout works at 320px, 768px, 1440px+, mobile devices |
| **AC-034** | Security review complete | No critical SSRF, secret, or input sanitization findings |
| **AC-035** | Cross-browser testing complete | Chrome, Firefox, Safari, Edge: no critical issues |
| **AC-035** | Full quality gates | All: `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch` |
| **AC-036** | No regressions | Prior phases' criteria still met |
| **AC-037** | Accessibility retrofits | Any gaps from Phase 3 addressed |
| **AC-038** | Performance optimizations | Any improvements from Phase 3 analysis |
| **AC-039** | Cross-browser compatibility | All major browsers tested, no critical issues |
| **AC-040** | Hardening phase complete | All T-4001–T-4006 complete, gate passes |

### 6.2.5 Phase 5 Acceptance Criteria (AC-041 through AC-050)

| AC-ID | Criteria | Verification |
|-------|----------|--------------|
| **AC-041** | Production build successful | `pnpm jizz:build` creates `.next/` directory |
| **AC-042** | Staging deployment verified | Staging environment serves correctly |
| **AC-043** | Release checklist 100% | All items checked and verified |
| **AC-044** | Deployment approval granted | Separate approval for DNS/secrets/production |
| **AC-045** | No critical post-release issues | 48h monitoring, no critical bugs logged |
| **AC-046** | All prior phase criteria met | AC-001 through AC-040 still pass |
| **AC-046** | All quality gates green | lint, typecheck, docs check all pass |
| **AC-047** | Monitoring in place | 48h observation period configured |
| **AC-048** | Rollback plan documented | Procedure if deployment issues arise |
| **AC-048** | Post-launch communications | Team informed of new app, port, responsibilities |
| **AC-049** | Team onboarding complete | Team members can `pnpm jizz:dev`, run quality gates |
| **AC-050** | WORLD OBSERVATORY live | App running on port 3004, accessible to public |

### 6.2.6 Final Readiness Classification

| Classification | Criteria | Action |
|----------------|----------|--------|
| **READY** | All AC-001 through AC-050 complete | Deploy to production |
| **CONDITIONALLY READY** | AC-001 through AC-045 complete, AC-046–AC-050 pending | Address pending items, re-evaluate |
| **NOT READY** | Essential criteria unmet (AC-001 through AC-020) | Complete foundation work first |

---

## 6.3 Implementation Governance

### 6.3.1 Change Control

| Change Type | Requirement | Approval |
|-------------|-------------|----------|
| **Documentation only** | Update docs, regenerate contracts | Lead approval |
| **Component addition** | New component, no API changes | Lead + peer review |
| **API contract change** | New/changed endpoint, data shape | Lead + architecture review |
| **Quality gate relaxation** | Skip or reduce a gate | Architecture + lead approval |
| **Depency version bump** | Update package version | Lead + CI verification |
| **UI purity violation** | Raw `<button>` or `<input>` added | Architecture emergency, fix immediately |

### 6.3.2 Branch & Merge Policy

| Branch | Purpose | Merge Policy |
|--------|---------|--------------|
| **dev** | Integration branch, daily builds | PR requires 2 approvals, all quality gates green |
| **feature/\*** | Feature development | Squash merge to dev after criteria met |
| **release/\*** | Release candidate | PR requires architecture + lead approval |
| **main** | Production-ready | Auto-merge after release candidate passes all gates |

### 6.3.3 Commit Message Convention

| Convention | Example |
|------------|---------|
| ** feat: new feature** | `feat: add observations grid with source attribution` |
| **fix: bug fix** | `fix: resolve loading state race condition` |
| **docs: documentation** | `docs: update README with jizz port 3004` |
| **chore: maintenance** | `chore: bump @moonwitness/ui to v1.9.0` |
| **refactor: code restructure** | `refactor: move API client to src/lib/api.ts` |
| **test: add test** | `test: add unit test for API client validation` |

### 6.3.3 Issue Tracking

| Issue Type | Template | Link to Task |
|------------|----------|--------------|
| **Bug** | Bug report template | Link to T-* task |
| **Feature** | Feature request template | Link to T-* task |
| **Task** | Task checklist (this roadmap) | Self-referential |
| **Documentation** | Doc update template | Link to plan artifact |
| **Quality Gate** | Gate violation report | Link to gate run |

---

## 6.4 Success Metrics Tracking

| Metric | Target | Current | Method | Frequency |
|--------|--------|---------|--------|-----------|
| **Build time** | < 60 seconds | N/A | `time pnpm jizz:build` | Each build |
| **Lighthouse score** | FCP < 2s, TTI < 5s | N/A | Lighthouse audit | Each Phase 4 |
| **axe-core score** | WCAG AA compliance | N/A | axe-core audit | Each Phase 4 |
| **Quality gate pass rate** | 100% | N/A | `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check` | Each gate run |
| **Type errors** | 0 errors | N/A | `pnpm typecheck` output | Each typecheck run |
| **UI purity violations** | 0 violations | N/A | `pnpm lint:arch` output | Each lint run |
| **Documentation score** | ≥ 95/100 | N/A | `pnpm docs:check` output | Each docs check run |

---

## 6.5 Post-Launch Activities

| Activity | Owner | Timing | Success Criteria |
|----------|-------|--------|------------------|
| **48h monitoring** | lead | 48 hours post-deploy | No critical issues logged |
| **Team retrospective** | lead + team | 1 week post-deploy | Action items documented |
| **Usage analytics (if permitted)** | lead | 1 week post-deploy | Insights without PII |
| **Documentation update** | lead | 1 week post-deploy | Updated docs reflect deployed state |
| **Roadmap review** | lead | 2 weeks post-deploy | Next phase priorities identified |
| **Security review** | lead | 2 weeks post-deploy | No new security findings |
| **Roadmap update** | lead | 1 month post-deploy | Priorities adjusted based on learning |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [03-requirements.md](03-requirements.md)
- [04-current-state.md](04-current-state.md)
- [05-target-architecture.md](05-target-architecture.md)
- [07-acceptance-criteria.md] (planned)
- [08-risk-register.md] (planned)