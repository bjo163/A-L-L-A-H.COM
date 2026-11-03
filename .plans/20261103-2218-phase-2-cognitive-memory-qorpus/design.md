# DESIGN: Phase 2 - Cognitive Memory, Qorpus RAG & Vector Semantic Cache

## 1. System Interaction Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as User / App
    participant Gateway as AI Gateway (/v1)
    participant SemCache as Vector Semantic Cache (PGlite)
    participant Qorpus as Qorpus Engine (addons/mw_qorpus)
    participant Upstream as Upstream LLM (OpenAI/Anthropic)

    User->>Gateway: POST /v1/chat/completions (prompt: "Explain MoonWitness")
    Gateway->>Gateway: Compute Query Embedding
    Gateway->>SemCache: Query Cosine Similarity (threshold >= 0.95)
    alt Semantic Cache Hit
        SemCache-->>Gateway: Return Previous Valid Completion
        Gateway-->>User: 200 OK (X-Semantic-Cache-Hit: true)
    else Semantic Cache Miss
        Gateway->>Qorpus: Retrieve Relevant Chunks (Hybrid Search)
        Qorpus-->>Gateway: Injected Grounding Context Chunks
        Gateway->>Upstream: Forward Augmented Prompt
        Upstream-->>Gateway: Generated Completion
        Gateway->>SemCache: Store Prompt Embedding + Completion
        Gateway-->>User: Return/Stream Completion
    end
```

---

## 2. API Contract Specifications

### 2.1 Embeddings Endpoint
- **Path**: `POST /v1/embeddings`
- **Request**:
  ```json
  {
    "model": "text-embedding-3-small",
    "input": ["Explain the MoonWitness architecture", "What is Arsy?"]
  }
  ```
- **Response**:
  ```json
  {
    "object": "list",
    "data": [
      {
        "object": "embedding",
        "index": 0,
        "embedding": [0.0123, -0.0456, 0.0891, 0.0032]
      }
    ],
    "model": "text-embedding-3-small",
    "usage": {
      "prompt_tokens": 12,
      "total_tokens": 12
    }
  }
  ```

### 2.2 Qorpus Knowledge Ingestion & Retrieval Endpoints
- **Ingestion**: `POST /v1/qorpus/ingest`
  ```json
  {
    "title": "A-L-L-A-H.COM System Architecture",
    "category": "architecture",
    "content": "# Markdown content of documentation...",
    "source": "docs/architecture.md"
  }
  ```
- **Search**: `POST /v1/qorpus/search`
  ```json
  {
    "query": "How does the Smart LLM router handle failover?",
    "limit": 5,
    "min_score": 0.75
  }
  ```
- **Search Response**:
  ```json
  {
    "success": true,
    "data": {
      "chunks": [
        {
          "id": 102,
          "document_title": "AI Gateway Architecture",
          "content": "The router maintains an active circuit breaker...",
          "score": 0.92,
          "category": "architecture"
        }
      ]
    }
  }
  ```

---

## 3. UI Composition: Headquarter Knowledge Explorer
Located at `apps/headquarter/src/app/knowledge/page.tsx` using `@moonwitness/ui`:
1. **Search & Query Bar**: Live hybrid search input displaying scored document chunks.
2. **Document Library Grid**: List of ingested documents with SHA-256 digests and chunk counts.
3. **Semantic Cache Telemetry**: Card showing total cache entries, storage volume, and hit rate percentage.

