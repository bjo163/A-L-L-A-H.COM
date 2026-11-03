# Tasks: Phase 3 - Executive Hands & Model Context Protocol (MCP) Tools

## 3.1 Gateway Tool Schema Normalization
- [x] Add `tools` and `tool_choice` schema to `packages/arsy-plugin-llm-gateway/src/types.ts`
- [x] Implement Tool Call translation in OpenAI Adapter (`src/adapters/openai.ts`)
- [x] Implement Tool Call translation in Anthropic Adapter (`src/adapters/anthropic.ts` -> `tool_use` blocks)
- [x] Implement Tool Call translation in Gemini Adapter (`src/adapters/gemini.ts` -> `functionDeclarations` / `functionCall`)

## 3.2 Native Platform Tools Engine
- [x] Create `packages/arsy-plugin-llm-gateway/src/tools/` registry
- [x] Implement `pglite_query` tool (safe parameterized read-only query guard)
- [x] Implement `storage_cas` tool (upload and fetch assets from CAS)
- [x] Implement `web_fetch` tool (SSRF-guarded web retrieval)
- [x] Implement `qorpus_retrieve` tool (query knowledge chunks from `addons/mw_qorpus`)

## 3.3 Fastify MCP Server (Model Context Protocol)
- [x] Implement standard JSON-RPC 2.0 MCP handler
- [x] Register `GET /v1/mcp/sse` and `POST /v1/mcp/message` in Fastify Hub
- [x] Implement `tools/list` protocol handler
- [x] Implement `tools/call` protocol handler with execution audit logs

## 3.4 Client SDK & Headquarter Integration
- [x] Add tool execution and MCP client helpers to `@allah/sdk`
- [x] Add tool invocation and MCP types to `@moonwitness/types`
- [x] Build Headquarter Tools & MCP page in `apps/headquarter/src/app/tools/page.tsx` using `@moonwitness/ui`
- [x] Write automated integration test suite in `apps/arsy/test/tools_mcp.test.mjs`
- [x] Execute ecosystem build gates and doc compliance verification
