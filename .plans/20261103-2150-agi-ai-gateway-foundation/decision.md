# Architectural Decision Record (ADR): AI Gateway as Phase 1 Bedrock

## Status
Accepted

## Context
A-L-L-A-H.COM and MoonWitness require cognitive autonomous capabilities (AGI) and an enterprise-grade AI Gateway.
We evaluated whether to build high-level agentic loops first or the AI Gateway substrate first.

## Decision
We decided to build the **Multi-Provider AI Gateway & Unified Routing Engine** as Phase 1 before building high-level cognitive memory (Qorpus RAG) and autonomous agentic loops.

### Key Architectural Choices:
1. **Model & Addon Integration**: Connect runtime `packages/arsy-plugin-llm-gateway` directly to `@allah/arsy-orm` and the models in `addons/mw_llm_router` (`ai.provider`, `ai.model`, `ai.route`, `ai.virtual_key`, `ai.usage_log`).
2. **Multi-Provider Protocol Normalization**: Support OpenAI-compatible (OpenAI, DeepSeek, Groq, Ollama), Anthropic Messages API, and Google Gemini REST API within the same `/v1/chat/completions` endpoint.
3. **Resilience & Fallback Strategy**: Implement multi-tier fallback sequences (e.g. Anthropic -> OpenAI -> Gemini -> Ollama) with circuit breaker tracking to ensure agent loops never fail due to upstream provider rate limits.
4. **Persistent Metering & Zero Overlap**: All virtual keys, rate limits, and request logs are stored directly in embedded PGlite via `@allah/arsy-orm` with tenant isolation (`company_id` / `partner_id`).
5. **Streaming First**: Native Server-Sent Events (`text/event-stream`) streaming with zero-copy chunk forwarding.
6. **Design System Mandate**: Any dashboard interface in `apps/headquarter` must exclusively use `@moonwitness/ui`.

## Consequences
- All subsequent AGI layers (Memory, Tools, Agent Loop) will execute reliably through the Gateway without risk of provider lock-in or unhandled rate limits.
- Upstream costs and token consumption will be strictly tracked and capped per virtual key in PGlite.

