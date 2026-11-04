# TASK: Workspace Build Gate Integrity & Scaffold Hygiene

## Implementation Phases

### Phase 1: Pre-Build Validation & Local Verification
- Add scaffold validation script
- Verify all apps have valid Next.js structure
- Confirm build gate behavior

### Phase 2: Scaffold Cleanup & Workspace Configuration
- Exclude incomplete scaffolds from workspace
- Update gitignore
- Verify build gate completeness

### Phase 3: CI Integration & Regression Testing
- Add validation to CI pipeline
- Document in AGENTS.md if needed
- Final verification

## Granular Implementation Tasks

### Task T-001: Create Scaffold Validation Script
- **Objective**: Create `scripts/validate-workspace-scaffolds.mjs` that checks every `apps/*` for valid Next.js structure
- **Expected changes**: New script file
- **Dependencies**: None
- **Validation procedure**: 
  - Run script locally: `node scripts/validate-workspace-scaffolds.mjs`
  - Should exit 1 for `apps/moonsky` (no app/pages), 0 for valid apps
- **Completion criteria**: Script passes validation for valid apps, fails for moonsky

### Task T-002: Add Pre-Build Hook to Root package.json
- **Objective**: Add `prebuild` script that runs scaffold validation before `pnpm -r run build`
- **Expected changes**: `package.json` scripts section
- **Dependencies**: T-001
- **Validation procedure**: 
  - Run `pnpm run prebuild` 
  - Should fail on moonsky
- **Completion criteria**: `pnpm run prebuild` exits 1 with clear error

### Task T-003: Exclude Incomplete Scaffolds from Workspace
- **Objective**: Update `pnpm-workspace.yaml` to exclude `apps/moonsky` and `apps/server`
- **Expected changes**: `pnpm-workspace.yaml` packages array
- **Dependencies**: T-002
- **Validation procedure**: 
  - `pnpm ls -r` should list 19 projects (was 21)
  - `pnpm -r run build` should build 19 projects
- **Completion criteria**: Workspace excludes incomplete apps

### Task T-004: Update .gitignore for Scaffold Directories
- **Objective**: Add `apps/moonsky/` and `apps/server/` to `.gitignore`
- **Expected changes**: `.gitignore` file
- **Dependencies**: T-003
- **Validation procedure**: 
  - `git status` should show `apps/moonsky` and `apps/server` as ignored
  - `git add apps/moonsky` should be ignored
- **Completion criteria**: No untracked scaffold directories in git status

### Task T-005: Verify Build Gate Completeness
- **Objective**: Confirm `pnpm -r run build` builds all remaining workspace projects
- **Expected changes**: None (verification)
- **Dependencies**: T-004
- **Validation procedure**: 
  - Run `pnpm -r run build`
  - Should report "Scope: 19 of 19 workspace projects"
  - All builds should succeed
- **Completion criteria**: Build gate passes on all remaining projects

### Task T-006: Add CI Validation Step
- **Objective**: Add scaffold validation to CI pipeline before build
- **Expected changes**: CI workflow files (`.github/workflows/*.yml`)
- **Dependencies**: T-005
- **Validation procedure**: 
  - Trigger CI run
  - Validation step passes before build
- **Completion criteria**: CI fails fast on invalid scaffolds

### Task T-007: Clean Up Empty Server Directory
- **Objective**: Remove `apps/server/` empty directory
- **Expected changes**: Remove `apps/server/`
- **Dependencies**: T-004
- **Validation procedure**: 
  - `ls apps/server` fails
  - `git status` clean
- **Completion criteria**: `apps/server` removed

### Task T-008: Update Documentation (Optional)
- **Objective**: Update `AGENTS.md` monorepo map if moonsky becomes valid in future
- **Expected changes**: `AGENTS.md` (if applicable)
- **Dependencies**: None
- **Validation procedure**: Manual review
- **Completion criteria**: Documentation reflects actual state

## Dependencies & Execution Order

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008
```

## Parallelizable Workstreams

- **None** — sequential due to dependency on workspace configuration changes

## Regression Tests

| Test | Command | Expected |
|------|---------|----------|
| Build gate completeness | `pnpm -r run build` | 19/19 projects (or 21/21 if moonsky completed) |
| Scaffold validation | `node scripts/validate-workspace-scaffolds.mjs` | 0 (valid apps) / 1 (moonsky) |
| Git ignore | `git status` | No untracked apps/ |
| CI validation | CI pipeline | Fails on invalid scaffolds |

## Type Checking & Build Verification

- `pnpm typecheck` must pass (packages/ui, dock, headquarter, id, jizz, gate)
- `pnpm lint:arch` must pass
- `pnpm lint` must pass (--max-warnings 0)
- `pnpm ui:test` must pass
- `pnpm ui:contrast` must pass

## CI/CD Validation

- CI pipeline must run `pnpm -r run build` and pass
- CI must run scaffold validation before build

## Integration Testing

- Verify `pnpm --filter @moonwitness/moonsky dev` fails (expected for excluded app)
- Verify `pnpm --filter @moonwitness/dock dev` works (valid app)
- Verify `pnpm --filter @moonwitness/jizz dev` works (valid app)

## Documentation Updates

- Update `AGENTS.md` monorepo map if moonsky becomes valid
- Update `README.md` if needed (optional)

## Completion Checklist

- [ ] T-001: Scaffold validation script created
- [ ] T-002: Pre-build hook added
- [ ] T-003: Workspace glob updated (exclude moonsky, server)
- [ ] T-004: .gitignore updated
- [ ] T-005: Build gate complete (19/19 or 21/21)
- [ ] T-006: CI validation added
- [ ] T-007: Empty server directory removed
- [ ] T-008: Documentation updated (if needed)

---
*Task list follows the "In Progress → Done" convention (- [ ] → - [x])*