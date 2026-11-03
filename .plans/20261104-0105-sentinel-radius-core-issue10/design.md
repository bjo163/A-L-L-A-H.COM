# Design: SENTINEL Phase 1 — Native RADIUS Protocol Core & Packet Test Suite (Issue #10)

## 1. Packet Wire Format (RFC 2865 Octet Alignment)

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
|  Attributes ... (TLV: Type [1], Length [1], Value [Length-2]) |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 2. Supported Packet Codes
- `1`: `Access-Request`
- `2`: `Access-Accept`
- `3`: `Access-Reject`
- `4`: `Accounting-Request`
- `5`: `Accounting-Response`
- `11`: `Access-Challenge`

