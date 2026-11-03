# Design: NEXUS Phase 1 — Network Inventory & MikroTik NAS Registry Foundation (Issue #8)

## 1. Domain Entity Relationship Diagram

```mermaid
erDiagram
    TENANT ||--o{ SITE : owns
    SITE ||--o{ DEVICE : hosts
    DEVICE ||--o{ NAS : operates
    NAS ||--o{ IP_POOL : allocates
    NAS ||--o{ SECRET_AUDIT_LOG : tracks

    SITE {
        int id
        string name
        string code
        string address
        string company_id
    }
    DEVICE {
        int id
        string name
        string vendor
        string model
        string routeros_version
        string management_ip
        string serial_number
    }
    NAS {
        int id
        string nas_identifier
        string ip_address
        string encrypted_secret
        int coa_port
        string source_allowlist
        boolean is_active
    }
    IP_POOL {
        int id
        string name
        string cidr
        string gateway
        string dns_servers
    }
    SECRET_AUDIT_LOG {
        int id
        int nas_id
        string rotated_by
        datetime rotated_at
    }
```

---

## 2. API Schema Contracts

### 2.1 NAS Creation Request (`POST /v1/nexus/nas`)
```json
{
  "nas_identifier": "mikrotik-ccr2004-pop-a",
  "ip_address": "192.168.88.1",
  "secret": "s3cure-sh4red-k3y",
  "vendor": "mikrotik",
  "coa_port": 3799,
  "source_allowlist": ["192.168.88.0/24"],
  "site_id": 1
}
```

### 2.2 Redacted Response Envelope
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nas_identifier": "mikrotik-ccr2004-pop-a",
    "ip_address": "192.168.88.1",
    "secret": "[REDACTED]",
    "vendor": "mikrotik",
    "coa_port": 3799,
    "source_allowlist": ["192.168.88.0/24"],
    "site_id": 1,
    "created_at": "2026-11-04T00:54:00Z"
  }
}
```

