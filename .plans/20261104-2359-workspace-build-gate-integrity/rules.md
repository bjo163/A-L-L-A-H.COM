# RULE: Workspace Build Gate Integrity & Scaffold Hygiene

## 1. Mandatory Repository Architecture Guidelines

| Rule | Specification |
|------|---------------|
| **R-001** | **Workspace Build Completeness** — `pnpm -r run build` MUST build **all** projects listed in `pnpm-workspace.yaml` that have a `build` script. No project may be silently skipped. |
| **R-002** | **Next.js Scaffold Validity** — Every `apps/*` project MUST contain either `src/app` or `src/pages` directory (Next.js 16 App Router or Pages Router) if it has a `next build` script. |
| **R-003** | **Git Tracking Consistency** — All `apps/*` directories MUST be either tracked in git OR explicitly ignored in `.gitignore`. No untracked `apps/*` directories allowed. |
| **R-004** | **Scaffold Hygiene** — `apps/*` directories with `package.json` MUST be either (a) complete and buildable, OR (b) explicitly excluded from workspace and git. |

## 2. MoonWitness Ecosystem Invariants

| Invariant | Enforcement |
|-----------|-------------|
| **Build Gate** | `pnpm -r run build` + `pnpm lint:arch` + `pnpm typecheck` + `pnpm lint` + `pnpm ui:test` + `pnpm ui:contrast` MUST ALL pass |
| **Default-Deny Auth** | Not applicable (scaffold hygiene) |
| **Tenant Isolation** | Not applicable |
| **ORM Embedded PGlite** | Not applicable |
| **Audit Events** | Not applicable |
| **Global Admin** | Not applicable |
| **Style Source** | Not applicable (no UI in scaffold) |
| **Markup Colour** | Not applicable |
| **Icon Source** | Not applicable |
| **Landmark Purity** | Not applicable |
| **Client Secrets** | Not applicable |
| **Composition Blocks** | Not applicable |
| **Route States** | Not applicable |
| **Skin Ownership** | Not applicable |
| **Retention** | Not applicable |
| **SSRF** | Not applicable |

## 3. Strict TypeScript Safety Requirements

| Rule | Specification |
|------|---------------|
| **TS-001** | **No TypeScript errors** — All valid workspace projects must pass `pnpm typecheck` |
| **TS-002** | **Strict mode** — `tsconfig.base.json` `strict: true` applies to all `apps/*` projects |
| **TS-003** | **No `any`** — Valid apps must not use `any` without explicit justification |
| **TS-004** | **Module resolution** — `apps/*` projects use `packages/*` via workspace `link:` protocol |

## 4. API Validation & Contract Rules

**Not applicable** — This plan addresses scaffold hygiene, not API validation.

## 5. Build Gate Compliance

| Gate | Requirement | Status |
|------|-------------|--------|
| `pnpm docs:check` | 100/100 required | Unchanged |
| `pnpm lint:arch` | Arch invariants | Unchanged |
| `pnpm lint` | ESLint, --max-warnings 0 | Unchanged |
| `pnpm typecheck` | TS strict | Unchanged |
| `pnpm ui:test` | Design system contracts | Unchanged |
| `pnpm ui:contrast` | WCAG ratios | Unchanged |
| `pnpm dock:build` | Dock Next.js build | Unchanged |
| `pnpm headquarter:build` | HQ Next.js build | Unchanged |
| `pnpm id:build` | ID Next.js build | Unchanged |
| `pnpm jizz:build` | JIZZ Next.js build | Unchanged |
| `pnpm gate:build` | Gate Next.js build | Unchanged |
| `pnpm --filter @allah/arsy build` | ARSY Fastify build | Unchanged |
| **NEW** `scripts/validate-workspace-scaffolds.mjs` | Scaffold validation | **MANDATORY** |

**Pre-commit**: `docs:check` + `lint:arch` + `lint` + `typecheck` + `ui:contrast` + **scaffold validation**

**Pre-push**: All build gates + `ui:test` + `ui:contrast` + **scaffold validation**

## 6. Package Boundary Restrictions

| Rule | Specification |
|------|---------------|
| **PB-001** | **Workspace glob** — `pnpm-workspace.yaml` `packages: - "apps/*" - "packages/*"` must exclude incomplete scaffolds via negation patterns (`!apps/moonsky`, `!apps/server`) |
| **PB-002** | **No direct package.json in apps/ root** — Only valid apps may have `package.json` in `apps/*` |
| **PB-003** | **No empty app directories** — `apps/*` directories MUST contain a `package.json` with valid `build` script OR be excluded |

## 7. Dependency Management Rules

| Rule | Specification |
|------|---------------|
| **DM-001** | **Workspace linking** — `apps/*` projects use `packages/*` via `link:` protocol (pnpm workspaces) |
| **DM-002** | **No duplicate deps** — `apps/*` and `packages/*` share versions via workspace protocol |
| **DM-003** | **Scaffold deps** — Incomplete scaffolds must not be pulled into dependency tree of valid apps |

## 8. Error Handling Requirements

| Rule | Specification |
|------|---------------|
| **EH-001** | **Fail-fast validation** — Scaffold validation script exits 1 on first invalid scaffold |
| **EH-002** | **Clear error messages** — Validation errors must specify which `apps/*` is invalid and why |
| **EH-003** | **CI failure visibility** — Scaffold validation failures must appear in CI logs before build |

## 9. Security & Data Integrity Rules

| Rule | Specification |
|------|---------------|
| **SEC-001** | **No credential leakage** — Scaffold projects must not contain `.env` files with secrets |
| **SEC-002** | **Server-only imports** — `server-only` dependency only in server-side code |
| **SEC-003** | **SSRF protection** | Not applicable |

## 10. Testing & Regression Prevention

| Rule | Specification |
|------|---------------|
| **TR-001** | **Validation in CI** — Scaffold validation runs in CI before build |
| **TR-002** | **Local validation** — `pnpm run prebuild` runs scaffold validation |
| **TR-003** | **Test coverage** — Add `scripts/test-workspace-build-completeness.mjs` to verify gate completeness |
| **TR-004** | **No TODO-only components** — Applies to valid apps only |

## 11. Backward Compatibility

| Rule | Specification |
|------|---------------|
| **BC-001** | **Valid apps unchanged** — `dock`, `gate`, `headquarter`, `id`, `jizz`, `arsy`, `sentinel` continue building |
| **BC-002** | **Shared packages unchanged** — `packages/*` unaffected |
| **BC-003** | **Scaffold preservation** — `apps/moonsky` remains on disk (excluded, not deleted) for future use |

## 12. Prohibited Shortcuts & Anti-Patterns

| Anti-Pattern | Prohibition |
|--------------|-------------|
| **AP-001** | **Silent build skips** — Do not allow `pnpm -r run build` to skip projects without explicit configuration |
| **AP-002** | **Untracked scaffolds** — Do not leave `apps/*` untracked in git |
| **AP-003** | **Empty app directories** — Do not leave `apps/*` with `package.json` but no `pages`/`app` |
| **AP-004** | **Workspace bloat** — Do not add `packages/*` globs without validation |
| **AP-005** | **Manual workarounds** — Do not "just ignore the warning" — fix the root cause |

## 13. Git & Branch Workflow

| Rule | Specification |
|------|---------------|
| **GW-001** | **Commit clean** — `git status` must show no untracked `apps/*` directories |
| **GW-002** | **Branch isolation** — Scaffold cleanup on feature branch before merge |
| **GW-003** | **Pre-commit hook** — Scaffold validation runs in pre-commit (optional) |
| **GW-004** | **No force-push on scaffold changes** — Scaffold changes require review |

## 14. Required Validation Before Completing Tasks

| Validation | Command | Expected |
|------------|---------|----------|
| **V-001** | `pnpm -r run build` | "Scope: 19 of 19 workspace projects" (or 21/21 if moonsky completed) |
| **V-002** | `pnpm typecheck` | 0 errors (packages/ui, dock, headquarter, id, jizz, gate) |
| **V-003** | `pnpm lint:arch` | 0 errors |
| **V-004** | `pnpm lint` | 0 errors (--max-warnings 0) |
| **V-005** | `pnpm ui:test` | Pass |
| **V-006** | `pnpm ui:contrast` | Pass |
| **V-007** | `git status` | No untracked `apps/*` directories |
| **V-008** | `node scripts/validate-workspace-scaffolds.mjs` | 0 exit code (valid apps) |

## 15. Agent Execution Boundaries

| Boundary | Specification |
|----------|---------------|
| **EB-001** | **No unrelated refactoring** — Do not modify valid apps (dock, gate, headquarter, id, jizz, arsy, sentinel) |
| **EB-002** | **No build tool changes** — Do not change pnpm, next, tsup, turbopack configuration |
| **EB-003** | **No dependency version bumps** — Do not update package versions outside scaffold cleanup |
| **EB-004** | **No UI changes** — Do not modify `packages/ui`, `packages/types`, `packages/sdk` |
| **EB-005** | **No auth changes** — Do not modify authentication logic |
| **EB-006** | **No database changes** — Do not modify `packages/arsy-orm` |

## 16. Restrictions Against Unrelated Refactoring

- **DO NOT** modify `apps/dock/`, `apps/gate/`, `apps/headquarter/`, `apps/id/`, `apps/jizz/`, `apps/arsy/`, `apps/sentinel/`
- **DO NOT** modify `packages/ui/`, `packages/sdk/`, `packages/types/`, `packages/arsy-orm/`, `packages/arsy-plugin-*`
- **DO NOT** change `pnpm-workspace.yaml` beyond scaffold exclusions
- **DO NOT** change `tsconfig.base.json` beyond scaffold validation

## 17. Conclusion

This rule set enforces **workspace build gate integrity** by ensuring every project in the workspace is either:
1. **Valid and buildable** (has `pages`/`app`, passes build), OR
2. **Explicitly excluded** (workspace glob negation, `.gitignore`)

The build gate must never pass with false positives. All validation runs in CI and locally.

---
*Enforced by Qoder Agent (Ultra Planner) — 2026-11-04 23:59:00+07:00*