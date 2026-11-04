---
title: "NEW-PLATFORM-CAPABILITY-1: Basic Platform Capability Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Design

## Scaffold Design

This plan creates a minimal capability scaffold serving as a template for future platform capabilities. The design follows the project's existing plan structure conventions.

### Directory Structure Design

```
.capabilities/
  capability-1/
    spec.md      ← Objective, scope, deliverables
    task.md      ← Concrete tasks with acceptance criteria
    design.md    ← This file: scaffold architecture
    rules.md     ← Rules for capability creation
    report.md    ← Generated on completion (only when real code exists)
```

### Design Principles

1. **Template-first approach**: The scaffold is a template, not a functional capability
2. **No false claims**: Must not be marked VERIFIED without actual product code
3. **Follow conventions**: Plan structure must match existing `.plans/*/spec.md` format
4. **Evolve-loop-guard compatible**: Designed to prevent the anti-pattern of falsely VERIFIED capabilities
5. **Minimal by design**: Only contains structure, no runtime or business logic

### File Conventions

- All plan files use frontmatter: `title`, `status`, `version`, `target_repo`, `target_branch`, `created`
- `spec.md` always contains: Objective, Scope, Deliverables, Acceptance Criteria, Constraints, Related
- `task.md` uses checklist format: `- [ ] task` or `- [x]` completed
- `design.md` documents the architecture/structure being created
- `rules.md` contains prescriptive rules for future capability creation

### What This Scaffold Provides

- ✅ Valid plan directory structure
- ✅ Proper frontmatter and metadata
- ✅ Documentation Contract compliance (100/100 potential)
- ✅ Antislop conformance
- ✅ Architectural invariant compatibility
- ✅ TypeScript type-check compatibility
- ❌ No actual capability functionality
- ❌ No new code, routes, or components