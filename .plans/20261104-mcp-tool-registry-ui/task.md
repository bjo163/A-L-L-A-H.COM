---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MCP-TOOL-REGISTRY-UI-TASKS"
version: "1.0.0"
owner: "engineering"
status: "pending"
last_verified: "2026-11-04"
---

# MCP Tool Registry & Execution UI — Implementation Tasks

## Phase 1: Foundation and Tool Registry Browser

### Task 1.1 — Audit Existing Tool Registry
**ID:** T-001  
**Dependencies:** None  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Inspect current state of MCP tool registry to understand what tools are registered and how they are documented.

**Subtasks:**
- [ ] Read `packages/arsy-plugin-llm-gateway/src/mcp/tools.ts` (or equivalent) to list registered tools
- [ ] Read `packages/sdk/src/mcp.ts` to confirm client methods
- [ ] Read `apps/headquarter/src/app/tools/page.tsx` to see current implementation
- [ ] Run `pnpm --filter @allah/sdk typecheck` to confirm SDK types
- [ ] Document findings in a comment on this task

**Acceptance Criteria:**
- List of all registered MCP tools with names and descriptions
- Confirmation that SDK methods work
- Screenshot or description of current `/tools` page

**Files to Read:**
- `packages/arsy-plugin-llm-gateway/src/mcp/tools.ts`
- `packages/sdk/src/mcp.ts`
- `apps/headquarter/src/app/tools/page.tsx`
- `packages/types/src/index.ts` (MCP types)

---

### Task 1.2 — Create ToolRegistryCard Component
**ID:** T-002  
**Dependencies:** T-001  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Create reusable card component for displaying tool information in the registry list.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolRegistryCard.tsx`
- [ ] Implement props: `tool: McpTool`, `onClick`, `lastExecutedAt?`, `executionCount?`
- [ ] Use `Card`, `Badge`, `Heading`, `Text` from `@moonwitness/ui`
- [ ] Support hover/active states
- [ ] Add TypeScript types
- [ ] Write unit tests
- [ ] Export from `packages/ui/src/components/index.ts`

**Acceptance Criteria:**
- Component renders tool name, description, parameter count
- Badge shows first tag or default
- Click handler works
- Keyboard accessible (Enter/Space to activate)
- Focus indicator visible
- Unit tests pass

**Files to Create:**
- `packages/ui/src/components/ToolRegistryCard.tsx`
- `packages/ui/src/components/ToolRegistryCard.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 1.3 — Create ToolDetailPanel Component
**ID:** T-003  
**Dependencies:** T-002  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Create panel component for displaying detailed tool schema documentation.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolDetailPanel.tsx`
- [ ] Implement props: `tool: McpTool`, `onExecute: () => void`
- [ ] Render tool name, description, tags
- [ ] Render parameter list with type, required, default, description
- [ ] Handle nested objects/arrays in schema
- [ ] Show example if available
- [ ] "Execute" button to transition to execution mode
- [ ] Export from components index

**Acceptance Criteria:**
- All JSON Schema types rendered correctly
- Required fields marked
- Default values shown
- Nested schemas expandable
- "Execute" button enabled

**Files to Create:**
- `packages/ui/src/components/ToolDetailPanel.tsx`
- `packages/ui/src/components/ToolDetailPanel.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 1.4 — Update Headquarter /tools Page
**ID:** T-004  
**Dependencies:** T-002, T-003  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Replace static tool list with dynamic registry browser using new components.

**Subtasks:**
- [ ] Read current `apps/headquarter/src/app/tools/page.tsx`
- [ ] Import `ToolRegistryCard`, `ToolDetailPanel` from `@moonwitness/ui`
- [ ] Import `mwClient` from `@allah/sdk`
- [ ] Fetch tools on mount with `mwClient.mcp.listTools()`
- [ ] Render loading/empty/error states with `StatePanel`
- [ ] Render tool grid with `ToolRegistryCard`
- [ ] Handle tool selection to show `ToolDetailPanel`
- [ ] Use `RouteShell`, `PageHero` blocks
- [ ] Apply `nexus-paradox` skin
- [ ] Test with `pnpm headquarter:dev`

**Acceptance Criteria:**
- Tool list loads from Arsy
- Loading state shown while fetching
- Empty state if no tools
- Error state if fetch fails
- Clicking tool shows detail panel
- Responsive layout (desktop/tablet/mobile)
- Keyboard navigation works

**Files to Modify:**
- `apps/headquarter/src/app/tools/page.tsx`

**Files to Create (if needed):**
- `apps/headquarter/src/app/tools/loading.tsx`
- `apps/headquarter/src/app/tools/error.tsx`
- `apps/headquarter/src/app/tools/not-found.tsx`

---

## Phase 2: Tool Execution Sandbox

### Task 2.1 — Create Parameter Form Field Component
**ID:** T-005  
**Dependencies:** T-003  
**Parallelizable:** Yes (with T-006)  
**Estimated Effort:** 2 sessions  

**Description:**
Create dynamic form field component that renders appropriate input based on JSON Schema type.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolParameterField.tsx`
- [ ] Implement props: `name`, `schema: JsonSchemaProperty`, `value`, `onChange`, `error`, `required`
- [ ] Support types: `string`, `number`, `integer`, `boolean`
- [ ] Support `enum` as dropdown
- [ ] Support `pattern` validation (regex)
- [ ] Support `minimum`/`maximum` for numbers
- [ ] Show description as help text
- [ ] Show error inline
- [ ] Export from components index

**Acceptance Criteria:**
- All primitive types render correct input
- Validation works (required, min/max, pattern)
- Error shown inline
- Help text visible
- Keyboard accessible

**Files to Create:**
- `packages/ui/src/components/ToolParameterField.tsx`
- `packages/ui/src/components/ToolParameterField.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 2.2 — Create Nested Object/Array Field Components
**ID:** T-006  
**Dependencies:** T-005  
**Parallelizable:** No  
**Estimated Effort:** 2 sessions  

**Description:**
Extend form support to nested objects and arrays with add/remove/reorder.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolObjectField.tsx`
- [ ] Create `packages/ui/src/components/ToolArrayField.tsx`
- [ ] Object: render nested fields recursively
- [ ] Array: render list of fields with add/remove buttons
- [ ] Array: support drag-and-drop reorder (optional, nice-to-have)
- [ ] Handle validation for nested structures
- [ ] Export from components index

**Acceptance Criteria:**
- Nested objects render correctly
- Arrays support add/remove items
- Validation propagates to parent
- No infinite recursion on circular refs (shouldn't exist in MCP schemas)

**Files to Create:**
- `packages/ui/src/components/ToolObjectField.tsx`
- `packages/ui/src/components/ToolArrayField.tsx`
- `packages/ui/src/components/ToolObjectField.test.tsx`
- `packages/ui/src/components/ToolArrayField.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 2.3 — Create ToolExecutionForm Component
**ID:** T-007  
**Dependencies:** T-005, T-006  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Create complete execution form that orchestrates parameter fields and submission.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolExecutionForm.tsx`
- [ ] Implement props: `tool: McpTool`, `onSubmit`, `isLoading`
- [ ] Manage form state (values, errors)
- [ ] Validate all fields on submit
- [ ] Disable submit button while loading or invalid
- [ ] Show validation errors inline
- [ ] Export from components index

**Acceptance Criteria:**
- Form generated from tool schema
- All field types supported
- Validation works
- Submit disabled when invalid
- Loading state shown
- Unit tests pass

**Files to Create:**
- `packages/ui/src/components/ToolExecutionForm.tsx`
- `packages/ui/src/components/ToolExecutionForm.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 2.4 — Create ToolResultViewer Component
**ID:** T-008  
**Dependencies:** T-007  
**Parallelizable:** Yes (with T-009)  
**Estimated Effort:** 1 session  

**Description:**
Create component for displaying tool execution results with pretty-printing.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolResultViewer.tsx`
- [ ] Implement props: `result: any`, `metadata: { duration_ms, timestamp, user_id }`
- [ ] Render JSON with syntax highlighting
- [ ] Support expand/collapse nested objects
- [ ] Show execution metadata
- [ ] Add copy-to-clipboard button
- [ ] Add download-as-JSON button
- [ ] Handle large results (virtualization or truncation)
- [ ] Export from components index

**Acceptance Criteria:**
- JSON pretty-printed with colors
- Expand/collapse works
- Metadata shown
- Copy button works
- Download button works
- Large results handled gracefully

**Files to Create:**
- `packages/ui/src/components/ToolResultViewer.tsx`
- `packages/ui/src/components/ToolResultViewer.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 2.5 — Integrate Execution Flow in /tools Page
**ID:** T-009  
**Dependencies:** T-007, T-008  
**Parallelizable:** No  
**Estimated Effort:** 2 sessions  

**Description:**
Add execution capability to the tools page with loading, result, and error states.

**Subtasks:**
- [ ] Update `apps/headquarter/src/app/tools/page.tsx`
- [ ] Add "Execute" mode to `ToolDetailPanel`
- [ ] Call `mwClient.mcp.callTool()` on submit
- [ ] Show loading state with `StatePanel`
- [ ] Show result with `ToolResultViewer`
- [ ] Handle errors (validation, network, tool error)
- [ ] Add retry button for transient errors
- [ ] Test with real tool execution

**Acceptance Criteria:**
- Clicking "Execute" opens form
- Submitting form calls API
- Loading state shown
- Result displayed or error shown
- Retry works for network errors
- Audit event created (verify in database)

**Files to Modify:**
- `apps/headquarter/src/app/tools/page.tsx`

---

## Phase 3: Audit Log Viewer

### Task 3.1 — Create ToolAuditLogTable Component
**ID:** T-010  
**Dependencies:** T-004  
**Parallelizable:** Yes (with T-012)  
**Estimated Effort:** 2 sessions  

**Description:**
Create table component for displaying tool execution audit log.

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolAuditLogTable.tsx`
- [ ] Implement props: `records: ToolExecutionRecord[]`, `onRowClick`
- [ ] Use `Table` from `@moonwitness/ui`
- [ ] Columns: timestamp, user, tool, status, duration, actions
- [ ] Format timestamp with `formatDistanceToNow`
- [ ] Show status badge (success/failure)
- [ ] Click row to view details
- [ ] Support pagination
- [ ] Virtualize for large datasets (optional)
- [ ] Export from components index

**Acceptance Criteria:**
- Table renders with all columns
- Timestamps formatted correctly
- Status badges colored (green/red)
- Row click works
- Pagination works
- Keyboard navigation works

**Files to Create:**
- `packages/ui/src/components/ToolAuditLogTable.tsx`
- `packages/ui/src/components/ToolAuditLogTable.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 3.2 — Create ToolAuditLogFilters Component
**ID:** T-011  
**Dependencies:** T-010  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Create filter controls for audit log (date range, user, tool, status).

**Subtasks:**
- [ ] Create `packages/ui/src/components/ToolAuditLogFilters.tsx`
- [ ] Implement props: `filters`, `onFilterChange`, `tools: McpTool[]`
- [ ] Date range picker (from/to)
- [ ] User filter (text input or dropdown if user list available)
- [ ] Tool filter (dropdown from tools list)
- [ ] Status filter (dropdown: all/success/failure)
- [ ] Clear filters button
- [ ] Export from components index

**Acceptance Criteria:**
- All filters work
- Filters combine correctly
- Clear button resets all
- Formatted for accessibility

**Files to Create:**
- `packages/ui/src/components/ToolAuditLogFilters.tsx`
- `packages/ui/src/components/ToolAuditLogFilters.test.tsx`

**Files to Modify:**
- `packages/ui/src/components/index.ts`

---

### Task 3.3 — Create Audit Log Tab in /tools Page
**ID:** T-012  
**Dependencies:** T-010, T-011  
**Parallelizable:** No  
**Estimated Effort:** 2 sessions  

**Description:**
Add "Audit Log" tab to tools page with filtering and export.

**Subtasks:**
- [ ] Update `apps/headquarter/src/app/tools/page.tsx`
- [ ] Add tabs: "Browse Tools" | "Audit Log"
- [ ] Fetch audit log with `mwClient.mcp.getAuditLog()`
- [ ] Apply filters from `ToolAuditLogFilters`
- [ ] Render table with `ToolAuditLogTable`
- [ ] Add export to CSV button
- [ ] Add export to JSON button
- [ ] Handle loading/empty/error states
- [ ] Test with real audit data

**Acceptance Criteria:**
- Tab navigation works
- Audit log loads
- Filters apply correctly
- Export CSV works
- Export JSON works
- Pagination works
- Row click shows details

**Files to Modify:**
- `apps/headquarter/src/app/tools/page.tsx`

---

### Task 3.4 — Implement Tenant Isolation for Audit Log
**ID:** T-013  
**Dependencies:** T-012  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Ensure audit log respects tenant isolation (users see only their tenant's logs).

**Subtasks:**
- [ ] Verify SDK `getAuditLog()` uses authenticated session
- [ ] Verify Arsy endpoint filters by `company_id` from principal
- [ ] Test with two different tenant accounts
- [ ] Document tenant isolation behavior
- [ ] Add superuser admin route note (future enhancement)

**Acceptance Criteria:**
- User A cannot see User B's audit logs (different tenants)
- Same tenant users see shared logs
- Documented behavior matches implementation

**Files to Verify:**
- `packages/sdk/src/mcp.ts` (getAuditLog implementation)
- `apps/arsy/src/routes/mcp.ts` (or equivalent endpoint)

---

## Phase 4: Polish, Accessibility, and Testing

### Task 4.1 — Accessibility Audit and Fixes
**ID:** T-014  
**Dependencies:** T-009, T-012  
**Parallelizable:** Yes (with T-015)  
**Estimated Effort:** 1 session  

**Description:**
Perform WCAG AA accessibility audit and fix any issues.

**Subtasks:**
- [ ] Run axe-core on `/tools` page
- [ ] Test keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Verify focus indicators visible
- [ ] Check color contrast ratios (≥ 4.5:1 normal, ≥ 3:1 large)
- [ ] Verify screen reader labels present
- [ ] Test with NVDA or VoiceOver (if available)
- [ ] Fix all identified issues
- [ ] Document accessibility compliance

**Acceptance Criteria:**
- axe-core: 0 violations
- Keyboard navigation works end-to-end
- Focus indicators visible on all interactive elements
- Color contrast passes WCAG AA
- Screen reader can navigate page

**Tools:**
- `pnpm add -D axe-core @axe-core/react` (if not already present)
- Chrome DevTools Lighthouse Accessibility audit

---

### Task 4.2 — Responsive Design Testing
**ID:** T-015  
**Dependencies:** T-009, T-012  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Test and fix responsive layout for desktop, tablet, and mobile.

**Subtasks:**
- [ ] Test desktop (≥1280px): full grid with sidebar
- [ ] Test tablet (768–1279px): stacked layout
- [ ] Test mobile (<768px): single column
- [ ] Fix layout issues with CSS
- [ ] Test touch targets on mobile (≥44px)
- [ ] Verify all states on all breakpoints

**Acceptance Criteria:**
- Layout works on all screen sizes
- No horizontal scroll
- Touch targets adequate on mobile
- All states tested (loading/empty/error/success)

**Tools:**
- Chrome DevTools responsive design mode
- Real device testing (if available)

---

### Task 4.3 — Write Unit Tests
**ID:** T-016  
**Dependencies:** T-002, T-003, T-005, T-006, T-007, T-008, T-010, T-011  
**Parallelizable:** Yes  
**Estimated Effort:** 2 sessions  

**Description:**
Write comprehensive unit tests for all new UI components.

**Subtasks:**
- [ ] `ToolRegistryCard.test.tsx`
- [ ] `ToolDetailPanel.test.tsx`
- [ ] `ToolParameterField.test.tsx`
- [ ] `ToolObjectField.test.tsx`
- [ ] `ToolArrayField.test.tsx`
- [ ] `ToolExecutionForm.test.tsx`
- [ ] `ToolResultViewer.test.tsx`
- [ ] `ToolAuditLogTable.test.tsx`
- [ ] `ToolAuditLogFilters.test.tsx`
- [ ] Run `pnpm ui:test` and fix failures

**Acceptance Criteria:**
- All components have tests
- Tests cover happy path and edge cases
- Test suite passes
- Coverage meets project standard

**Files to Create:**
- `packages/ui/src/components/*.test.tsx` (one per component)

---

### Task 4.4 — Write Integration Tests
**ID:** T-017  
**Dependencies:** T-009, T-012  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Write integration tests for the full tool registry flow.

**Subtasks:**
- [ ] Create `apps/headquarter/tests/tool-registry.test.ts`
- [ ] Test tool list loading
- [ ] Test tool execution flow
- [ ] Test audit log filtering
- [ ] Test error handling
- [ ] Mock SDK methods
- [ ] Run tests with `pnpm headquarter:test`

**Acceptance Criteria:**
- Integration tests pass
- Mocks accurately represent SDK behavior
- Edge cases covered

**Files to Create:**
- `apps/headquarter/tests/tool-registry.test.ts`

---

### Task 4.5 — Performance Optimization
**ID:** T-018  
**Dependencies:** T-009, T-012  
**Parallelizable:** Yes (with T-019)  
**Estimated Effort:** 1 session  

**Description:**
Optimize performance for large tool lists and audit logs.

**Subtasks:**
- [ ] Profile initial page load (target < 500ms)
- [ ] Implement virtualization for audit log table (if >100 rows)
- [ ] Add caching for tool list (stale-while-revalidate)
- [ ] Debounce search input (300ms)
- [ ] Lazy load tool details
- [ ] Measure and document performance

**Acceptance Criteria:**
- Initial load < 500ms
- Audit log scrolls smoothly with 1000+ rows
- Search doesn't lag
- Lighthouse performance score ≥ 90

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse

---

### Task 4.6 — Documentation
**ID:** T-019  
**Dependencies:** T-009, T-012  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Update documentation for the new feature.

**Subtasks:**
- [ ] Update `apps/headquarter/README.md` with /tools page documentation
- [ ] Add component documentation in JSDoc comments
- [ ] Update `CHANGELOG.md` with feature addition
- [ ] Add usage examples in component stories (if Storybook used)
- [ ] Document security considerations
- [ ] Document accessibility features

**Acceptance Criteria:**
- README updated with feature description
- All components have JSDoc comments
- CHANGELOG entry added
- Security considerations documented

**Files to Modify:**
- `apps/headquarter/README.md`
- `CHANGELOG.md`
- Component files (JSDoc)

---

## Phase 5: Verification and Quality Gates

### Task 5.1 — Run All Quality Gates
**ID:** T-020  
**Dependencies:** All previous tasks  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Run all project quality gates and fix any failures.

**Subtasks:**
- [ ] `pnpm headquarter:build` — must pass
- [ ] `pnpm --filter @moonwitness/ui typecheck` — must pass
- [ ] `pnpm lint:arch` — must pass (UI_PURITY, PALETTE_PURITY)
- [ ] `pnpm docs:check` — must pass (100/100)
- [ ] `pnpm ui:test` — must pass
- [ ] `pnpm headquarter:test` — must pass
- [ ] Fix all errors

**Acceptance Criteria:**
- All quality gates pass
- No TypeScript errors
- No lint errors
- No documentation errors
- All tests pass

---

### Task 5.2 — Manual Testing in Browser
**ID:** T-021  
**Dependencies:** T-020  
**Parallelizable:** No  
**Estimated Effort:** 1 session  

**Description:**
Perform comprehensive manual testing in real browser.

**Subtasks:**
- [ ] Start dev server: `pnpm dev`
- [ ] Navigate to `/tools`
- [ ] Test tool list loading
- [ ] Test tool detail view
- [ ] Test tool execution (multiple tools)
- [ ] Test error scenarios (network error, validation error, tool error)
- [ ] Test audit log filtering
- [ ] Test export functionality
- [ ] Test keyboard navigation
- [ ] Test responsive layout
- [ ] Test accessibility with screen reader
- [ ] Document test results

**Acceptance Criteria:**
- All features work in browser
- No console errors
- No visual glitches
- Accessibility works
- Responsive layout works

**Evidence:**
- Screenshots of each state
- Console output (no errors)
- Test checklist with results

---

### Task 5.3 — Security Audit
**ID:** T-022  
**Dependencies:** T-020  
**Parallelizable:** Yes (with T-021)  
**Estimated Effort:** 1 session  

**Description:**
Perform security audit of the implementation.

**Subtasks:**
- [ ] Verify authentication required on all routes
- [ ] Verify tenant isolation in audit log
- [ ] Verify SSRF guard on network tools
- [ ] Verify parameter validation (client and server)
- [ ] Verify rate limiting
- [ ] Verify audit events created for all executions
- [ ] Check for XSS vulnerabilities in result rendering
- [ ] Document security audit results

**Acceptance Criteria:**
- All security guards verified
- No vulnerabilities found
- Audit events working
- Documented security compliance

---

### Task 5.4 — Update BACKLOG.md
**ID:** T-023  
**Dependencies:** T-021, T-022  
**Parallelizable:** No  
**Estimated Effort:** 30 minutes  

**Description:**
Update BACKLOG.md to mark feature as IMPLEMENTED and then VERIFIED.

**Subtasks:**
- [ ] Add entry to `BACKLOG.md` with status `IMPLEMENTED`
- [ ] After manual testing, update to `VERIFIED`
- [ ] Include acceptance criteria evidence
- [ ] Link to plan directory

**Acceptance Criteria:**
- BACKLOG.md updated
- Status accurate
- Evidence documented

**Files to Modify:**
- `BACKLOG.md`

---

## Dependencies Summary

| Task | Depends On | Parallelizable |
|------|------------|----------------|
| T-001 | None | No |
| T-002 | T-001 | No |
| T-003 | T-002 | No |
| T-004 | T-002, T-003 | No |
| T-005 | T-003 | Yes |
| T-006 | T-005 | No |
| T-007 | T-005, T-006 | No |
| T-008 | T-007 | Yes |
| T-009 | T-007, T-008 | No |
| T-010 | T-004 | Yes |
| T-011 | T-010 | No |
| T-012 | T-010, T-011 | No |
| T-013 | T-012 | No |
| T-014 | T-009, T-012 | Yes |
| T-015 | T-009, T-012 | No |
| T-016 | T-002..T-011 | Yes |
| T-017 | T-009, T-012 | No |
| T-018 | T-009, T-012 | Yes |
| T-019 | T-009, T-012 | No |
| T-020 | All | No |
| T-021 | T-020 | No |
| T-022 | T-020 | Yes |
| T-023 | T-021, T-022 | No |

## Critical Path

```
T-001 → T-002 → T-003 → T-004 → T-010 → T-011 → T-012 → T-013 → T-020 → T-021 → T-023
                ↓
              T-005 → T-006 → T-007 → T-008 → T-009 ↗
```

**Total Estimated Sessions:** 28 sessions (assuming 1 session ≈ 2-4 hours)

**Parallelization Opportunities:**
- T-005 can run parallel with T-004 (after T-003)
- T-008 can run parallel with T-009 (after T-007)
- T-010 can run parallel with T-009 (after T-004)
- T-014, T-016, T-018 can run parallel
- T-022 can run parallel with T-021

---

**Cross-References:**
- Related: [spec.md](./spec.md) — Acceptance criteria
- Related: [design.md](./design.md) — Technical architecture
- Related: [rule.md](./rule.md) — Implementation rules