# Report: Phase 3 - Executive Hands & Model Context Protocol (MCP) Tools

Status: completed
Plan: `.plans/20261103-2242-phase-3-executive-tools-mcp/`
Branch: `dev`

## Summary

All Phase 3 tasks are implemented, tested, and verified against the ecosystem build gates. The platform now provides executive hands (native tool execution) and a standard Model Context Protocol (MCP) server exposed through the Fastify Hub.

## 3.1 Gateway Tool Schema Normalization

- `packages/arsy-plugin-llm-gateway/src/types.ts`: Added `ToolParameter`, `ToolFunction`, `ToolDefinition`, `ToolCall`, `ToolCallFunction`, `ToolChoice` types. Extended `ChatMessage` with `tool_calls`/`tool_call_id`, `ChatCompletionRequest` with `tools`/`tool_choice`, and `StreamDelta` with streaming `tool_calls`.
- `src/adapters/openai.ts`: Passes `tools`/`tool_choice` to upstream; translates `tool_calls` from response into normalized OpenAI-format `ToolCall[]` (non-stream + streaming deltas).
- `src/adapters/anthropic.ts`: Transforms OpenAI `tools` to Anthropic `tools`/`input_schema` and `tool_choice` to `tool_choice` (`none`/`auto`/`any`/`tool`). Translates `tool_use` content blocks back into `tool_calls`.
- `src/adapters/gemini.ts`: Transforms OpenAI `tools` to Gemini `functionDeclarations` and `tool_choice` to `toolConfig.functionCallingConfig` (`NONE`/`AUTO`/`ANY`). Translates `functionCall` parts into `tool_calls` (non-stream + streaming deltas).

## 3.2 Native Platform Tools Engine

Created `packages/arsy-plugin-llm-gateway/src/tools/` with `base.ts`, `registry.ts`, `index.ts` and four tools, all registered into the singleton `toolRegistry`:

- `pglite_query.ts`: Read-only SQL guard. Rejects `DROP/DELETE/UPDATE/INSERT/ALTER/TRUNCATE/GRANT/REVOKE/CREATE/MERGE` with `UNSAFE_SQL_QUERY`; enforces `SELECT`-only; executes parameterized queries via `dbEngine`.
- `storage_cas.ts`: Content-addressed store (SHA-256) with `put`/`get` using the filesystem; records `ir.attachment` provenance.
- `web_fetch.ts`: Undici-based fetch guarded by `validateUrlSsrf` (blocks localhost/loopback/RFC1918/private IPs; http/https only); `max_bytes` truncation.
- `qorpus_retrieve.ts`: Lexical hybrid search over `qorpus.document`/`qorpus.chunk` with `limit`/`min_score`.

## 3.3 Fastify MCP Server (Model Context Protocol)

- `src/mcp.ts`: `McpHandler` implementing JSON-RPC 2.0 (`jsonrpc: "2.0"`) with `initialize`, `tools/list`, `tools/call`, `ping`, and standard error codes (`-32600`/`-32601`/`-32602`/`-32603`). `tools/call` records execution audit entries via `ToolRegistry.execute`.
- `src/index.ts`: Registered `GET /v1/mcp/sse` (SSE stream with `endpoint` event), `POST /v1/mcp/message` (JSON-RPC ingress), and `GET /v1/mcp/audit` (tool execution audit log).

## 3.4 Client SDK & Headquarter Integration

- `@moonwitness/types`: Added `ToolDefinition`, `ToolCall`, `ToolChoice`, `ToolResult`, `JsonRpcRequest/Response`, `McpTool`, `McpToolCallResult`, `MCP_PROTOCOL_VERSION`.
- `@allah/sdk`: Added `mcp.listTools()`, `mcp.callTool(name, arguments)`, `mcp.getAuditLog()` client helpers.
- `apps/headquarter/src/app/tools/page.tsx`: Tools & MCP dashboard using `@moonwitness/ui` (MCP status card, tool registry catalog, execution sandbox, audit log table).
- `apps/arsy/test/tools_mcp.test.mjs`: 10-test integration suite (all pass): tools/list, pglite_query read-only + mutating rejection, storage_cas put/get roundtrip, web_fetch SSRF block, qorpus_retrieve, JSON-RPC error codes, audit log.

## Verification (Quality Gates)

- `pnpm docs:check`: 100 / 100 (PASS)
- `pnpm lint:arch`: All architectural invariants PASSED (100% compliant)
- `pnpm typecheck`: exit code 0 (PASS)
- `pnpm --filter @allah/arsy-plugin-llm-gateway build`: PASS
- `pnpm --filter @moonwitness/types build`: PASS
- `pnpm --filter @allah/sdk build`: PASS
- `pnpm --filter @allah/arsy build`: PASS
- `pnpm dock:build`: PASS
- `pnpm headquarter:build`: PASS (`/tools` route generated)
- `pnpm id:build`: PASS
- Existing `apps/arsy/test/ai_gateway.test.mjs`: 9/9 pass (no regression)
- New `apps/arsy/test/tools_mcp.test.mjs`: 10/10 pass

## Files Changed

- `packages/arsy-plugin-llm-gateway/src/types.ts`
- `packages/arsy-plugin-llm-gateway/src/adapters/openai.ts`
- `packages/arsy-plugin-llm-gateway/src/adapters/anthropic.ts`
- `packages/arsy-plugin-llm-gateway/src/adapters/gemini.ts`
- `packages/arsy-plugin-llm-gateway/src/index.ts`
- `packages/arsy-plugin-llm-gateway/src/mcp.ts` (new)
- `packages/arsy-plugin-llm-gateway/src/tools/` (new: base.ts, registry.ts, index.ts, pglite_query.ts, storage_cas.ts, web_fetch.ts, qorpus_retrieve.ts)
- `packages/types/src/index.ts`
- `packages/sdk/src/index.ts`
- `apps/headquarter/src/app/tools/page.tsx` (new)
- `apps/arsy/test/tools_mcp.test.mjs` (new)
- `.plans/20261103-2242-phase-3-executive-tools-mcp/spec.md` (status -> completed)
- `.plans/20261103-2242-phase-3-executive-tools-mcp/task.md` (all boxes checked)
