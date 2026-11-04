---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MCP-TOOL-REGISTRY-UI"
version: "1.0.0"
owner: "product-engineering"
status: "proposed"
last_verified: "2026-11-04"
---

# MCP Tool Registry & Execution UI — Feature Specification

## 1. Overview and Vision

### 1.1 Vision
The Model Context Protocol (MCP) provides a standardized way to expose tools to AI agents and users. While Arsy already registers MCP tools and the SDK provides client methods, there is no visual interface for humans to discover, understand, execute, and audit tool usage.

This feature transforms Headquarter's `/tools` page from a static list into a complete **Tool Registry and Execution Sandbox** — a command-center interface where operators can:
- Browse available MCP tools with full schema documentation
- Execute tools interactively with validated parameter forms
- Inspect results with structured visualization
- Review audit trails of all tool executions
- Monitor tool health and usage patterns

### 1.2 Problem Statement
**Current State:**
- Headquarter's `/tools` page lists tool names but provides no execution capability
- SDK methods (`mcp.listTools`, `mcp.callTool`, `mcp.getAuditLog`) exist but have no UI consumer
- Tool schemas are defined in TypeScript but not rendered for human understanding
- Tool execution audit logs exist in PGlite but are not visible to operators
- No sandbox environment exists for safe tool experimentation

**Impact:**
- Operators cannot verify tool behavior without writing code
- Tool discovery is limited to reading source code or API documentation
- Audit compliance requires direct database access
- Tool debugging and testing requires manual SDK calls

### 1.3 Objectives
| Objective | Success Metric |
|-----------|----------------|
| **Discoverability** | Every registered MCP tool is visible with name, description, input schema, and example |
| **Executability** | Any tool can be executed via form UI with parameter validation and error handling |
| **Transparency** | Every execution produces an audit event visible in the UI with user, timestamp, args, result, duration |
| **Safety** | SSRF guard, tenant isolation, and parameter validation prevent malicious or accidental harm |
| **Usability** | WCAG AA accessibility, keyboard navigation, responsive layout, honest states (loading/empty/error) |

## 2. Functional Requirements

### FR-001 — Tool Registry Browser
- Display all registered MCP tools in a searchable, filterable grid
- Each tool card shows: name, description, category/tags, parameter count, last executed timestamp
- Clicking a tool opens detailed view with full schema documentation
- Support search by name, description, parameter name
- Support filter by category (e.g., `database`, `storage`, `ai`, `network`)

### FR-002 — Tool Schema Documentation
- Render JSON Schema parameters as human-readable form fields
- Show parameter type, required/optional, default value, description, constraints (min/max, pattern, enum)
- Display example input/output when available
- Show tool source (e.g., `@allah/arsy-plugin-llm-gateway`, MCP server name)

### FR-003 — Tool Execution Sandbox
- Form-based parameter input with real-time validation
- Support all JSON Schema types: `string`, `number`, `integer`, `boolean`, `object`, `array`, `enum`
- Support nested objects and arrays with add/remove/reorder
- Submit button disabled until all required parameters are valid
- Show execution progress (pending → executing → success/error)
- Display result with syntax-highlighted JSON viewer
- Support streaming results for long-running tools

### FR-004 — Result Visualization
- Pretty-print JSON results with expand/collapse
- Detect and format common result types (tables, lists, key-value pairs)
- Show execution metadata: duration, tool name, timestamp, user
- Provide copy-to-clipboard and download-as-JSON actions
- Handle large results with virtualization or pagination

### FR-005 — Error Handling
- Display error messages with stack trace (dev mode) or user-friendly message (prod)
- Distinguish: validation errors, network errors, tool execution errors, timeout errors
- Provide retry button with same parameters
- Log errors to audit trail with failure reason

### FR-006 — Audit Log Viewer
- Table view of all tool executions with columns: timestamp, user, tool name, status, duration, actions
- Filter by: date range, user, tool name, status (success/failure)
- Click row to view full execution details (input args, output result, error if any)
- Support export to CSV/JSON
- Show aggregate statistics: total executions, success rate, avg duration, most-used tools

### FR-007 — Tenant Isolation
- Users only see audit logs for their own tenant (company_id)
- Superusers can view cross-tenant logs via explicit admin route with reason
- Tool execution always uses principal-derived tenant, never body-supplied

### FR-008 — Security Guards
- SSRF validation on any network-call tools (validate URL before request, check resolved IP)
- Parameter sanitization (strip scripts, prevent XSS in string inputs)
- Rate limiting per user (configurable per tool)
- Audit every execution attempt (success or failure)

## 3. Non-Functional Requirements

### NFR-001 — Performance
- Initial tool list loads in < 500ms
- Tool execution response time depends on tool, but UI remains responsive
- Audit log pagination supports 1000+ rows without lag
- Virtualized lists for large result sets

### NFR-002 — Accessibility
- WCAG AA compliance for all interactive elements
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Visible focus indicators
- Screen reader labels for all inputs and buttons
- Color contrast ratios ≥ 4.5:1 (normal text), ≥ 3:1 (large text)

### NFR-003 — Responsive Design
- Desktop (≥1280px): full grid with sidebar
- Tablet (768–1279px): stacked layout, collapsible sidebar
- Mobile (<768px): single column, simplified execution view

### NFR-004 — Observability
- Every tool execution logs: user ID, tenant ID, tool name, args (redacted if sensitive), result size, duration, status
- Audit events stored in `arsy.audit.event` with operation `mcp_tool_call`
- Telemetry: count executions per tool, avg duration, error rate

### NFR-005 — Security
- Fail-closed: unauthenticated requests redirected to login
- Tenant derived from principal, never from request body
- SSRF guard on network tools: validate URL, check resolved IP against private ranges
- Parameter validation on client and server
- No raw SQL execution exposed via MCP surface

### NFR-006 — Maintainability
- All components use `@moonwitness/ui` primitives and blocks
- Strong TypeScript typing with `@moonwitness/types`
- Unit tests for form validation, result rendering, audit filtering
- Integration tests for tool execution flow

## 4. Scope and Out-of-Scope

### In Scope
- Headquarter `/tools` page redesign and implementation
- New UI components in `packages/ui/src/components/`
- SDK method usage (no changes to SDK interface)
- Arsy MCP endpoint usage (no changes to backend)
- Audit log viewer and filtering
- Tool execution sandbox with form validation

### Out of Scope
- Creating new MCP tools (this is a consumer feature)
- Modifying MCP protocol or SDK interface
- Real-time collaboration (multiple users executing same tool)
- Tool versioning or rollback
- Scheduled/automated tool execution
- Tool sharing or favorites
- Custom tool parameter presets

## 5. User Stories

### US-001 — Operator Discovers Tool
**As** an operator,  
**I want** to browse and search available MCP tools,  
**So that** I can understand what capabilities are available without reading source code.

**Acceptance Criteria:**
- Tool list shows name, description, parameter count for each tool
- Search filters tools by name/description in real time
- Clicking a tool shows full schema with parameter details

### US-002 — Operator Executes Tool
**As** an operator,  
**I want** to fill a form and execute a tool,  
**So that** I can test tool behavior and see results without writing code.

**Acceptance Criteria:**
- Form fields match JSON Schema types and constraints
- Submit button disabled until required fields are valid
- Execution shows loading state, then result or error
- Result is pretty-printed with copy/download actions

### US-003 — Operator Reviews Audit Trail
**As** an operator,  
**I want** to see history of tool executions,  
**So that** I can verify what was done and by whom.

**Acceptance Criteria:**
- Audit log shows timestamp, user, tool, status, duration
- Filter by date range, user, tool name, status
- Click row to see full input/output details
- Export to CSV/JSON available

### US-004 — Superuser Reviews Cross-Tenant Executions
**As** a superuser,  
**I want** to view tool executions across tenants,  
**So that** I can audit tool usage ecosystem-wide.

**Acceptance Criteria:**
- Explicit admin route `/tools/admin/audit` requires reason
- Audit events show target tenant ID
- Same filtering and export capabilities as tenant-scoped log

## 6. Dependencies and Constraints

### Dependencies
| Dependency | Type | Status |
|------------|------|--------|
| `packages/arsy-plugin-llm-gateway` MCP tool registry | Backend | VERIFIED |
| `packages/sdk` MCP client methods | Client | VERIFIED |
| `apps/arsy` `/v1/mcp/message` endpoint | Backend | VERIFIED |
| `apps/arsy` audit event system | Backend | VERIFIED |
| `packages/ui` component library | Client | VERIFIED |
| `packages/types` MCP type contracts | Shared | VERIFIED |

### Constraints
- Must use existing MCP protocol (no protocol changes)
- Must use `@moonwitness/ui` for all interactive controls
- Must use `@allah/sdk` for all client-server communication
- Must respect tenant isolation and fail-closed auth
- Must produce audit events for every execution
- Must support all six Moon UI skins

## 7. Acceptance Criteria

### AC-001 — Tool Registry Browser
- [ ] Tool list renders all registered MCP tools
- [ ] Search filters tools by name/description
- [ ] Tool card shows name, description, parameter count
- [ ] Clicking tool opens detail view with schema

### AC-002 — Tool Execution Form
- [ ] Form fields generated from JSON Schema
- [ ] Validation errors shown inline
- [ ] Submit disabled until valid
- [ ] All JSON Schema types supported (string, number, boolean, object, array, enum)

### AC-003 — Result Visualization
- [ ] JSON result pretty-printed with expand/collapse
- [ ] Copy-to-clipboard works
- [ ] Download-as-JSON works
- [ ] Execution metadata shown (duration, timestamp, user)

### AC-004 — Error Handling
- [ ] Validation errors prevent submission
- [ ] Network errors show retry option
- [ ] Tool errors show error message
- [ ] Timeout errors show timeout message

### AC-005 — Audit Log
- [ ] Table shows timestamp, user, tool, status, duration
- [ ] Filter by date range works
- [ ] Filter by user works
- [ ] Filter by tool works
- [ ] Filter by status works
- [ ] Click row shows full details
- [ ] Export to CSV works
- [ ] Export to JSON works

### AC-006 — Security
- [ ] Unauthenticated users redirected to login
- [ ] Tenant derived from principal
- [ ] SSRF guard prevents private IP access
- [ ] Rate limiting enforced
- [ ] Audit event created for every execution

### AC-007 — Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader labels present
- [ ] Color contrast ≥ 4.5:1

### AC-008 — Responsive Design
- [ ] Desktop layout (≥1280px)
- [ ] Tablet layout (768–1279px)
- [ ] Mobile layout (<768px)
- [ ] All states tested (loading, empty, error, success)

### AC-009 — Quality Gates
- [ ] `pnpm headquarter:build` passes
- [ ] `pnpm --filter @moonwitness/ui typecheck` passes
- [ ] `pnpm lint:arch` passes (UI_PURITY, PALETTE_PURITY)
- [ ] `pnpm docs:check` passes
- [ ] Unit tests pass
- [ ] Integration tests pass

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tool discoverability | 100% of MCP tools visible | Manual audit of tool list vs registry |
| Execution success rate | ≥ 95% | Audit log success/total ratio |
| Form validation accuracy | 100% of invalid inputs caught | Unit test coverage |
| Accessibility | WCAG AA compliance | axe-core audit, manual keyboard test |
| Performance | < 500ms initial load | Chrome DevTools Lighthouse |
| User satisfaction | ≥ 4/5 rating | Post-launch survey (future) |

## 9. Open Questions

| Question | Impact | Resolution Needed By |
|----------|--------|---------------------|
| Should tool execution support dry-run mode? | UX complexity | Before implementation |
| Should audit logs include redacted args for sensitive tools? | Privacy vs auditability | Before backend changes |
| Should streaming results be supported for long-running tools? | UI complexity | Phase 2 consideration |

---

**Cross-References:**
- Related: [BLUEPRINT.md](../../BLUEPRINT.md) — Headquarter role as Command Center
- Related: [DECISIONS.md](../../DECISIONS.md) D-015 — Default-Deny Trust Boundary
- Related: [DESIGN.md](../../DESIGN.md) — Moon UI principles
- Related: [QUALITY.md](../../QUALITY.md) — Definition of Done
- Related: `packages/arsy-plugin-llm-gateway` — MCP tool registration
- Related: `packages/sdk` — MCP client methods