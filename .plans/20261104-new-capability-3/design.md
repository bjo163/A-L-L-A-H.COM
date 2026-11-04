---
title: "NEW-PLATFORM-CAPABILITY-3: Authentication Guard Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Design

## Guard Scaffold Design

This plan creates a minimal authentication guard scaffold serving as a template for future authentication capabilities.

### Directory Structure Design

```
.capabilities/
  capability-3/
    spec.md      ← Objective, scope, deliverables
    task.md      ← Concrete tasks with acceptance criteria
    design.md    ← This file: guard scaffold architecture
    rules.md     ← Rules for guard creation
    report.md    ← Generated on completion (only when real guard exists)
```

### Design Principles

1. **Template-first approach**: The scaffold is a template, not a functional guard
2. **No false claims**: Must not be marked VERIFIED without actual product code
3. **Follow conventions**: Plan structure must match existing `.plans/*/spec.md` format
4. **Evolve-loop-guard compatible**: Designed to prevent the anti-pattern of falsely VERIFIED capabilities
5. **Minimal by design**: Only contains structure, no runtime or business logic

### Guard Middleware Stubs

The scaffold provides these stub files (empty/placeholder only):

- `src/GuardMiddleware.ts` - Empty middleware placeholder
- `types/AuthTypes.ts` - Empty types placeholder
- `utils/AuthUtils.ts` - Empty utilities placeholder

### What This Scaffold Provides

- ✅ Valid plan directory structure
- ✅ Proper frontmatter and metadata
- ✅ Documentation Contract compliance (100/100 potential)
- ✅ Antislop conformance
- ✅ Architectural invariant compatibility
- ✅ TypeScript type-check compatibility
- ❌ No actual guard functionality
- ❌ No new code, routes, or middleware
- ❌ No runtime or business logic