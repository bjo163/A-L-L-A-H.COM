# RULES: Phase 2 - Cognitive Memory, Qorpus RAG & Vector Semantic Cache

## 1. System Invariants & Architectural Rules

### 1.1 Single Embedded Database & Zero ORM Overlap
- All vectors, embeddings, documents, and chunks must be stored in the embedded PGlite instance via `@allah/arsy-orm`.
- No external vector databases (Pinecone, Qdrant, Chroma, Weaviate) are permitted. PGlite handles both tabular and vector workloads.

### 1.2 Tenant & Partner Isolation in Memory
- Ingested documents and conversation threads must include tenant isolation scoping (`company_id` or `partner_id`).
- RAG queries must strictly constrain their vector search scope to the tenant or public system lore.

### 1.3 Content Deduplication Invariant (SHA-256)
- Every ingested document in Qorpus must compute a SHA-256 digest of its source content.
- Duplicate documents with identical SHA-256 hashes must not be re-chunked or re-embedded.

### 1.4 Cache Invalidation & TTL Guard
- Semantic cache records must carry a finite TTL (default: 7 days) and an LRU eviction cap to prevent unbounded database growth.

### 1.5 UI Integrity & Anti-Slop Guard
- Any UI in `apps/headquarter` or `apps/dock` interacting with knowledge search must exclusively use components from `@moonwitness/ui`.
- All states (Loading, Empty, and Error) must be handled explicitly.
- No fabricated data or placeholder statistics.

