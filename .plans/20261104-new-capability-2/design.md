---
title: "NEW-PLATFORM-CAPABILITY-2: Dashboard Widget Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Design

## Widget Scaffold Design

This plan creates a minimal dashboard widget scaffold serving as a template for future dashboard capabilities.

### Directory Structure Design

```
.capabilities/
  capability-2/
    spec.md      ← Objective, scope, deliverables
    task.md      ← Concrete tasks with acceptance criteria
    design.md    ← This file: widget scaffold architecture
    rules.md     ← Rules for widget creation
    report.md    ← Generated on completion (only when real widget exists)
```

### Design Principles

1. **Template-first approach**: The scaffold is a template, not a functional widget
2. **No false claims**: Must not be marked VERIFIED without actual product code
3. **Follow conventions**: Plan structure must match existing `.plans/*/spec.md` format
4. **Evolve-loop-guard compatible**: Designed to prevent the anti-pattern of falsely VERIFIED capabilities
5. **Minimal by design**: Only contains structure, no runtime or business logic

### Stub Components

The scaffold provides these stub files (empty/placeholder only):

- `src/WidgetStub.tsx` - Empty component placeholder
- `styles/WidgetStub.css` - Empty stylesheet placeholder
- `types/WidgetTypes.ts` - Empty types placeholder

### What This Scaffold Provides

- ✅ Valid plan directory structure
- ✅ Proper frontmatter and metadata
- ✅ Documentation Contract compliance (100/100 potential)
- ✅ Antislop conformance
- ✅ Architectural invariant compatibility
- ✅ TypeScript type-check compatibility
- ❌ No actual widget functionality
- ❌ No new code, routes, or components
- ❌ No runtime or business logic