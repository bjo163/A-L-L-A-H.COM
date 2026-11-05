# TASK: CI/CD & Build Gate Integration for harbor & moonsky

## Phase 1: Root package.json Scripts

- [x] **1.1** Add `harbor:build` script following types+sdk prebuild pattern
- [x] **1.2** Add `moonsky:build` script following types+sdk prebuild pattern
- [x] **1.3** Add `harbor:dev` script (simple filter dev)
- [x] **1.4** Add `moonsky:dev` script (simple filter dev)
- [x] **1.5** Update `dev` script to include `harbor:dev` and `moonsky:dev` in concurrently
- [x] **1.6** Validate: `pnpm harbor:build` succeeds from root
- [x] **1.7** Validate: `pnpm moonsky:build` succeeds from root
- [x] **1.8** Validate: `pnpm dev` starts all 8 apps (arsy, dock, headquarter, id, jizz, sentinel, harbor, moonsky)

## Phase 2: ci-dev.yml Verify Jobs

- [x] **2.1** Add `verify-harbor` job (copy pattern from `verify-dock`)
- [x] **2.2** Add `verify-moonsky` job (copy pattern from `verify-dock`)
- [x] **2.3** Add `verify-harbor` and `verify-moonsky` to `promote-to-main` `needs` array
- [ ] **2.4** Validate: Local `act` or push to dev branch triggers new jobs
- [ ] **2.5** Validate: Both jobs pass `pnpm harbor:build` / `pnpm moonsky:build`

## Phase 3: publish-deploy.yml Matrix

- [x] **3.1** Add `harbor` matrix entry with `dockerfile: apps/harbor/Dockerfile`
- [x] **3.2** Add `moonsky` matrix entry with `dockerfile: apps/moonsky/Dockerfile`
- [x] **3.3** Validate: Matrix expands correctly (9 components total)

## Phase 4: Dockerfiles Creation

- [x] **4.1** Verify `apps/harbor/next.config.ts` has `output: 'standalone'`
- [x] **4.2** Verify `apps/moonsky/next.config.ts` has `output: 'standalone'`
- [x] **4.3** Create `apps/harbor/Dockerfile` (copy from `apps/dock/Dockerfile`, adjust port to 3006, build script to `harbor:build`)
- [x] **4.4** Create `apps/moonsky/Dockerfile` (copy from `apps/dock/Dockerfile`, adjust port to 3005, build script to `moonsky:build`)
- [x] **4.5** Validate: `docker build -f apps/harbor/Dockerfile .` succeeds
- [x] **4.6** Validate: `docker build -f apps/moonsky/Dockerfile .` succeeds

## Phase 5: docker-compose.yml Services

- [x] **5.1** Add `harbor` service (port 3006, depends_on: arsy, env: NEXT_PUBLIC_ECOSYSTEM_ORIGIN)
- [x] **5.2** Add `moonsky` service (port 3005, depends_on: arsy, env: NEXT_PUBLIC_ECOSYSTEM_ORIGIN)
- [x] **5.3** Validate: `docker compose config --quiet` passes (with placeholder env vars)
- [x] **5.4** Validate: `docker compose up --build harbor moonsky` starts successfully

## Phase 6: Scaffold Validation Enhancement

- [x] **6.1** Read `scripts/validate-workspace-scaffolds.mjs` to understand current validation
- [x] **6.2** Add check: every `apps/*` has `app` or `pages` directory
- [x] **6.3** Add check: every `apps/*` has `Dockerfile`
- [x] **6.4** Add check: every `apps/*` has corresponding script in root `package.json`
- [x] **6.5** Add check: every `apps/*` has verify job in `ci-dev.yml`
- [x] **6.6** Add check: every `apps/*` has matrix entry in `publish-deploy.yml`
- [x] **6.7** Add check: every `apps/*` has service in `docker-compose.yml`
- [x] **6.8** Validate: `pnpm prebuild` (runs validation) passes for all apps

## Phase 7: Full Integration Validation

- [ ] **7.1** Run `pnpm lint:arch` — must pass
- [ ] **7.2** Run `pnpm typecheck` — must pass
- [ ] **7.3** Run `pnpm lint` — must pass
- [ ] **7.4** Run `pnpm docs:check` — must pass 100/100
- [ ] **7.5** Run `pnpm -r run build` — must report "Scope: 21 of 21 workspace projects"
- [ ] **7.6** Run `pnpm harbor:build` and `pnpm moonsky:build` — both succeed
- [ ] **7.7** Run `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build`, `pnpm gate:build`, `pnpm arsy:build`, `pnpm sentinel:build` — no regressions
- [ ] **7.8** Push to `dev` branch — CI workflow passes including new verify jobs
- [ ] **7.9** Verify `promote-to-main` triggers `publish-deploy.yml` with harbor/moonsky images

## Validation Procedures

### Local Validation Commands

```bash
# Phase 1 validation
pnpm harbor:build
pnpm moonsky:build
pnpm dev  # Check all 8 apps start (Ctrl+C after verify)

# Phase 4 validation
docker build -f apps/harbor/Dockerfile . -t test-harbor
docker build -f apps/moonsky/Dockerfile . -t test-moonsky

# Phase 5 validation
JWT_SECRET=test ARSY_MASTER_KEY=test BETTER_AUTH_URL=http://localhost BETTER_AUTH_SECRET=test32charslong CORS_ORIGINS=http://localhost docker compose config --quiet
JWT_SECRET=test ARSY_MASTER_KEY=test BETTER_AUTH_URL=http://localhost BETTER_AUTH_SECRET=test32charslong CORS_ORIGINS=http://localhost docker compose up --build harbor moonsky

# Phase 6 validation
pnpm prebuild

# Phase 7 validation
pnpm lint:arch && pnpm typecheck && pnpm lint && pnpm docs:check
pnpm -r run build
```

### CI Validation

1. Push to `dev` branch
2. Watch GitHub Actions: `ci-dev.yml` must show 15 verify jobs (13 original + 2 new)
3. All jobs must pass
4. `promote-to-main` triggers on push to dev
5. `publish-deploy.yml` runs with 9 matrix components
6. Harbor and moonsky images published to ghcr.io

## Dependencies & Ordering

```
Phase 1 (scripts) ──► Phase 2 (ci-dev.yml) ──► Phase 3 (publish-deploy.yml)
      │                                          │
      ▼                                          ▼
Phase 4 (Dockerfiles) ◄── Phase 5 (docker-compose.yml)
      │
      ▼
Phase 6 (validation script) ──► Phase 7 (full validation)
```

**Critical path**: Phase 1 → Phase 4 → Phase 5 → Phase 7 (Dockerfiles needed for docker-compose validation)

## Rollback Plan

If any phase breaks existing apps:
1. Revert the specific file change
2. Run full validation suite (Phase 7)
3. Identify root cause
4. Fix and re-apply incrementally

---

*Generated by Qoder Agent (Ultra Planner) — 2026-11-05 00:00:00+07:00*