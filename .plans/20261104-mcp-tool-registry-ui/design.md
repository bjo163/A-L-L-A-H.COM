---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MCP-TOOL-REGISTRY-UI-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-04"
---

# MCP Tool Registry & Execution UI — Technical Design

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     apps/headquarter                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /tools page (ToolRegistryPage)                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ ToolList    │  │ ToolDetail   │  │ ToolExecution   │  │  │
│  │  │ Component   │  │ Component    │  │ Sandbox         │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              ToolAuditLogViewer                     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ↓ uses @allah/sdk                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ↓ HTTP (tenant-scoped, authenticated)
┌─────────────────────────────────────────────────────────────────┐
│                        apps/arsy                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /v1/mcp/message endpoint                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  MCP Router (packages/arsy-plugin-llm-gateway)      │  │  │
│  │  │  • list_tools                                       │  │  │
│  │  │  • call_tool                                        │  │  │
│  │  │  • get_audit_log                                    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                  │  │
│  │                          ↓ writes                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  arsy.audit.event (PGlite)                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Component and Module Structure

### 2.1 Headquarter Page Components

**File: `apps/headquarter/src/app/tools/page.tsx`**

```typescript
// Current: static list
// New: dynamic registry with tabs

export default function ToolRegistryPage() {
  return (
    <RouteShell skin="nexus-paradox">
      <PageHero kicker="Command Center" title="Tool Registry" />
      <ToolRegistryTabs>
        <ToolListTab />      {/* FR-001 */}
        <ToolAuditTab />     {/* FR-006 */}
      </ToolRegistryTabs>
    </RouteShell>
  );
}
```

**New Components in `packages/ui/src/components/`:**

| Component | File | Responsibility |
|-----------|------|----------------|
| `ToolRegistryCard` | `ToolRegistryCard.tsx` | Tool list item with name, description, param count |
| `ToolDetailPanel` | `ToolDetailPanel.tsx` | Schema documentation viewer |
| `ToolExecutionForm` | `ToolExecutionForm.tsx` | Dynamic form from JSON Schema |
| `ToolResultViewer` | `ToolResultViewer.tsx` | Pretty-print JSON result |
| `ToolAuditLogTable` | `ToolAuditLogTable.tsx` | Audit log with filters |
| `ToolAuditLogFilters` | `ToolAuditLogFilters.tsx` | Date/user/tool/status filters |

### 2.2 SDK Usage

**File: `packages/sdk/src/mcp.ts` (existing, no changes)**

```typescript
export interface McpClient {
  listTools(): Promise<McpToolsListResult>;
  callTool(input: McpToolCallRequest): Promise<McpToolCallResult>;
  getAuditLog(params: GetAuditLogParams): Promise<ToolExecutionRecord[]>;
}
```

**Usage in Headquarter:**

```typescript
import { mwClient } from '@allah/sdk';

// List all tools
const tools = await mwClient.mcp.listTools();

// Execute tool
const result = await mwClient.mcp.callTool({
  name: 'pglite_query',
  arguments: { query: 'SELECT 1' }
});

// Get audit log
const audit = await mwClient.mcp.getAuditLog({
  limit: 100,
  offset: 0,
  filters: { tool_name: 'pglite_query', status: 'success' }
});
```

## 3. Data Models and Relationships

### 3.1 Tool Schema (from MCP)

```typescript
// From @moonwitness/types
export interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
  tags?: string[];  // e.g., ['database', 'readonly']
}

export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: JsonSchemaProperty;  // for arrays
  properties?: Record<string, JsonSchemaProperty>;  // for objects
}
```

### 3.2 Tool Execution Request

```typescript
export interface McpToolCallRequest {
  name: string;
  arguments: Record<string, any>;
  // tenant_id derived from principal, not body
}
```

### 3.3 Tool Execution Result

```typescript
export interface McpToolCallResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    stack?: string;  // dev mode only
  };
  meta: {
    duration_ms: number;
    timestamp: string;
    user_id: number;
    tenant_id: number;
  };
}
```

### 3.4 Audit Event Structure

```typescript
// Stored in arsy.audit.event
export interface AuditEvent {
  id: number;
  event_type: 'mcp_tool_call';
  user_id: number;
  tenant_id: number;
  request_id: string;
  model_name: string;  // tool name
  record_id: null;  // N/A for tool calls
  operation: 'call';
  changed_fields: string[];  // ['arguments', 'result']
  created_at: string;
  // args and result stored in separate audit_data table (not in event)
}
```

## 4. API Contracts and Interfaces

### 4.1 MCP Endpoint

**Endpoint:** `POST /v1/mcp/message`

**Request:**
```typescript
{
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/list' | 'tools/call';
  params?: {
    name: string;
    arguments?: Record<string, any>;
  };
}
```

**Response:**
```typescript
{
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
```

### 4.2 SDK Method Signatures

```typescript
// packages/sdk/src/mcp.ts
export async function listTools(): Promise<McpToolsListResult> {
  // GET /v1/mcp/tools (simplified wrapper)
}

export async function callTool(input: McpToolCallRequest): Promise<McpToolCallResult> {
  // POST /v1/mcp/message with tools/call
}

export async function getAuditLog(params: GetAuditLogParams): Promise<ToolExecutionRecord[]> {
  // GET /v1/admin/audit-events?model_name=arsy.mcp.tool&operation=call
}
```

## 5. Data Flow and System Interactions

### 5.1 Tool Discovery Flow

```
User → Headquarter → SDK.mcp.listTools() → Arsy /v1/mcp/message
                                           ↓
                                      MCP Router
                                           ↓
                                      Tool Registry
                                           ↓
                                      Return tools[]
                                           ↓
User ← Render ToolList ← SDK ←───────────┘
```

### 5.2 Tool Execution Flow

```
User fills form → Validate → SDK.mcp.callTool() → Arsy /v1/mcp/message
                                                    ↓
                                             Auth Guard (principal)
                                                    ↓
                                             Tenant Resolution
                                                    ↓
                                             SSRF Guard (if network)
                                                    ↓
                                             Tool Executor
                                                    ↓
                                             Audit Event (append)
                                                    ↓
                                             Return result/error
                                                    ↓
User ← Render Result ← SDK ←─────────────────────────┘
```

### 5.3 Audit Log Flow

```
User → Filter → SDK.mcp.getAuditLog() → Arsy /v1/admin/audit-events
                                         ↓
                                  Auth Guard (superuser?)
                                         ↓
                                  Tenant Filter (company_id)
                                         ↓
                                  Query arsy.audit.event
                                         ↓
                                  Return events[]
                                         ↓
User ← Render Table ← SDK ←──────────────┘
```

## 6. UI/UX Flows and Design Specifications

### 6.1 Page Layout (Desktop)

```
┌────────────────────────────────────────────────────────────┐
│  [EcosystemNavbar]                                         │
├────────────────────────────────────────────────────────────┤
│  [PageHero: "Tool Registry"]                               │
├────────────────────────────────────────────────────────────┤
│  [Tabs: "Browse Tools" | "Audit Log"]                      │
├──────────────┬─────────────────────────────────────────────┤
│  Tool List   │  Tool Detail / Execution                   │
│  ┌────────┐  │  ┌───────────────────────────────────────┐ │
│  │ Tool 1 │  │  │ Tool Name                              │ │
│  │ Tool 2 │  │  │ Description                            │ │
│  │ Tool 3 │  │  ├───────────────────────────────────────┤ │
│  │ ...    │  │  │ Parameters:                            │ │
│  └────────┘  │  │  • query (string, required)            │ │
│              │  │  • limit (number, default=100)         │ │
│  [Search]    │  │                                       │ │
│  [Filter]    │  │  [Execute Button]                      │ │
│              │  └───────────────────────────────────────┘ │
│              │  ┌───────────────────────────────────────┐ │
│              │  │ Result:                               │ │
│              │  │ { ... }                               │ │
│              │  └───────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────┘
```

### 6.2 Tool Card Design

```typescript
// packages/ui/src/components/ToolRegistryCard.tsx
interface ToolRegistryCardProps {
  tool: McpTool;
  onClick: () => void;
  lastExecutedAt?: string;
  executionCount?: number;
}

export function ToolRegistryCard({ tool, onClick, lastExecutedAt, executionCount }: ToolRegistryCardProps) {
  return (
    <Card interactive onClick={onClick}>
      <Card.Header>
        <Badge variant="default">{tool.tags?.[0] || 'tool'}</Badge>
        <Heading level={3}>{tool.name}</Heading>
      </Card.Header>
      <Card.Body>
        <Text variant="muted">{tool.description || 'No description'}</Text>
        <Text variant="small">
          {Object.keys(tool.inputSchema.properties || {}).length} parameters
        </Text>
        {lastExecutedAt && (
          <Text variant="small" variant="muted">
            Last executed: {formatDistanceToNow(lastExecutedAt)}
          </Text>
        )}
      </Card.Body>
    </Card>
  );
}
```

### 6.3 Execution Form Design

```typescript
// packages/ui/src/components/ToolExecutionForm.tsx
interface ToolExecutionFormProps {
  tool: McpTool;
  onSubmit: (args: Record<string, any>) => void;
  isLoading: boolean;
}

export function ToolExecutionForm({ tool, onSubmit, isLoading }: ToolExecutionFormProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    // Validate against tool.inputSchema
    const newErrors: Record<string, string> = {};
    tool.inputSchema.required?.forEach(field => {
      if (!(field in values)) {
        newErrors[field] = 'Required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Form onSubmit={() => validate() && onSubmit(values)}>
      {Object.entries(tool.inputSchema.properties).map(([name, schema]) => (
        <FormField
          key={name}
          name={name}
          schema={schema}
          value={values[name]}
          onChange={v => setValues({ ...values, [name]: v })}
          error={errors[name]}
          required={tool.inputSchema.required?.includes(name)}
        />
      ))}
      <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
        {isLoading ? 'Executing...' : 'Execute'}
      </Button>
    </Form>
  );
}
```

### 6.4 State Panels

All states use `StatePanel` component from `@moonwitness/ui`:

- **Loading:** `StatePanel` with spinner and "Executing tool..."
- **Empty:** `StatePanel` with "No tools registered" or "No audit logs found"
- **Error:** `StatePanel` with error message and retry button
- **Success:** Result viewer with expandable JSON

## 7. Integration Architecture

### 7.1 Headquarter Integration

- Uses existing `HeadquarterShell` layout
- Skin: `nexus-paradox` (already assigned)
- Navigation: Existing `EcosystemNavbar`
- Auth: Existing `useEcosystemSession` hook

### 7.2 Arsy Integration

- No backend changes required
- Uses existing `/v1/mcp/message` endpoint
- Uses existing audit event system
- Rate limiting already configured per endpoint

### 7.3 SDK Integration

- No SDK changes required
- Uses existing `mwClient.mcp` methods
- Types already exported from `@moonwitness/types`

## 8. Error Handling and Failure Scenarios

### 8.1 Error Types

| Error Type | Cause | UI Response |
|------------|-------|-------------|
| `VALIDATION_ERROR` | Invalid form input | Inline field error, submit disabled |
| `AUTH_ERROR` | Session expired | Redirect to `/login` |
| `NETWORK_ERROR` | Arsy unreachable | StatePanel with retry |
| `TIMEOUT_ERROR` | Tool execution > 30s | StatePanel with timeout message |
| `TOOL_ERROR` | Tool threw exception | Show error message, stack trace (dev) |
| `SSRF_ERROR` | Blocked private IP | Show security guard message |
| `RATE_LIMIT_ERROR` | Too many requests | Show cooldown timer |

### 8.2 Retry Logic

```typescript
async function executeWithRetry(toolName: string, args: Record<string, any>, maxRetries = 2) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await mwClient.mcp.callTool({ name: toolName, arguments: args });
    } catch (error) {
      lastError = error as Error;
      if (error.name === 'NETWORK_ERROR' || error.name === 'TIMEOUT_ERROR') {
        // Retry only for transient errors
        await sleep(1000 * (attempt + 1)); // Exponential backoff
        continue;
      }
      throw error; // Don't retry validation/auth errors
    }
  }
  
  throw lastError;
}
```

## 9. Security and Performance Considerations

### 9.1 Security Guards

**Authentication:**
- All routes protected by existing auth middleware
- Unauthenticated users redirected to `/login`

**Tenant Isolation:**
- Tenant derived from JWT principal
- Audit log filtered by `company_id`
- Body `company_id` ignored

**SSRF Prevention:**
- Network tools validate URLs before request
- Resolved IPs checked against private ranges
- Block: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`

**Parameter Sanitization:**
- String inputs escaped for XSS prevention
- No HTML rendering in result viewer without sanitization
- SQL injection prevented by parameterized queries (backend)

**Rate Limiting:**
- Default: 10 requests/minute per user per tool
- Configurable per tool in backend

### 9.2 Performance Optimizations

**Client-Side:**
- Virtualized lists for audit log (>100 rows)
- Lazy loading of tool details
- Debounced search (300ms)
- Cached tool list (5min stale-while-revalidate)

**Server-Side:**
- Audit log pagination (limit/offset)
- Index on `arsy.audit.event(created_at, user_id, model_name)`
- Tool registry cached in memory

## 10. Observability Strategy

### 10.1 Client-Side Telemetry

```typescript
// Log to console (dev) or analytics (prod)
function logToolExecution(toolName: string, duration: number, success: boolean) {
  console.log('[ToolExecution]', { toolName, duration, success });
  // Future: send to analytics
}
```

### 10.2 Server-Side Audit

Every tool execution creates an audit event:

```sql
INSERT INTO arsy.audit.event (
  event_type, user_id, tenant_id, request_id, model_name,
  operation, changed_fields, created_at
) VALUES (
  'mcp_tool_call', :user_id, :tenant_id, :request_id, :tool_name,
  'call', ARRAY['arguments', 'result'], NOW()
);
```

### 10.3 Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Tool execution count | Audit log | — |
| Success rate | Audit log | < 90% |
| Avg duration | Audit log | > 5s |
| Error rate by tool | Audit log | > 10% |
| Most-used tools | Audit log | — |
| Rate limit hits | Arsy logs | > 100/hour |

## 11. Technical Decisions and Alternatives

### 11.1 Form Generation: Dynamic vs Static

**Decision:** Dynamic form generation from JSON Schema

**Alternatives Considered:**
- Static forms per tool (rejected: not scalable)
- Code-generated forms (rejected: build complexity)
- Third-party form builder (rejected: unnecessary dependency)

**Rationale:** JSON Schema is the MCP standard, dynamic generation scales to any number of tools, no build step required.

### 11.2 Result Rendering: JSON vs Custom

**Decision:** Pretty-print JSON with syntax highlighting

**Alternatives Considered:**
- Custom renderers per tool type (rejected: maintenance burden)
- Table view for all results (rejected: loses structure)
- Raw text (rejected: poor UX)

**Rationale:** JSON is universal, syntax highlighting improves readability, future custom renderers can be added for common types.

### 11.3 Audit Log: Real-Time vs Polling

**Decision:** Polling every 30s

**Alternatives Considered:**
- WebSocket real-time (rejected: overengineering)
- Manual refresh only (rejected: stale data)
- SSE stream (rejected: complexity)

**Rationale:** Polling is simple, reliable, and sufficient for audit use case. 30s balances freshness and load.

## 12. Testing Strategy

### 12.1 Unit Tests

**File: `packages/ui/src/components/ToolExecutionForm.test.tsx`**

```typescript
describe('ToolExecutionForm', () => {
  it('renders form fields from schema', () => {
    // Test all JSON Schema types
  });

  it('validates required fields', () => {
    // Test submit disabled until valid
  });

  it('shows inline errors for invalid input', () => {
    // Test error messages
  });
});
```

### 12.2 Integration Tests

**File: `apps/headquarter/tests/tool-registry.test.ts`**

```typescript
describe('Tool Registry Page', () => {
  it('lists all registered tools', async () => {
    // Mock SDK, assert tool cards rendered
  });

  it('executes tool and shows result', async () => {
    // Mock SDK.callTool, assert result viewer
  });

  it('filters audit log', async () => {
    // Mock SDK.getAuditLog, assert filtered table
  });
});
```

### 12.3 E2E Tests

**File: `apps/headquarter/tests/e2e/tool-registry.spec.ts`**

```typescript
test('full tool execution flow', async ({ page }) => {
  await page.goto('/tools');
  await page.click('[data-tool="pglite_query"]');
  await page.fill('[name="query"]', 'SELECT 1');
  await page.click('button:has-text("Execute")');
  await expect(page.locator('[data-result]')).toBeVisible();
});
```

## 13. Migration and Rollout

### 13.1 Phase 1: Tool Registry Browser
- Implement `ToolRegistryCard`, `ToolDetailPanel`
- Replace static list with dynamic tool list
- No execution capability yet

### 13.2 Phase 2: Tool Execution Sandbox
- Implement `ToolExecutionForm`, `ToolResultViewer`
- Enable tool execution with validation
- Add error handling and retry

### 13.3 Phase 3: Audit Log Viewer
- Implement `ToolAuditLogTable`, `ToolAuditLogFilters`
- Add filtering and export
- Add tenant isolation

### 13.4 Phase 4: Polish and Accessibility
- WCAG AA audit and fixes
- Responsive design testing
- Performance optimization
- Documentation

---

**Cross-References:**
- Related: [spec.md](./spec.md) — Functional requirements
- Related: [task.md](./task.md) — Implementation steps
- Related: [rule.md](./rule.md) — Implementation rules
- Related: `packages/ui/src/components/` — Component location
- Related: `packages/sdk/src/mcp.ts` — SDK methods