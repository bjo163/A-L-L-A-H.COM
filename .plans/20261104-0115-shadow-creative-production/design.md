# Design: SHADOW Phase 1 — Creative Production & Asset Pipeline Foundation

## 1. Creative Project Asset Hierarchy
```typescript
export interface ShadowAssetRecord {
  id: string;
  project_id: number;
  name: string;
  media_type: 'audio' | 'video' | 'image' | 'text' | 'archive';
  cas_hash: string;
  mime_type: string;
  size_bytes: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  company_id: string;
}
```

