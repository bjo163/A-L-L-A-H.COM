# Design: ISP Product Phase 1 — Canonical Domain Models & Cross-Domain Contracts (Issue #7)

## 1. Domain Event & Communication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant WORKS as WORKS (Billing/Subscription)
    participant Bus as ARSY Internal Event Bus
    participant SENTINEL as SENTINEL (Access Policy)
    participant NAS as MikroTik RouterOS

    Customer->>WORKS: Pay Invoice for Monthly Internet Plan
    WORKS->>WORKS: Transition Subscription status to 'active'
    WORKS->>Bus: Emit event: isp.subscription.activated { sub_id, username, plan_rate }
    Bus->>SENTINEL: Update Policy Cache for username
    SENTINEL->>SENTINEL: Invalidate stale access cache
    Note over NAS,SENTINEL: Customer Router initiates PPPoE Connection
    NAS->>SENTINEL: RADIUS Access-Request (PAP credentials)
    SENTINEL->>SENTINEL: Evaluate Policy (status = 'active')
    SENTINEL-->>NAS: RADIUS Access-Accept + MikroTik-Rate-Limit: "50M/100M"
    NAS-->>Customer: Establish Internet Session
```

---

## 2. API Contract Specifications

### 2.1 Access Decision Interface
```typescript
export interface SentinelAccessDecision {
  allowed: boolean;
  reply_code: 'Access-Accept' | 'Access-Reject';
  reject_reason?: string;
  framed_ip_address?: string;
  mikrotik_rate_limit?: string; // e.g. "20M/50M 0/0 0/0 0/0 8"
  session_timeout_seconds?: number;
}
```

### 2.2 Accounting Event Interface
```typescript
export interface SentinelAccountingEvent {
  acct_status_type: 'Start' | 'Stop' | 'Interim-Update';
  acct_session_id: string;
  username: string;
  nas_ip_address: string;
  framed_ip_address?: string;
  input_octets: number;
  output_octets: number;
  session_time_seconds: number;
  terminate_cause?: string;
}
```

