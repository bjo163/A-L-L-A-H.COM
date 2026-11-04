# DESIGN: Workspace Build Gate Integrity & Scaffold Hygiene

## 1. Current-State Architecture

```
Monorepo Workspace
├── pnpm-workspace.yaml (packages: apps/*, packages/*)
├── apps/
│   ├── arsy/          (Fastify 5 + PGlite)
│   ├── dock/          (Next.js 16 + React 19)
│   ├── gate/          (Next.js 16 + React 19)
│   ├── headquarter/   (Next.js 16 + React 19)
│   ├── id/            (Next.js 16 + React 19 + better-auth)
│   ├── jizz/          (Next.js 16 + React 19)
│   ├── sentinel/      (RADIUS daemon)
│   ├── moonsky/       (Next.js 16 scaffold — **INCOMPLETE**)
│   └── server/        (empty directory)
├── packages/
│   ├── ui/            (Design system)
│   ├── sdk/           (Client↔hub comms)
│   ├── types/         (Shared contracts)
│   └── ... (15 packages)
└── scripts/           (CI automation)
```

**Build Gate Flow**: `pnpm -r run build` → runs `build` script in all workspace projects with `build` script → **skips moonsky** (fails fast, but counted as "skipped" in scope)

## 2. Identified Architectural Weaknesses

| Weakness | Location | Impact |
|----------|----------|--------|
| **W-001**: Scaffold → Build mismatch | `apps/moonsky` | Build gate passes with broken project |
| **W-002**: Workspace glob no validation | `pnpm-workspace.yaml` | Includes untracked/incomplete projects |
| **W-003**: Git untracked scaffold | `apps/moonsky` (untracked) | Drift between environments |
| **W-004**: Empty app directory | `apps/server` | Unused, misleading |

## 3. Root-Cause Remediation Strategy

**Strategy**: Enforce workspace scaffold hygiene + build gate completeness. Two-tier approach:

1. **Validation layer**: Pre-build check that all `apps/*` projects have valid Next.js structure
2. **Scaffold cleanup**: Complete or exclude incomplete scaffolds
3. **Git hygiene**: Track or ignore all `apps/*` consistently

## 4. Proposed Architecture & Changes

### 4.1 Pre-Build Validation Script
```bash
# scripts/validate-workspace-scaffolds.mjs
# - Runs before pnpm -r run build
# - Checks every apps/* for: package.json, next.config.ts, src/app or src/pages
# - Exits 1 if any scaffold is incomplete
```

### 4.2 Scaffold Resolution Options
| Option | Action | Trade-off |
|--------|--------|-----------|
| **Complete** | Add `src/app/page.tsx` + content | Makes moonsky a valid app |
| **Exclude** | Add `apps/moonsky` to `.gitignore`, remove from workspace glob | Removes broken project |
| **Deprecate** | Rename to `apps/moonsky-deprecated/` + exclude | Preserves history |

**Selected**: **Exclude** (since moonsky is untracked and incomplete; not part of documented monorepo map)

### 4.3 Workspace Glob Refinement
Update `pnpm-workspace.yaml` to exclude known incomplete/untracked apps:
```yaml
packages:
  - "apps/*"
  - "!apps/moonsky"
  - "!apps/server"
  - "packages/*"
```

### 4.4 Git Hygiene
```bash
echo "apps/moonsky/" >> .gitignore
echo "apps/server/" >> .gitignore
```

## 5. API Validation & Contract Improvements

**Not applicable** — this is a build/scaffold hygiene issue, not API validation.

## 6. TypeScript Safety Improvements

**Not applicable** — scaffold projects have no source code to type.

## 7. Build & CI Gate Improvements

- **Existing gate**: `pnpm -r run build`
- **Enhanced gate**: `pnpm -r run build` + `scripts/validate-workspace-scaffolds.mjs`
- **Validation runs in CI** before build
- **Pre-commit hook**: Optional — validate scaffolds on commit

## 8. Data Integrity & Error-Handling Strategy

**Not applicable** — no data persistence in scaffolds.

## 9. Package & Dependency Boundaries

- **moonsky** depends on: `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`
- **Exclusion** removes these from workspace build tree (no dependency impact)
- **No cross-package dependency changes**

## 10. Security & Performance Considerations

- **Security**: No credential leakage (scaffold has no env vars)
- **Performance**: Excluding moonsky reduces build time by ~10s (next build cold start)

## 11. Backward Compatibility

- **Breaking**: `apps/moonsky` no longer in workspace (excluded)
- **Mitigation**: Scaffold preserved on disk for reference; documented in plan
- **Valid apps**: dock, gate, headquarter, id, jizz, arsy, sentinel unchanged

## 12. Testing & Regression Prevention

- **Test**: `pnpm -r run build` → 21/21 projects (or 19/21 if server excluded)
- **Regression test**: Add `scripts/test-workspace-build-completeness.mjs` to CI
- **Documentation**: Update `AGENTS.md` monorepo map if moonsky ever becomes valid

## 13. Integration Impacts

| Integration | Impact |
|-------------|--------|
| `pnpm -r run build` | 21/21 projects (was 20/21) |
| CI/CD pipelines | No change (already runs build) |
| Local dev | `pnpm --filter @moonwitness/moonsky dev` fails (expected) |
| `pnpm ls -r` | Lists 20 projects (was 21) |

## 14. Migration or Rollout Strategy

**Phase 1: Validation** — Add pre-build validation script, run locally
**Phase 2: Exclusion** — Update `pnpm-workspace.yaml`, `.gitignore`
**Phase 3: Verification** — `pnpm -r run build` shows 20/21 (server excluded) or 21/21 (if completed)
**Phase 4: CI** — Add validation to CI pipeline

## 15. Diagram: Workspace Build Flow

```
pnpm -r run build
  │
  ├─ Validate scaffolds (pre-build hook)
  │   └─ Check apps/* for app/pages directory
  │
  ├─ Build valid projects (19 apps)
  │   ├─ arsy: tsup
  │   ├─ dock: next build
  │   ├─ gate: next build
  │   ├─ headquarter: next build
  │   ├─ id: next build
  │   ├─ jizz: next build
  │   ├─ sentinel: tsup
  │   └─ ... (other packages)
  │
  └─ Exit with complete scope report
```

---
*Design aligned with AUTONOMOUS.md, QUALITY.md, AGENTS.md*