# Design: MOONLAB Phase 1 — Research, Experimentation & AI Sandbox Foundation

## 1. Multi-Model Benchmark Comparison Matrix
```typescript
export interface MoonlabBenchmarkRecord {
  id: string;
  experiment_id: number;
  model_id: string;
  provider_slug: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  cost_usd: number;
  similarity_score?: number;
  evaluation_verdict: 'pass' | 'fail' | 'partial';
  created_at: string;
  company_id: string;
}
```

