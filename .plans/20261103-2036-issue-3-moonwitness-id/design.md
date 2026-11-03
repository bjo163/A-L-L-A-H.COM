---
title: "Design: MoonWitness ID (apps/id)"
date: "2026-11-03"
plan: "20261103-2036-issue-3-moonwitness-id"
---

# UI/UX & API Design Specification: MoonWitness ID

## 1. Aesthetic Direction: "Empire of the Light"
- **Visual Tone**: Deep obsidian backgrounds (`bg-neutral-950`), refined slate cards (`bg-neutral-900/60` with `backdrop-blur-md`), sharp borders (`border-neutral-800`), cinematic typography, and high-contrast amber/gold brand highlights.
- **Micro-interactions**: Subtle hover state glows, tactile button click feedback, crisp keyboard navigation focus rings (`ring-2 ring-amber-500/50`).
- **Bilingual Interface**: Seamless language switcher toggle (Bahasa Indonesia `ID` / English `EN`) persisted via cookie or localStorage.

## 2. Information Architecture (`apps/id`)

```
/ (Root)
 ├── /login                 -> Sign-in with Email & Password, Magic Link option
 ├── /register              -> Self-service Registration with validation indicators
 ├── /forgot-password       -> Email recovery request
 ├── /reset-password        -> New password submission via recovery token
 └── /account               -> Account Center (Protected Route)
      ├── /overview         -> Profile details (Name, Email, Account Status)
      ├── /security         -> Password change, 2FA/Passkey status
      ├── /sessions         -> Active sessions list with IP, Device, and Live "Revoke" button
      └── /connected-apps   -> Ecosystem apps with authorized access
```

## 3. Component Specs

### 3.1. Active Sessions List Table
- **Device & Browser**: Parsed User-Agent (e.g. `Chrome on macOS`, `Firefox on Windows`).
- **IP Address & Location**: Masked IP with geographic country indicator.
- **Current Badge**: Highlight active session with `Current Device` pill.
- **Action**: "Revoke Session" button triggering `POST /api/auth/sessions/revoke`.

### 3.2. Standard Form Field Design
- Floating label with clear focus indicator.
- Inline validation messages (prevent generic toasts when inline is clearer).
- Password input with accessible toggle visibility eye icon.

## 4. API Request/Response Schemas

All API communication with `apps/arsy` conforms to the canonical envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}
```

