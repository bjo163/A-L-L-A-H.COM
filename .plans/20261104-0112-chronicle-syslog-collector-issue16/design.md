# Design: CHRONICLE Phase 1 — Bounded Syslog Collector & Normalized Event Foundation (Issue #16)

## 1. Normalized Event Data Contract
```typescript
export interface ChronicleEventRecord {
  id: string;
  source_ip: string;
  nas_id?: number | null;
  facility: number;
  severity: number;
  severity_label: 'emerg' | 'alert' | 'crit' | 'err' | 'warning' | 'notice' | 'info' | 'debug';
  app_name: string;
  message: string;
  received_at: string;
  event_at: string;
  company_id: string;
}
```

