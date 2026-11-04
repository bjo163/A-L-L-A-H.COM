# SPEC: CI/CD & Build Gate Integration Gap for New Apps (harbor, moonsky)

## 1. Executive Summary

Two Next.js applications (`apps/harbor`, `apps/moonsky`) exist in the workspace with valid `package.json`, `tsconfig.json`, and source structure, but are **completely orphaned from all CI/CD infrastructure**. They are missing from:
- Root `package.json` build scripts (`harbor:build`, `moonsky:build`, `harbor:dev`, `moonsky:dev`)
- `.github/workflows/ci-dev.yml` verify jobs
- `.github/workflows/publish-deploy.yml` matrix
- `docker-compose.yml` production services
- Dockerfiles (`apps/harbor/Dockerfile`, `apps/moonsky/Dockerfile`)

This creates a **silent integration risk**: apps build locally (`pnpm harbor:build` works if script existed) but will fail in CI, Docker builds, and production deployment. The monorepo build gate invariant — "all apps in `apps/*` must be integrated into CI/CD" — is violated.

## 2. Problem Statement

| Component | Evidence | Status |
|-----------|----------|--------|
| `apps/harbor` | Valid Next.js 16 app, port 3006, SkinRoot="rocksoul", deps: `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` | **Orphaned from CI/CD** |
| `apps/moonsky` | Valid Next.js 16 app, port 3005, SkinRoot="riot-anarchy", deps: `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` | **Orphaned from CI/CD** |
| Root `package.json` | Has `dock:build`, `headquarter:build`, `id:build`, `jizz:build`, `gate:build`, `arsy:build`, `sentinel:build`, `extension:build` — **NO harbor/moonsky** | **Gap** |
| `ci-dev.yml` | 10 verify jobs (lint-arch, typecheck, lint, dock, headquarter, id, jizz, gate, arsy, sentinel, extension, tests, docs) — **NO harbor/moonsky** | **Gap** |
| `publish-deploy.yml` | Matrix: arsy, gate, dock, headquarter, id, jizz, sentinel — **NO harbor/moonsky** | **Gap** |
| `docker-compose.yml` | Services: arsy, gate, dock, headquarter, id, jizz, sentinel — **NO harbor/moonsky** | **Gap** |
| Dockerfiles | `apps/harbor/Dockerfile` — **MISSING**; `apps/moonsky/Dockerfile` — **MISSING** | **Gap** |

## 3. Root-Cause Analysis

1. **Incremental app addition without integration checklist**: When `harbor` and `moonsky` were added, no process ensured they were wired into all 4 CI/CD layers (root scripts, GitHub Actions, Docker, docker-compose).
2. **No automated validation**: The `validate-workspace-scaffolds.mjs` script (run at `prebuild`) does not verify CI/CD integration completeness.
3. **Implicit convention**: Existing apps follow a pattern (`<app>:build` = `pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/<app> build`), but this convention is undocumented and unenforced.

## 4. Impact & Severity Assessment

| Metric | Assessment |
|--------|------------|
| **Severity** | **High** — Silent CI/CD gap; apps work locally but fail in pipeline |
| **Impact** | Ecosystem-wide — affects deployment reliability, release automation, production topology |
| **Frequency** | Every push to `dev`/`main` — gap persists until fixed |
| **Recovery** | Requires coordinated changes across 5+ files; moderate effort |

## 5. Expected Outcomes

After implementation:
- `pnpm harbor:build` and `pnpm moonsky:build` work from root (following existing pattern)
- `pnpm dev` includes `harbor:dev` and `moonsky:dev` in `concurrently`
- `ci-dev.yml` has `verify-harbor` and `verify-moonsky` jobs
- `publish-deploy.yml` matrix includes `harbor` and `moonsky` components
- `docker-compose.yml` has `harbor` (port 3006) and `moonsky` (port 3005) services
- `apps/harbor/Dockerfile` and `apps/moonsky/Dockerfile` exist (following existing app patterns)
- All quality gates pass: `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`, `pnpm harbor:build`, `pnpm moonsky:build`

## 6. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | Add `harbor:build`, `moonsky:build`, `harbor:dev`, `moonsky:dev` to root `package.json` scripts |
| FR-002 | Add `harbor:dev` and `moonsky:dev` to `pnpm dev` concurrently command |
| FR-003 | Add `verify-harbor` and `verify-moonsky` jobs to `.github/workflows/ci-dev.yml` |
| FR-004 | Add `harbor` and `moonsky` to `promote-to-main` `needs` array in `ci-dev.yml` |
| FR-005 | Add `harbor` and `moonsky` to `publish-deploy.yml` matrix with correct Dockerfile paths |
| FR-006 | Add `harbor` and `moonsky` services to `docker-compose.yml` (ports 3006, 3005) |
| FR-007 | Create `apps/harbor/Dockerfile` following existing Next.js app pattern |
| FR-008 | Create `apps/moonsky/Dockerfile` following existing Next.js app pattern |
| FR-009 | Update `validate-workspace-scaffolds.mjs` to verify CI/CD integration for all `apps/*` |

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | Must follow existing patterns exactly (no new conventions) |
| NFR-002 | Must pass `pnpm lint:arch` (arch invariants) |
| NFR-003 | Must pass `pnpm typecheck` and `pnpm lint` |
| NFR-004 | Must not break existing app builds (dock, gate, headquarter, id, jizz, gate, arsy, sentinel) |
| NFR-005 | Dockerfiles must use `standalone` output mode like other Next.js apps |
| NFR-006 | Docker services must depend on `arsy` like other Next.js apps |

## 8. Scope & Out-of-Scope

### In Scope
- Root `package.json` script additions
- `.github/workflows/ci-dev.yml` job additions
- `.github/workflows/publish-deploy.yml` matrix additions
- `docker-compose.yml` service additions
- `apps/harbor/Dockerfile` creation
- `apps/moonsky/Dockerfile` creation
- `scripts/validate-workspace-scaffolds.mjs` enhancement

### Out of Scope
- Application code changes (harbor/moonsky source code)
- Skin/theme configuration changes
- Database schema or migration changes
- Authentication flow changes
- New CI/CD tooling or infrastructure

## 9. Affected Files

| File | Change Type |
|------|-------------|
| `package.json` | Modify (scripts) |
| `.github/workflows/ci-dev.yml` | Modify (jobs, needs) |
| `.github/workflows/publish-deploy.yml` | Modify (matrix) |
| `docker-compose.yml` | Modify (services) |
| `apps/harbor/Dockerfile` | Create new |
| `apps/moonsky/Dockerfile` | Create new |
| `scripts/validate-workspace-scaffolds.mjs` | Modify (validation) |

## 10. Acceptance Criteria

1. `pnpm harbor:build` and `pnpm moonsky:build` succeed from workspace root
2. `pnpm dev` starts harbor (port 3006) and moonsky (port 3005) alongside other apps
3. `pnpm -r run build` builds harbor and moonsky (21/21 projects)
4. `ci-dev.yml` workflow shows `verify-harbor` and `verify-moonsky` jobs passing
5. `publish-deploy.yml` workflow publishes `ghcr.io/...-harbor` and `ghcr.io/...-moonsky` images
6. `docker compose config --quiet` validates with harbor and moonsky services
7. `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check` all pass
8. No regressions in existing app builds

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing `pnpm dev` concurrently command | Low | Medium | Test locally before commit; follow exact existing pattern |
| Docker build context issues | Low | Medium | Use same `context: .` and `standalone` pattern as other apps |
| Port conflicts in docker-compose | Low | Low | Ports 3005/3006 are already declared in package.json dev scripts |
| GitHub Actions matrix expansion slowdown | Low | Low | `fail-fast: false` already set; parallel execution |
| Missing env vars for harbor/moonsky | Medium | Medium | Follow existing pattern: only `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` needed |

---

*Generated by Qoder Agent (Ultra Planner) — 2026-11-05 00:00:00+07:00*