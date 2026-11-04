# RULES: CI/CD & Build Gate Integration for harbor & moonsky

## 1. Mandatory Rules (Non-Negotiable)

### 1.1 Pattern Conformance
- **RULE-001**: All new root `package.json` scripts MUST follow existing patterns exactly. No new conventions.
  - Next.js apps with `@moonwitness/types` + `@allah/sdk` deps → use `pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/<app> build`
  - Standalone Next.js apps → use `pnpm --filter @moonwitness/<app> build`
  - Dev scripts → `pnpm --filter @moonwitness/<app> dev`

### 1.2 CI/CD Completeness Invariant
- **RULE-002**: Every application in `apps/*` MUST be integrated into ALL FOUR CI/CD layers:
  1. Root `package.json` scripts (`<app>:build`, `<app>:dev`)
  2. `.github/workflows/ci-dev.yml` verify job (`verify-<app>`)
  3. `.github/workflows/publish-deploy.yml` matrix entry
  4. `docker-compose.yml` service definition
  5. `apps/<app>/Dockerfile` exists

- **RULE-003**: The `promote-to-main` job in `ci-dev.yml` MUST list ALL verify jobs in its `needs` array. No exceptions.

### 1.3 Dockerfile Standards
- **RULE-004**: All Next.js app Dockerfiles MUST:
  - Use multi-stage build (deps → builder → runner)
  - Use `node:22-alpine` base images
  - Enable `corepack` for pnpm
  - Set `NEXT_TELEMETRY_DISABLED=1`
  - Build with `output: 'standalone'` (next.config.ts must have this)
  - Run as non-root user `nextjs:nodejs` (UID 1001)
  - Copy `.next/standalone` and `.next/static` only
  - Expose correct port matching package.json dev script

### 1.4 Docker Compose Standards
- **RULE-005**: All Next.js app services in `docker-compose.yml` MUST:
  - Use `build.context: .` and `dockerfile: apps/<app>/Dockerfile`
  - Set `pull_policy: always` and `restart: unless-stopped`
  - Map port `<port>:<port>` matching dev script
  - Set `PORT=<port>`, `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`
  - Set `NEXT_PUBLIC_ECOSYSTEM_ORIGIN=${NEXT_PUBLIC_ECOSYSTEM_ORIGIN:-http://localhost}`
  - Depend on `arsy` service
  - Use `environment:` (not `env_file:`) for config

### 1.5 Validation Script Enhancement
- **RULE-006**: `scripts/validate-workspace-scaffolds.mjs` MUST validate CI/CD integration completeness for every `apps/*` directory. A project that passes scaffold validation but fails CI/CD integration validation is a BLOCKING failure for `pnpm prebuild`.

## 2. Agent Guardrails (Implementation Boundaries)

### 2.1 Files Agents MAY Modify
| File | Scope |
|------|-------|
| `package.json` | Add 4 scripts + update `dev` script ONLY |
| `.github/workflows/ci-dev.yml` | Add 2 verify jobs + update `promote-to-main` needs ONLY |
| `.github/workflows/publish-deploy.yml` | Add 2 matrix entries ONLY |
| `docker-compose.yml` | Add 2 services ONLY |
| `apps/harbor/Dockerfile` | Create new file ONLY |
| `apps/moonsky/Dockerfile` | Create new file ONLY |
| `scripts/validate-workspace-scaffolds.mjs` | Add validation checks ONLY |

### 2.2 Files Agents MUST NOT Modify
| File | Reason |
|------|--------|
| `apps/harbor/*` (source code) | Out of scope — app code changes not required |
| `apps/moonsky/*` (source code) | Out of scope — app code changes not required |
| `apps/dock/*`, `apps/gate/*`, `apps/headquarter/*`, `apps/id/*`, `apps/jizz/*`, `apps/arsy/*`, `apps/sentinel/*` | No regressions allowed |
| `packages/*` | No package changes required |
| `.github/workflows/quick-ci-check.yml` | Separate workflow; not in scope |
| `tsconfig.base.json`, `pnpm-workspace.yaml` | No config changes needed |

### 2.3 Forbidden Actions
- **FORBID-001**: Do NOT modify harbor/moonsky source code (pages, components, API routes)
- **FORBID-002**: Do NOT change existing app build scripts or CI jobs
- **FORBID-003**: Do NOT introduce new Dockerfile patterns or base images
- **FORBID-004**: Do NOT add new environment variables beyond `NEXT_PUBLIC_ECOSYSTEM_ORIGIN`
- **FORBID-005**: Do NOT change port assignments (3005/3006 are declared in package.json)
- **FORBID-006**: Do NOT skip any of the 4 CI/CD integration layers

## 3. Execution Boundaries

### 3.1 Phase Gates (Must Pass Before Proceeding)

| Phase | Gate Command | Must Pass |
|-------|-------------|-----------|
| 1 (Scripts) | `pnpm harbor:build && pnpm moonsky:build` | ✅ Both succeed |
| 2 (CI Jobs) | Local syntax check + `act` dry-run if available | ✅ YAML valid |
| 3 (Matrix) | `docker compose config --quiet` after Phase 5 | ✅ Validates |
| 4 (Dockerfiles) | `docker build -f apps/harbor/Dockerfile . && docker build -f apps/moonsky/Dockerfile .` | ✅ Both build |
| 5 (Compose) | `docker compose up --build harbor moonsky` (with placeholder env) | ✅ Starts |
| 6 (Validation) | `pnpm prebuild` | ✅ Passes |
| 7 (Full) | `pnpm lint:arch && pnpm typecheck && pnpm lint && pnpm docs:check && pnpm -r run build` | ✅ All pass |

### 3.2 Quality Gates (Final Verification)
Before marking plan complete, ALL must pass:
- [ ] `pnpm lint:arch` — 0 violations
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings (max-warnings 0)
- [ ] `pnpm docs:check` — 100/100
- [ ] `pnpm -r run build` — "Scope: 21 of 21 workspace projects"
- [ ] `pnpm harbor:build` — success
- [ ] `pnpm moonsky:build` — success
- [ ] All existing app builds still pass (no regressions)
- [ ] `docker compose config --quiet` — success
- [ ] GitHub Actions `ci-dev.yml` passes on `dev` branch push

## 4. Evidence Requirements

### 4.1 Per-Phase Evidence
Each phase completion MUST be accompanied by command output evidence:

| Phase | Required Evidence |
|-------|-------------------|
| 1 | Terminal output of `pnpm harbor:build` and `pnpm moonsky:build` succeeding |
| 2 | GitHub Actions run URL showing `verify-harbor` and `verify-moonsky` passing |
| 3 | GitHub Actions run URL showing `publish-deploy.yml` with 9 matrix components |
| 4 | Terminal output of both `docker build` commands succeeding |
| 5 | Terminal output of `docker compose config --quiet` and `docker compose up` success |
| 6 | Terminal output of `pnpm prebuild` passing |
| 7 | Terminal output of full quality gate suite passing |

### 4.2 Report.md Requirements
On plan completion, `report.md` MUST contain:
- Verified deliverables checklist (all acceptance criteria from spec.md)
- Evidence links/outputs for each phase
- No invented estimates or projections
- Exact commands run and their results
- Any deviations from plan with justification

## 5. Escalation Triggers

If any of the following occur, STOP and request human input:
- `pnpm typecheck` fails with errors unrelated to harbor/moonsky integration
- `pnpm lint:arch` reports new violations in unrelated files
- Existing app builds (dock, gate, headquarter, id, jizz, arsy, sentinel) start failing
- Docker build fails due to missing `output: 'standalone'` in next.config.ts (requires app config change — out of scope)
- GitHub Actions workflow syntax errors that cannot be resolved by pattern copying

## 6. Success Definition

**Plan is COMPLETE only when:**
1. All 7 phases have ✅ evidence
2. All quality gates in Section 3.2 pass
3. `report.md` written with verified evidence
4. Changes pushed to `dev` branch
5. CI/CD pipeline passes end-to-end including new jobs

---

*Generated by Qoder Agent (Ultra Planner) — 2026-11-05 00:00:00+07:00*