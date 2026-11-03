# Design: Phase 4 Autonomous Cognitive Agent Loop & Generative SDUI

## 1. Interaction Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Headquarter Operator
    participant Studio as apps/headquarter (/agent)
    participant SDK as @allah/sdk
    participant Hub as apps/arsy (/v1/agent/stream)
    participant Loop as AgentLoop Engine
    participant Gateway as LLM Gateway Router
    participant Registry as ToolRegistry

    User->>Studio: Enter prompt: "Periksa attachment di CAS dan rangkum dalam SDUI card"
    Studio->>SDK: sdk.agentStream({ prompt, max_steps: 6 })
    SDK->>Hub: POST /v1/agent/stream
    Hub->>Loop: Initialize session & load system prompt + tools
    Loop->>Gateway: Step 1 Reason (/v1/chat/completions + tools)
    Gateway-->>Loop: Tool Call: storage_cas(action='list')
    Loop-->>Hub: SSE event: tool_call
    Hub-->>SDK: event: tool_call { tool: 'storage_cas' }
    SDK-->>Studio: Render active tool chip (amber)
    Loop->>Registry: execute('storage_cas', { action: 'list' })
    Registry-->>Loop: Result: [ { hash: 'e3b0c44...', size: 1024 } ]
    Loop-->>Hub: SSE event: tool_result
    Hub-->>SDK: event: tool_result { output: ... }
    Studio-->>Studio: Update chip to completed (emerald)
    Loop->>Gateway: Step 2 Reason with Observation
    Gateway-->>Loop: Tool Call: render_sdui(view_type='card', title='CAS Summary')
    Loop-->>Hub: SSE event: sdui_payload
    Hub-->>SDK: event: sdui_payload { schema: ... }
    Studio-->>Studio: Hydrate SDUI Component live in viewport
    Loop->>Gateway: Step 3 Final Synthesis
    Gateway-->>Loop: Final text response
    Loop-->>Hub: SSE event: message (chunked)
    Hub-->>SDK: event: message
    Hub-->>SDK: event: done
    SDK-->>Studio: Complete stream
```

---

## 2. API Contracts

### 2.1 Request Schema (`POST /v1/agent/run` and `/v1/agent/stream`)
```typescript
interface AgentRunRequest {
  prompt: string;
  system?: string;
  thread_id?: string;
  max_steps?: number;        // default: 8, max: 20
  timeout_ms?: number;       // default: 60000 ms
  allowed_tools?: string[];   // default: all registered tools
  temperature?: number;      // default: 0.2 for deterministic tool use
}
```

### 2.2 SSE Event Stream Protocol (`/v1/agent/stream`)
The endpoint outputs `text/event-stream` with standardized events:
- `event: thought`: Emitted when the agent begins a cognitive reasoning step.
  ```json
  { "step": 1, "thought": "Analyzing user objective and selecting appropriate inspection tools..." }
  ```
- `event: tool_call`: Emitted when the agent decides to execute a tool.
  ```json
  { "step": 1, "call_id": "call_123", "tool": "pglite_query", "arguments": { "query": "SELECT count(*) FROM res_partner" } }
  ```
- `event: tool_result`: Emitted when tool execution concludes.
  ```json
  { "step": 1, "call_id": "call_123", "success": true, "result": { "rows": [{ "count": 12 }] }, "latency_ms": 14 }
  ```
- `event: sdui`: Emitted when the agent synthesizes a dynamic view.
  ```json
  { "type": "card", "title": "System Telemetry", "props": { "status": "nominal", "records": 12 } }
  ```
- `event: chunk`: Emitted for token-by-token final text synthesis.
  ```json
  { "delta": "Berdasarkan inspeksi CAS dan database..." }
  ```
- `event: done`: Emitted upon agent loop termination.
  ```json
  { "total_steps": 3, "tools_called": ["pglite_query", "render_sdui"], "finish_reason": "completed" }
  ```

---

## 3. UI Composition (Headquarter `/agent`)
- Built exclusively with `@moonwitness/ui`:
  - `Card`, `Button`, `Input`, `Badge`, `Tabs`, `Separator`, `ScrollArea`.
- Dark-mode first theme using `#08090a`, `#0f1115`, `#161920`, `#00e599`, `#00b4d8`.
- Accessible status indicators for reasoning states (Thinking, Executing, Observing, Synthesizing, Completed).

