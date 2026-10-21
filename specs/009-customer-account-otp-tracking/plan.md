# Implementation Plan: Phase 9 — Customer Account, Phone OTP Login, and Live Order Tracking

## 1. Architectural Strategy & Modules

### A. Auth & OTP Engine (`src/lib/auth/`)
- **BD Phone Validation & Normalization**: Reuses proven `validateBangladeshPhone` and normalizes to standard `+8801XXXXXXXXX`.
- **Crypto-Secure OTP Service**:
  - `crypto.randomInt(100000, 1000000)` generates unguessable 6-digit numbers.
  - Salted HMAC-SHA256 hash stored at rest.
  - Expiry set to 300 seconds (5 minutes).
  - Attempt counter (locked out at > 5 failures).
  - Rate limiting via sliding window: 5 sends / phone / hour, 5 sends / IP / day, 60-second resend cooldown.
  - Constant-time verification using `crypto.timingSafeEqual`.
  - Cloudflare Turnstile bot verification adapter.
  - Daily SMS budget counter (alert threshold).
- **SMS Provider Abstraction (`src/lib/auth/sms/`)**:
  - Interface: `SmsProvider` with `sendOtp(phone, otp): Promise<SmsSendResult>`
  - Implementations: `MockSmsProvider`, `SslWirelessProvider`, `BulkSmsBdProvider`, `TwilioProvider`.
  - Factory pattern based on `SMS_GATEWAY_PROVIDER`.
- **Session & Device Security (`src/lib/auth/session.ts`)**:
  - HMAC signed session tokens with rotating refresh tokens.
  - `httpOnly`, `SameSite=strict`, `Secure` cookie issuance.
  - Multi-session registry tracking device user agent, IP hash, and last active time.
  - "Log out all devices" revoking all sessions for customer ID.
- **Audit Logger (`src/lib/auth/audit-logger.ts`)**:
  - Logs authentication events, OTP failures, and security alerts with masked phone and masked IP.

### B. Account & Privacy Management (`src/lib/account/`)
- **Customer Data Models**:
  - Profile (name, optional email, verified phone).
  - Addresses with Bangladesh administrative hierarchy (Division, District, Upazila/Thana).
  - Wishlist and saved PC builds references.
- **Authorization & Anti-IDOR Enforcement**:
  - Every mutation and query validates session customer ID against resource customer ID.
  - Returns 403 Forbidden on mismatch.
- **Privacy by Design**:
  - Data export endpoint generating standardized JSON dump.
  - Account deletion endpoint with anonymization.

### C. Live Order Tracking & Courier Engine (`src/lib/tracking/`)
- **Tracking Timeline States**:
  - `ORDER_PLACED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` (plus `CANCELLED`, `RETURNED`).
- **Courier Provider Abstraction (`src/lib/tracking/courier/`)**:
  - Interface: `CourierProvider` with `createParcel(order)`, `trackParcel(consignmentId)`, `verifyWebhookSignature(payload, signature)`.
  - Implementations: `MockCourierProvider`, `SteadfastCourierProvider`, `PathaoCourierProvider`.
- **Webhook & Polling Handlers**:
  - `/api/courier/webhook/[provider]` with cryptographic signature/secret verification.
  - Updates order status, records timeline event with timestamp.
- **Guest Tracking**:
  - `/track` query route: requires matching `orderId` and `phone`.
  - Rate-limited to prevent brute-force order scanning.
  - Non-sequential, unguessable IDs (e.g. `MJR-2026-X8K9P2`).

---

## 2. Directory Structure & Planned Files

```
storefront/
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── types.ts
│   │   │   ├── otp-service.ts
│   │   │   ├── session.ts
│   │   │   ├── audit-logger.ts
│   │   │   └── sms/
│   │   │       ├── types.ts
│   │   │       ├── factory.ts
│   │   │       └── providers/
│   │   │           ├── mock.ts
│   │   │           ├── sslwireless.ts
│   │   │           ├── bulksmsbd.ts
│   │   │           └── twilio.ts
│   │   ├── account/
│   │   │   ├── types.ts
│   │   │   ├── account-store.ts
│   │   │   └── privacy.ts
│   │   ├── tracking/
│   │   │   ├── types.ts
│   │   │   ├── tracking-store.ts
│   │   │   └── courier/
│   │   │       ├── types.ts
│   │   │       ├── factory.ts
│   │   │       └── providers/
│   │   │           ├── mock.ts
│   │   │           ├── steadfast.ts
│   │   │           └── pathao.ts
│   │   └── __tests__/
│   │       ├── otp-auth.test.ts
│   │       ├── order-tracking.test.ts
│   │       └── account-security.test.ts
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── otp/
│   │   │   │   │   ├── send/route.ts
│   │   │   │   │   └── verify/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── logout-all/route.ts
│   │   │   ├── account/
│   │   │   │   ├── me/route.ts
│   │   │   │   ├── export/route.ts
│   │   │   │   └── addresses/route.ts
│   │   │   └── courier/
│   │   │       └── webhook/[provider]/route.ts
│   │   └── [countryCode]/
│   │       └── (main)/
│   │           └── track/page.tsx
│   └── modules/
│       ├── account/
│       │   └── components/
│       │       └── phone-otp-login/index.tsx
│       └── tracking/
│           └── templates/
│               └── index.tsx
```

---

## 3. Verification & Testing Strategy
- Unit tests validating every security boundary and business rule.
- Running full `npm test` across all suites (target 75+ tests).
- Production TypeScript check (`npx tsc --noEmit`).
- Production build compilation (`npm run build`).
- Live curl checks on auth and tracking endpoints.
