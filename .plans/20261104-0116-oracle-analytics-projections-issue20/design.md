# Design: ORACLE Phase 1 — Read-Only Network & ISP Analytics Projections (Issue #20)

## 1. Metric Schema Envelope
```typescript
export interface OracleMetricRecord<T = unknown> {
  metric_key: string;
  display_label: string;
  value: T;
  unit: string;
  time_window: 'hourly' | 'daily' | 'monthly';
  source_domain: 'works' | 'sentinel' | 'watchtower' | 'chronicle';
  provenance: {
    calculation_version: string;
    computed_at: string;
    fresh_until: string;
    data_points_sampled: number;
  };
  company_id: string;
}
```

