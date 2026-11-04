---
status: "proposed"
---
# Architectural Design: Sentinel Standalone Microservice Daemon (`apps/sentinel`) & High-Performance UDP RADIUS Service

## 1. System Topology & Flow Architecture
```mermaid
flowchart TD
    NAS[MikroTik RouterOS / NAS] -->|UDP 1812: Access-Request| AuthSocket[Sentinel Auth Socket: 1812]
    NAS -->|UDP 1813: Accounting-Request| AcctSocket[Sentinel Acct Socket: 1813]
    
    subgraph SentinelService [apps/sentinel Daemon]
        AuthSocket --> PacketParser[RFC 2865 Binary Parser]
        PacketParser --> SecretCheck{Verify NAS Secret from nexus.nas cache}
        SecretCheck -- Valid --> AuthEngine[PAP / CHAP Authenticator]
        
        AuthEngine --> AccountLookup{Check sentinel.account}
        AccountLookup -- Active & Valid --> AcceptGen[Generate Access-Accept + MikroTik-Rate-Limit]
        AccountLookup -- Invalid / Suspended --> RejectGen[Generate Access-Reject]
        
        AcctSocket --> AcctParser[RFC 2866 Binary Parser]
        AcctParser --> Deduplicator{Check Packet Deduplication Cache}
        Deduplicator -- New Packet --> SessionWriter[Write to sentinel.session & metrics]
        Deduplicator -- Duplicate --> FastAck[Send Acct-Response Immediately]
        
        CoAEngine[RFC 3576 Disconnect Client] -->|UDP 3799: Disconnect-Request| NAS
    end

    AcceptGen -->|UDP 1812: Access-Accept| NAS
    RejectGen -->|UDP 1812: Access-Reject| NAS
    SessionWriter --> DB[(PGlite Database via @allah/arsy-orm)]
    SessionWriter --> PubSub[Redis Pub/Sub Network Events]
```

## 2. Packet Buffer Layout (RFC 2865)
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Code      |  Identifier   |            Length             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|                         Authenticator                         |
|                           (16 octets)                         |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Attributes ...
```

## 3. MikroTik Rate Limit VSA Specification
- **Vendor ID**: `14988` (MikroTik)
- **Attribute Type**: `1` (`MikroTik-Rate-Limit`)
- **Format**: `rx-rate[/tx-rate] [rx-burst-rate[/tx-burst-rate]] ...`
- **Example Value**: `"20M/50M"` (20 Mbps upload, 50 Mbps download)

## 4. Port Allocations
- UDP `1812`: RADIUS Authentication & Authorization.
- UDP `1813`: RADIUS Accounting.
- UDP `3799`: RADIUS CoA / Disconnect-Request (outbound from Sentinel to NAS).
- HTTP `9181`: Sentinel Observability & Health (`/metrics`, `/healthz`).
