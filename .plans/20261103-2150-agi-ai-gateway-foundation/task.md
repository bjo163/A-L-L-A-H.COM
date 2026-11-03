# Tasks: AGI Platform & AI Gateway Foundation

## Phase 1: Core AI Gateway & Multi-Provider Architecture (Primary Execution)

### 1.1 Foundation & Universal Provider Adapters
- [x] Connect `packages/arsy-plugin-llm-gateway` with `@allah/arsy-orm` and `addons/mw_llm_router` models
- [x] Implement OpenAI-compatible adapter in gateway (supports OpenAI, DeepSeek, Groq, Ollama)
- [x] Implement Anthropic Messages API adapter (translates OpenAI-style request/response to Anthropic schema)
- [x] Implement Google Gemini REST adapter (translates OpenAI-style request/response to Gemini generateContent schema)
- [x] Implement normalized `/v1/models` endpoint reflecting active models from `ai.model` repository

### 1.2 True Streaming & Fallback Routing Engine
- [x] Implement Server-Sent Events (SSE) streaming handler for `stream: true` in `/v1/chat/completions`
- [x] Implement Multi-Tier Fallback Sequence (try primary provider, on error 429/500/503 switch to secondary provider)
- [x] Implement Provider Circuit Breaker (mark `is_healthy = false` on consecutive failures, probe on interval)
- [x] Ensure SSRF guard and request timeout safeguards on all upstream calls

### 1.3 Virtual Keys, Quotas & Persistent Usage Accounting
- [x] Implement Virtual Key verification middleware (`x-virtual-key` header lookup against `ai.virtual_key`)
- [x] Enforce rate limits (RPM, TPM) and monthly USD budget limits per virtual key
- [x] Record every request execution in `ai.usage_log` (tokens, cost_usd, latency_ms, provider_id, model_id)
- [x] Persist exact hash cache in PGlite with configurable TTL

### 1.4 Client SDK & Headquarter Telemetry Integration
- [x] Update `@allah/sdk` with streaming support (`chatStream()`), provider listing, and virtual key credentials
- [x] Update `@moonwitness/types` with expanded multi-provider and streaming definitions
- [x] Build Headquarter AI Gateway Management page in `apps/headquarter/src/app/(dashboard)/ai-gateway/page.tsx`
- [x] Implement Provider Status cards, Virtual Key generator, and Usage Log telemetry table in Headquarter using `@moonwitness/ui`

---

## Phase 2: Memory & Knowledge Subsystem (Qorpus RAG)
- [ ] Add `/v1/embeddings` endpoint with provider adapters (OpenAI, Gemini)
- [ ] Implement vector cosine similarity calculation in PGlite
- [ ] Implement real Vector Semantic Caching (similarity threshold >= 0.95)
- [ ] Build Qorpus document ingestion pipeline with SHA-256 deduplication
- [ ] Implement persistent conversation threads and working memory in PGlite

---

## Phase 3: Executive Tools & Model Context Protocol (MCP)
- [ ] Standardize tool/function call definitions across OpenAI, Anthropic, and Gemini
- [ ] Create Arsy native tool registry (Safe PGlite SQL, Echolog Storage, SSRF Web fetch)
- [ ] Build Fastify MCP Server endpoint for IDE and agent interoperability

---

## Phase 4: Autonomous Agentic Loop & Generative SDUI
- [ ] Build multi-turn ReAct reasoning loop (Think, Plan, Tool Call, Observe, Finalize)
- [ ] Implement Generative SDUI synthesis returning dynamic `@moonwitness/ui` component trees
- [ ] Wire VS Code extension to generate full canonical plan artifacts autonomously via Gateway
- [ ] Execute comprehensive end-to-end verification and gate checks

