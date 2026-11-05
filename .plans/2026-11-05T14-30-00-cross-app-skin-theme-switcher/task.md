---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER"
version: "1.0.0"
owner: "engineering"
status: "proposed"
--

# Task: Implementation Breakdown for Cross-Application Skin Theme Switcher

## Implementation Phases

### Phase 1: Foundation & Infrastructure (Estimated: 2-3 days)
**Objective:** Establish the preference hook, storage layer, and TypeScript types.

**Deliverables:**
- [ ] Create `packages/ui/src/hooks/use-skin-preference.ts` — hook for reading/writing skin preference to localStorage
- [ ] Create `packages/ui/src/components/skin-selector.tsx` — SkinSelector component skeleton
- [ ] Define TypeScript types and interfaces for skin preference model
- [ ] Update `packages/ui/src/skins/registry.ts` — verify all 6 skin IDs are exported and typed
- [ ] Update `packages/ui/src/index.ts` — export new hook and component
- [ ] Write unit tests for `useSkinPreference` hook

**Dependencies:**
- `@moonwitness/ui` package structure
- Next.js 16 App Router compatibility
- localStorage browser API

**Verification:**
- `pnpm typecheck` passes for `@moonwitness/ui`
- Unit tests: 100% hook logic coverage
- No TypeScript errors

**Parallelizable Work:** None (sequential foundation)

---

### Phase 2: SkinSelector Component (Estimated: 3-4 days)
**Objective:** Build the reusable SkinSelector component with accessibility, responsive grid, and keyboard navigation.

**Deliverables:**
- [ ] Implement `SkinSelector` component in `packages/ui/src/components/skin-selector.tsx`
- [ ] Render all 6 skin options from `skinRegistry` with name + signature
- [ ] Implement responsive grid: 1 column (mobile ≤640px), 3 columns (tablet ≤1024px), 6 columns (desktop)
- [ ] Add keyboard navigation: Tab/Shift+Tab focus cycling, Enter/Space to select, Escape to close
- [ ] Add ARIA labels and roles: `role="dialog"`, `aria-label`, `aria-describedby`, focus-visible states
- [ ] Respect `prefers-reduced-motion` media query — grid becomes single column, reduce animations
- [ ] Handle open/close state with modal overlay, focus trap, and return focus on close
- [ ] Prop types: `appName`, `onSkinChange`, `initialSkin`, `visible`, `className`
- [ ] Storybook story for SkinSelector (optional, for documentation)

**Dependencies:**
- `@moonwitness/ui` skins registry
- Existing primitives (MotionFrame, StatePanel patterns)
- Accessibility guidelines (WCAG AA)

**Verification:**
- Manual testing: keyboard navigation through all 6 options
- axe-core accessibility scan: 0 violations
- Responsive breakpoints verified at mobile/tablet/desktop
- Reduced motion media query verified

**Parallelizable Work:** None (component development is sequential but can overlap with Phase 3 unit tests)

---

### Phase 3: SSR Integration & Application Integration (Estimated: 3-4 days)
**Objective:** Integrate skin preference hook with SkinRoot in each application, ensuring hydration compatibility.

**Deliverables:**
- [ ] Modify `apps/dock/src/app/layout.tsx` — integrate `useSkinPreference('dock')` with `SkinRoot`
- [ ] Modify `apps/headquarter/src/app/layout.tsx` — integrate `useSkinPreference('headquarter')` with `SkinRoot`
- [ ] Modify `apps/jizz/src/app/layout.tsx` — integrate `useSkinPreference('jizz')` with `SkinRoot`
- [ ] Ensure Next.js hydration compatibility: `SkinRoot` renders default skin on server, preferred skin on client
- [ ] Add SkinSelector UI to each app (header/navbar or optional placement)
- [ ] Test skin persistence: reload page, verify preferred skin persists
- [ ] Test default behavior: no preference → default skin renders (no visible change)
- [ ] Verify TypeScript strict mode across all 3 apps

**Dependencies:**
- `useSkinPreference` hook from `@moonwitness/ui`
- `SkinRoot` component from `@moonwitness/ui`
- `SkinSelector` component from `@moonwitness/ui`
- Next.js 16 App Router patterns

**Verification:**
- `pnpm typecheck` passes for dock, headquarter, jizz
- `pnpm dock:build` passes
- `pnpm headquarter:build` passes
- `pnpm jizz:build` passes
- No Next.js hydration warnings in production

**Parallelizable Work:** App integrations can be done in parallel across the 3 apps once the foundation is complete.

---

### Phase 4: Testing, Documentation, and Gates (Estimated: 2-3 days)
**Objective:** Comprehensive testing, documentation updates, and quality gate validation.

**Deliverables:**
- [ ] Write end-to-end tests for skin preference flow (preference → persist → reload → verify)
- [ ] Write unit tests for SkinSelector component interactions
- [ ] Write unit tests for useSkinPreference hook (happy path, error scenarios)
- [ ] Update `packages/ui` documentation with SkinSelector API
- [ ] Update app AGENTS.md files with skin preference integration notes
- [ ] Run full quality gate: `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`, `pnpm ui:test`
- [ ] Verify no new TODO/FIXME/HACK comments in code
- [ ] Measure bundle size impact (ensure < 2KB gzip)
- [ ] Document the skin preference pattern in `.plans/` report

**Dependencies:**
- All previous phases complete
- Test infrastructure available
- Documentation standards

**Verification:**
- `pnpm docs:check` — 100/100 passed
- `pnpm lint:arch` — 0 architectural violations
- `pnpm typecheck` — 0 TypeScript errors across all packages
- `pnpm ui:test` — design system component and skin contracts pass
- `pnpm ui:contrast` — WCAG ratios verified for all skin token pairs

**Parallelizable Work:** Documentation updates can happen alongside test execution.

---

## Ordered and Independently Executable Tasks

| Task ID | Task | Phase | Owner | Dependencies | Status |
|---------|------|-------|-------|--------------|--------|
| T-001 | Create use-skin-preference.ts hook | 1 | UI Team | None | pending |
| T-002 | Create SkinSelector component skeleton | 1 | UI Team | T-001 | pending |
| T-003 | Write unit tests for useSkinPreference hook | 1 | QA Team | T-001, T-002 | pending |
| T-004 | Implement full SkinSelector component (grid, keyboard, a11y) | 2 | UI Team | T-002 | pending |
| T-005 | Write unit tests for SkinSelector component | 2 | QA Team | T-004 | pending |
| T-006 | Integrate with apps/dock/src/app/layout.tsx | 3 | Dock Team | T-004 | pending |
| T-007 | Integrate with apps/headquarter/src/app/layout.tsx | 3 | Headquarter Team | T-004 | pending |
| T-008 | Integrate with apps/jizz/src/app/layout.tsx | 3 | Jizz Team | T-004 | pending |
| T-009 | Run and pass all quality gates | 4 | CI/CD | T-006, T-007, T-008 | pending |
| T-010 | Update documentation and reports | 4 | Docs Team | T-009 | pending |

## Dependencies and Execution Order

### Critical Path
```
T-001 → T-002 → T-004 → T-006/T-007/T-008 → T-009 → T-010
```

### Parallel Workstreams
- **Phase 1 & 2 overlap:** T-001 and T-002 can proceed concurrently (foundation vs component design)
- **Phase 3 parallel:** T-006, T-007, T-008 can run in parallel once T-004 is complete (3 app integrations)
- **Phase 4 parallel:** T-005 (tests), documentation, and quality gates can overlap

### Task Dependencies Blocking
- T-006, T-007, T-008 all require T-004 (SkinSelector component) to be complete
- T-009 requires all app integrations (T-006, T-007, T-008) to be complete
- T-010 requires T-009 (all gates passing) to be complete

### No-Blockers (Can Start Immediately)
- T-001: Hook foundation can start immediately (no dependencies)
- T-002: Component skeleton can start once hook interface is defined
- T-003: Unit tests for hook can start once hook implementation is visible

## Required Files and Affected Modules

### New Files
- `packages/ui/src/hooks/use-skin-preference.ts` — skin preference hook
- `packages/ui/src/components/skin-selector.tsx` — SkinSelector component

### Modified Files
- `packages/ui/src/index.ts` — export new hook and component
- `packages/ui/src/skins/registry.ts` — verify exports (may need minor updates)
- `apps/dock/src/app/layout.tsx` — integrate useSkinPreference + SkinSelector
- `apps/headquarter/src/app/layout.tsx` — integrate useSkinPreference + SkinSelector
- `apps/jizz/src/app/layout.tsx` — integrate useSkinPreference + SkinSelector

### Test Files (New)
- `packages/ui/src/hooks/__tests__/use-skin-preference.test.ts` — hook tests
- `packages/ui/src/components/__tests__/skin-selector.test.ts` — component tests

## Testing and Validation Procedures

### Unit Tests
- **useSkinPreference hook:**
  - ✅ Reads valid skin preference from localStorage
  - ✅ Returns undefined when localStorage unavailable
  - ✅ Writes new preference to localStorage on change
  - ✅ Handles QuotaExceededError gracefully
  - ✅ Handles corrupted/stored non-SkinId values
  - ✅ Key scoping: different appName → different preference

- **SkinSelector component:**
  - ✅ Renders all 6 skin options with correct names/signatures
  - ✅ Keyboard navigation: Tab cycles through, Enter/Space selects
  - ✅ Escape closes dialog and returns focus
  - ✅ ARIA labels present and descriptive
  - ✅ Focus-visible states meet WCAG
  - ✅ Reduced motion media query respected
  - ✅ onSkinChange callback fired on selection
  - ✅ responsive grid at 3 breakpoints

### Integration Tests
- **App-level:**
  - ✅ Each app renders default skin when no preference set
  - ✅ Preferred skin persists after selection and reload
  - ✅ SkinRoot SSR renders default (no hydration warning)
  - ✅ SkinSelector UI integrates without breaking existing layouts
  - ✅ Per-app preference scoping works independently

### End-to-End Tests
- [ ] User selects "lunar-chronicles" in headquarter app
- [ ] Preference stored in localStorage
- [ ] Page reload maintains lunar-chronicles skin
- [ ] User switches to "rocksoul" in dock app
- [ ] Dock preference does not affect headquarter (per-app scoping)
- [ ] Clearing localStorage resets to defaults in all apps
- [ ] Reduced motion preference reduces animations

### Validation Commands
```bash
# Type checking
pnpm typecheck

# Architecture lint
pnpm lint:arch

# Documentation check
pnpm docs:check

# UI tests (design system contracts)
pnpm ui:test

# UI contrast verification
pnpm ui:contrast

# App builds
pnpm dock:build
pnpm headquarter:build
pnpm jizz:build
```

## Documentation Requirements

### Updated Documentation
- [ ] This task.md (current file) — implementation breakdown
- [ ] `spec.md` — feature specification (already created)
- [ ] `design.md` — technical & UX design (already created)
- [ ] `rule.md` — implementation rules & agent guardrails (to be created)
- [ ] `packages/ui/src/components/skin-selector.tsx` — JSDoc documentation
- [ ] `packages/ui/src/hooks/use-skin-preference.ts` — JSDoc documentation
- [ ] App AGENTS.md files — update with skin preference integration notes
- [ ] `.plans/2026-11-05T14-30-00-cross-app-skin-theme-switcher/report.md` — on completion

### CHANGELOG Updates
- [ ] Record skin selector and preference hook additions
- [ ] Document breaking changes (none — additive feature only)
- [ ] Note new quality gate requirements

### Developer Notes
- [ ] Pattern guide for adding skin preference to future apps
- [ ] Debugging: how to inspect `localStorage.mw_skin_preference:{appName}`
- [ ] Error scenarios and recovery procedures

## Completion Checklist

### Minimum Viable Product (MVP) — Ready when:
- [ ] `use-skin-preference.ts` hook created and tested
- [ ] `skin-selector.tsx` component created with all 6 skins
- [ ] All 3 apps integrate skin preference without build errors
- [ ] `pnpm typecheck` passes across ui, dock, headquarter, jizz
- [ ] `pnpm lint:arch` passes with no new violations
- [ ] Skin preference persists across page reloads
- [ ] Default skin renders when no preference set

### Full Implementation — Ready when:
- [ ] All MVP criteria met
- [ ] `pnpm docs:check` passes (100/100)
- [ ] `pnpm ui:test` passes (design system contracts)
- [ ] `pnpm ui:contrast` passes (WCAG ratios for all skins)
- [ ] No hydration warnings in Next.js production builds
- [ ] Bundle size impact < 2KB gzip confirmed
- [ ] Accessibility audit: axe-core 0 violations
- [ ] Report.md completed in `.plans/2026-11-05T14-30-00-cross-app-skin-theme-switcher/`
- [ ] All TODO items resolved or documented as out-of-scope

### Extended Success — After completion:
- [ ] Feedback collected from actual users on skin selector usability
- [ ] Adoption metrics tracked (>15% target within 30 days)
- [ ] Plan for v2: shared skin preferences, A/B testing, theming surveys
- [ ] Documentation updated for future app onboarding