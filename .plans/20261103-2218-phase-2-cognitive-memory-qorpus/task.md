# Tasks: Phase 2 - Cognitive Memory, Qorpus RAG & Vector Semantic Cache

## 2.1 Multi-Provider Embeddings Engine
- [x] Implement Embeddings interface in `packages/arsy-plugin-llm-gateway/src/adapters/`
- [x] Implement OpenAI Embeddings adapter (`text-embedding-3-small`, `text-embedding-3-large`)
- [x] Implement Gemini Embeddings adapter (`text-embedding-004`)
- [x] Register `POST /v1/embeddings` endpoint in Fastify plugin
- [x] Add `sdk.router.embeddings()` method to `@allah/sdk`

## 2.2 Vector Semantic Cache in PGlite
- [x] Define `AiSemanticCache` model in `addons/mw_llm_router/`
- [x] Implement cosine similarity vector distance helper in `@allah/arsy-orm`
- [x] Connect `GatewayCache` to query PGlite for vector similarity when exact hash misses
- [x] Verify semantic cache hits for synonym/rephrased queries

## 2.3 Qorpus Knowledge Ingestion Addon (`addons/mw_qorpus`)
- [x] Create `addons/mw_qorpus/` addon with manifest and schema
- [x] Define `qorpus.document` and `qorpus.chunk` models
- [x] Build recursive text/markdown chunking engine with token windowing
- [x] Register `POST /v1/qorpus/ingest` and `POST /v1/qorpus/search` endpoints in Fastify Hub
- [x] Seed baseline MoonWitness canon and architecture documentation into Qorpus

## 2.4 Conversation Threads & Episodic Memory
- [x] Define `ai.thread` and `ai.message` models in `addons/mw_llm_router`
- [x] Register thread CRUD endpoints: `GET/POST /v1/threads` and `GET/POST /v1/threads/:id/messages`
- [x] Implement context window auto-summarization for conversations exceeding token budgets
- [x] Add thread operations to `@allah/sdk`

## 2.5 Headquarter Knowledge & Memory Explorer
- [x] Build Qorpus knowledge search explorer in `apps/headquarter/src/app/knowledge/page.tsx`
- [x] Implement semantic cache telemetry and hit rate charts
- [x] Run automated tests and ecosystem build verification gates

