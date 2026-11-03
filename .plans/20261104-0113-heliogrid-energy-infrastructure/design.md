# Design: HELIOGRID Phase 1 — Energy & Physical Infrastructure Foundation

## 1. Energy Power Flow Telemetry Schema
```typescript
export interface HeliogridTelemetryRecord {
  id: string;
  site_id: number;
  solar_generation_kw: number;
  battery_discharge_kw: number;
  battery_soc_percent: number;
  grid_import_kw: number;
  site_consumption_kw: number;
  status: 'nominal' | 'warning' | 'critical';
  recorded_at: string;
  company_id: string;
}
```

