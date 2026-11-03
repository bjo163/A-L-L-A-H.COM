# Design: SENTINEL Phase 2 — MikroTik PPPoE PAP Authentication End-to-End (Issue #11)

## 1. MikroTik VSA Encoding Layout

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Type (26)   |    Length     |       Vendor-Id (14988)       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Vendor-Id (cont.)       |  VSA-Type (8) |  VSA-Length   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| String Value: "20M/50M" ...                                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 2. Rate-Limit Formatting Syntax
- Simple: `rx-rate/tx-rate` (e.g. `20M/50M` = 20 Mbps upload, 50 Mbps download).
- With Burst: `rx-rate/tx-rate rx-burst/tx-burst rx-thresh/tx-thresh burst-time priority`.

