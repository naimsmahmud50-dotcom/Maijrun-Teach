# Feature Specification: Phase 9 — Customer Account, Phone OTP Login, and Live Order Tracking

## 1. Overview & Objectives
Phase 9 delivers a Bangladesh-native authentication and customer account experience for MAIJRUN Tech:
- Passwordless login and registration via verified Bangladesh mobile numbers (`+8801XXXXXXXXX`) with 6-digit cryptographic OTPs and bot prevention.
- Comprehensive customer dashboard managing profile, multi-level BD addresses, order history, saved PC builder configurations, and wishlist.
- Real-time order tracking featuring step-by-step progress timelines and courier parcel dispatch integration with Steadfast and Pathao.
- Strict security adherence to OWASP ASVS L2: anti-IDOR checks, rate limiting, Turnstile verification, constant-time comparisons, masked PII, and privacy controls (export/deletion).

---

## 2. User Stories & Priority

### US1: Passwordless BD Mobile OTP Authentication (P1)
- **As a** Bangladeshi shopper,
- **I want to** log in or register instantly using my mobile number without remembering passwords,
- **So that** I have a fast, frictionless, and secure checkout and account experience.
- **Acceptance Criteria**:
  1. Accepts `01XXXXXXXXX` and `+8801XXXXXXXXX`, validates against BD carrier regex (`013-019`, 11 digits), and normalizes to E.164.
  2. Generates a cryptographically secure 6-digit OTP stored only as a salted HMAC-SHA256 hash at rest.
  3. OTP expires in 5 minutes (300s), single-use only, locked after 5 failed attempts, 60-second resend cooldown.
  4. Rate limited: max 5 sends/number/hour, max 5 sends/IP/day. Daily budget cap enforced.
  5. Cloudflare Turnstile token validation on send-OTP request.
  6. Constant-time timingSafeEqual comparison.
  7. Issues secure, `httpOnly`, `SameSite=strict`, `Secure` session cookies with access and refresh tokens.

### US2: Customer Account Dashboard & Profile (P1)
- **As a** registered customer,
- **I want to** view and manage my profile details, active sessions, and privacy settings,
- **So that** my account remains accurate and under my control.
- **Acceptance Criteria**:
  1. Displays customer full name, optional email, and masked phone number (e.g. `+880 17****-***78`).
  2. View active login sessions with device/browser info, IP (masked), and a "Log out all devices" action.
  3. Strict server-side authorization: users can only read and mutate their own profile.

### US3: Bangladesh Address Book (P2)
- **As a** customer,
- **I want to** save multiple delivery addresses with Division, District, and Upazila hierarchy,
- **So that** I can complete checkout with a single click without retyping address details.
- **Acceptance Criteria**:
  1. Address model supports Division, District (64 districts), Upazila/Thana, Street address, and optional Postal Code.
  2. Set default shipping address.
  3. IDOR protection: every mutation verifies `address.customerId === currentUserId`.

### US4: Order History, Saved PC Builds & Wishlist (P2)
- **As a** customer,
- **I want to** review my past orders, inspect item details, reload my saved custom PC builds, and manage my wishlist,
- **So that** I can easily re-order or continue my PC building journey.
- **Acceptance Criteria**:
  1. Order history displays order ID, date, status, item summary, and total in BDT.
  2. Integrates with Phase 6 PC Builder saved builds: shows saved configurations with one-click reload.
  3. Product wishlist support (add/remove from product preview and detail pages).
  4. Accessing another user's order yields 403 Forbidden.

### US5: Live Order Tracking with Courier Integration (P1)
- **As a** customer or guest shopper,
- **I want to** track the real-time shipping status and courier progress of my parcel,
- **So that** I know exactly when my PC parts or laptop will arrive.
- **Acceptance Criteria**:
  1. Visual status timeline: `Order Placed` -> `Processing` -> `Shipped` -> `Delivered` (with `Cancelled` and `Returned` indicators).
  2. Courier abstraction with adapters for Steadfast Courier and Pathao Courier.
  3. Webhook endpoint `/api/courier/webhook/[provider]` with secret and signature verification.
  4. Stores consignment ID, tracking code, courier status, and timestamped progress events.
  5. Notification trigger (SMS/Email stub) on state transitions.

### US6: Guest Order Tracking & IDOR Protection (P2)
- **As a** guest customer who did not log in,
- **I want to** track my order using my Order ID and Phone Number,
- **So that** I stay updated on delivery progress without creating an account.
- **Acceptance Criteria**:
  1. Dedicated `/track` page taking Order ID and Bangladesh phone number.
  2. Rate-limited to 10 queries/min/IP to prevent brute-force order enumeration.
  3. Non-sequential, unguessable Order IDs (e.g. `MJR-2026-X8K9P2`).
  4. Sensitive customer details (full address, full phone) are masked on the guest tracking view.

### US7: Privacy by Design & Security Audit Logging (P3)
- **As a** privacy-conscious customer,
- **I want to** export all my personal data or delete my account upon request,
- **So that** my data privacy rights are respected.
- **Acceptance Criteria**:
  1. `GET /api/account/export`: returns complete JSON archive of profile, addresses, and orders.
  2. `DELETE /api/account/me`: permanently deletes or anonymizes customer data.
  3. Centralized audit logging for login attempts, OTP verifications, device revocations, and courier callbacks.
