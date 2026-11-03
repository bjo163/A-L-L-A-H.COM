# RULES: Phase 3 - Executive Hands & Model Context Protocol (MCP) Tools

## 1. System Invariants & Architectural Rules

### 1.1 Read-Only SQL Security Invariant
- The `pglite_query` tool must enforce read-only execution at the gateway layer.
- Any query containing state-mutating keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) must be rejected immediately with `UNSAFE_SQL_QUERY`.
- Queries must enforce tenant isolation by validating that target tables respect tenant scoping (`company_id`).

### 1.2 SSRF Protection on Tool Execution
- The `web_fetch` tool must use the unified SSRF validator (`validateUrlSsrf`) to prevent requests to localhost, internal cloud metadata endpoints (`169.254.169.254`), or private networks.
- Protocol must strictly be `http` or `https`.

### 1.3 Auditability of Autonomous Actions
- Every execution of a tool via the Gateway or the MCP server must be recorded with:
  - Tool name
  - Timestamp
  - Actor / Virtual Key / Session Token
  - Execution latency in ms
  - Success / failure status code and error details

### 1.4 Standard JSON-RPC 2.0 Compliance
- The Fastify MCP Server must adhere strictly to the Model Context Protocol specification and JSON-RPC 2.0 (`jsonrpc: "2.0"`).
- Incompatible payloads must return standard JSON-RPC error codes (`-32600 Invalid Request`, `-32601 Method not found`, `-32602 Invalid params`).

### 1.5 UI Integrity & Anti-Slop Guard
- The Headquarter Tools dashboard must exclusively use `@moonwitness/ui` components.
- All UI states (Loading, Empty, Error) must be handled explicitly.
- No fabricated data or dummy statistics.

