# Tasks: Phase 9 — Customer Account, Phone OTP Login, and Live Order Tracking

## Phase 1: Setup & Data Modeling
- [x] T001 [P] Create auth and session types in `storefront/src/lib/auth/types.ts`
- [x] T002 [P] Create account and address types in `storefront/src/lib/account/types.ts`
- [x] T003 [P] Create tracking and courier types in `storefront/src/lib/tracking/types.ts`

## Phase 2: SMS Gateway Abstraction & OTP Service (User Story 1)
- [x] T004 [P] [US1] Create SMS provider interface in `storefront/src/lib/auth/sms/types.ts`
- [x] T005 [P] [US1] Implement Mock SMS provider for sandbox & tests in `storefront/src/lib/auth/sms/providers/mock.ts`
- [x] T006 [P] [US1] Implement SSL Wireless SMS provider adapter in `storefront/src/lib/auth/sms/providers/sslwireless.ts`
- [x] T007 [P] [US1] Implement BulkSMSBD provider adapter in `storefront/src/lib/auth/sms/providers/bulksmsbd.ts`
- [x] T008 [P] [US1] Implement Twilio SMS provider adapter in `storefront/src/lib/auth/sms/providers/twilio.ts`
- [x] T009 [US1] Implement SMS provider factory in `storefront/src/lib/auth/sms/factory.ts`
- [x] T010 [US1] Implement crypto OTP service with hashing, constant-time verification, rate limits, and Turnstile check in `storefront/src/lib/auth/otp-service.ts`
- [x] T011 [US1] Implement Send OTP API route in `storefront/src/app/api/auth/otp/send/route.ts`
- [x] T012 [US1] Implement Verify OTP & Session Issuance API route in `storefront/src/app/api/auth/otp/verify/route.ts`

## Phase 3: Session Security & Customer Dashboard (User Story 2 & 3)
- [x] T013 [P] [US2] Implement secure session management with rotating refresh tokens and device registry in `storefront/src/lib/auth/session.ts`
- [x] T014 [US2] Implement Logout and Logout-All-Devices API routes in `storefront/src/app/api/auth/logout/route.ts` and `storefront/src/app/api/auth/logout-all/route.ts`
- [x] T015 [US2] Implement Phone OTP Login UI component with 60s cooldown timer and BD number format in `storefront/src/modules/account/components/phone-otp-login/index.tsx`
- [x] T016 [US3] Implement Customer Account & Address Store with IDOR ownership validation in `storefront/src/lib/account/account-store.ts`
- [x] T017 [US3] Implement Account Profile & Addresses API routes in `storefront/src/app/api/account/me/route.ts` and `storefront/src/app/api/account/addresses/route.ts`

## Phase 4: Order History, Saved Builds & Wishlist (User Story 4)
- [x] T018 [US4] Implement customer order history API with ownership checks in `storefront/src/app/api/account/orders/route.ts`
- [x] T019 [US4] Link saved PC builder configurations to authenticated customer accounts in `storefront/src/lib/account/account-store.ts`

## Phase 5: Live Order Tracking & Courier Engine (User Story 5 & 6)
- [x] T020 [P] [US5] Implement Mock Courier provider for sandbox and tests in `storefront/src/lib/tracking/courier/providers/mock.ts`
- [x] T021 [P] [US5] Implement Steadfast Courier provider adapter in `storefront/src/lib/tracking/courier/providers/steadfast.ts`
- [x] T022 [P] [US5] Implement Pathao Courier provider adapter in `storefront/src/lib/tracking/courier/providers/pathao.ts`
- [x] T023 [US5] Implement Courier factory in `storefront/src/lib/tracking/courier/factory.ts`
- [x] T024 [US5] Implement Order Tracking Store with notification queue in `storefront/src/lib/tracking/tracking-store.ts`
- [x] T025 [US5] Implement Courier Webhook endpoint with signature verification in `storefront/src/app/api/courier/webhook/[provider]/route.ts`
- [x] T026 [US6] Implement Guest Order Tracking API with rate limiting in `storefront/src/app/api/tracking/[orderId]/route.ts`
- [x] T027 [US5] Implement Live Tracking UI template with status timeline in `storefront/src/modules/tracking/templates/index.tsx`
- [x] T028 [US6] Implement Track Page route in `storefront/src/app/[countryCode]/(main)/track/page.tsx`

## Phase 6: Privacy by Design, Audit Logging & Security Hardening (User Story 7)
- [x] T029 [P] [US7] Implement structured audit logger with phone and IP masking in `storefront/src/lib/auth/audit-logger.ts`
- [x] T030 [US7] Implement Data Export and Account Deletion endpoints in `storefront/src/app/api/account/export/route.ts` and `storefront/src/lib/account/privacy.ts`

## Phase 7: Automated Tests & Verification
- [x] T031 [P] Create comprehensive OTP Auth unit tests in `storefront/src/lib/__tests__/otp-auth.test.ts`
- [x] T032 [P] Create Order Tracking and Courier webhook unit tests in `storefront/src/lib/__tests__/order-tracking.test.ts`
- [x] T033 [P] Create Account IDOR and Privacy unit tests in `storefront/src/lib/__tests__/account-security.test.ts`
- [x] T034 Execute test suite (`npm test`) and verify 100% pass rate
- [x] T035 Execute TypeScript strict check (`npx tsc --noEmit`) and production build (`npm run build`)
- [x] T036 Commit changes with message `phase-9: customer account, phone otp login, and live order tracking`
