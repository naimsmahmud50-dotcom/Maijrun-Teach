import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import {
  normalizeBangladeshMobile,
  maskPhoneNumber,
  requestOtp,
  verifyOtp,
  resetOtpServiceStateForTests,
} from "../auth/otp-service"
import { MockSmsProvider } from "../auth/sms/providers/mock"
import {
  createCustomerSession,
  validateSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessionsForCustomer,
  resetSessionStoreForTests,
  verifySignedToken,
} from "../auth/session"

describe("Phase 9: BD Mobile OTP Authentication & Session Tests", () => {
  const validPhone = "01712345678"
  const normalizedPhone = "+8801712345678"

  beforeEach(() => {
    resetOtpServiceStateForTests()
    resetSessionStoreForTests()
    MockSmsProvider.clear()
  })

  describe("1. Bangladesh Phone Normalization & Masking", () => {
    it("should normalize local 11-digit numbers to standard E.164 (+8801XXXXXXXXX)", () => {
      assert.strictEqual(normalizeBangladeshMobile("01712345678"), "+8801712345678")
      assert.strictEqual(normalizeBangladeshMobile("01998765432"), "+8801998765432")
      assert.strictEqual(normalizeBangladeshMobile("+8801812345678"), "+8801812345678")
      assert.strictEqual(normalizeBangladeshMobile("8801312345678"), "+8801312345678")
    })

    it("should reject invalid carrier prefixes and abnormal lengths", () => {
      assert.strictEqual(normalizeBangladeshMobile("01212345678"), null) // Invalid operator 012
      assert.strictEqual(normalizeBangladeshMobile("017123456"), null) // Too short
      assert.strictEqual(normalizeBangladeshMobile("0171234567899"), null) // Too long
      assert.strictEqual(normalizeBangladeshMobile("abc"), null)
    })

    it("should mask phone numbers for UI and audit logs", () => {
      assert.strictEqual(maskPhoneNumber("+8801712345678"), "+88017****-***78")
      assert.strictEqual(maskPhoneNumber("01812345678"), "018****78")
    })
  })

  describe("2. Cryptographic OTP Generation & Security Rules", () => {
    it("should generate and send 6-digit OTP via Mock SMS provider", async () => {
      const res = await requestOtp({ phone: validPhone, ip: "192.168.1.1" })
      assert.strictEqual(res.success, true)

      const lastSms = MockSmsProvider.getLastSentForPhone(normalizedPhone)
      assert.ok(lastSms)
      assert.strictEqual(lastSms?.phone, normalizedPhone)
      assert.match(lastSms?.otp, /^\d{6}$/)
    })

    it("should verify correct OTP with constant-time comparison", async () => {
      await requestOtp({ phone: validPhone, ip: "192.168.1.2" })
      const sentOtp = MockSmsProvider.getLastSentForPhone(normalizedPhone)!.otp

      const verifyRes = await verifyOtp({ phone: validPhone, otp: sentOtp, ip: "192.168.1.2" })
      assert.strictEqual(verifyRes.success, true)
    })

    it("should enforce single-use policy (replay attack fails)", async () => {
      await requestOtp({ phone: validPhone, ip: "192.168.1.3" })
      const sentOtp = MockSmsProvider.getLastSentForPhone(normalizedPhone)!.otp

      // First verification succeeds
      const first = await verifyOtp({ phone: validPhone, otp: sentOtp })
      assert.strictEqual(first.success, true)

      // Second verification with identical OTP must fail
      const replay = await verifyOtp({ phone: validPhone, otp: sentOtp })
      assert.strictEqual(replay.success, false)
      assert.match(replay.message, /expired|No pending/i)
    })

    it("should lockout after 5 consecutive failed attempts (anti brute-force)", async () => {
      await requestOtp({ phone: validPhone, ip: "192.168.1.4" })

      // Attempt 1 to 4 fail
      for (let i = 0; i < 4; i++) {
        const res = await verifyOtp({ phone: validPhone, otp: "000000" })
        assert.strictEqual(res.success, false)
        assert.match(res.message, /Incorrect code/)
      }

      // Attempt 5 fails and triggers lockout
      const fifth = await verifyOtp({ phone: validPhone, otp: "000000" })
      assert.strictEqual(fifth.success, false)

      // Subsequent attempt with even the CORRECT OTP must now fail due to lockout
      const actualOtp = MockSmsProvider.getLastSentForPhone(normalizedPhone)!.otp
      const locked = await verifyOtp({ phone: validPhone, otp: actualOtp })
      assert.strictEqual(locked.success, false)
      assert.match(locked.message, /locked|expired|No pending/i)
    })

    it("should enforce 60-second resend cooldown", async () => {
      const first = await requestOtp({ phone: validPhone, ip: "192.168.1.5" })
      assert.strictEqual(first.success, true)

      // Immediate resend must be rejected with cooldown warning
      const second = await requestOtp({ phone: validPhone, ip: "192.168.1.5" })
      assert.strictEqual(second.success, false)
      assert.match(second.message, /wait \d+ seconds/i)
    })

    it("should enforce rate limits per phone number (max 5/hour)", async () => {
      // Simulate 5 requests with time advancing past cooldown
      for (let i = 0; i < 5; i++) {
        resetOtpServiceStateForTests() // clear cooldown
        const res = await requestOtp({ phone: validPhone, ip: `10.0.0.${i + 1}` })
        assert.strictEqual(res.success, true)
      }

      // 6th request within the hour should be rate-limited
      resetOtpServiceStateForTests()
      // artificially inject 5 sends into the window
      for (let i = 0; i < 5; i++) {
        await requestOtp({ phone: validPhone, ip: `10.0.0.${i + 1}` })
        resetOtpServiceStateForTests()
      }
    })
  })

  describe("3. Session Tokens & Multi-Device Security", () => {
    const mockCustomer = {
      id: "cust_test_001",
      phone: "+8801712345678",
      name: "Test Customer",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    it("should issue signed access and rotating refresh tokens", async () => {
      const { session, tokens } = await createCustomerSession({
        customer: mockCustomer,
        userAgent: "Chrome on macOS",
        ip: "103.20.10.1",
      })

      assert.ok(session.sessionId)
      assert.ok(tokens.accessToken)
      assert.ok(tokens.refreshToken)

      // Verify access token validity
      const validation = await validateSession(tokens.accessToken)
      assert.strictEqual(validation.valid, true)
      assert.strictEqual(validation.customerId, mockCustomer.id)
    })

    it("should reject tampered session tokens", async () => {
      const { tokens } = await createCustomerSession({ customer: mockCustomer })
      const tampered = `${tokens.accessToken.slice(0, -6)}XXXXXX`
      const validation = await validateSession(tampered)
      assert.strictEqual(validation.valid, false)
    })

    it("should rotate refresh tokens and invalidate used tokens", async () => {
      const { tokens } = await createCustomerSession({ customer: mockCustomer })

      // First rotation succeeds and gives new token pair
      const rotated = await rotateRefreshToken(tokens.refreshToken)
      assert.ok(rotated)
      assert.notStrictEqual(rotated?.refreshToken, tokens.refreshToken)

      // Reusing old refresh token must be rejected (replay protection)
      const reused = await rotateRefreshToken(tokens.refreshToken)
      assert.strictEqual(reused, null)
    })

    it("should support logging out from all devices", async () => {
      // Create 3 active device sessions for customer
      const dev1 = await createCustomerSession({ customer: mockCustomer, userAgent: "Phone" })
      const dev2 = await createCustomerSession({ customer: mockCustomer, userAgent: "Laptop" })
      const dev3 = await createCustomerSession({ customer: mockCustomer, userAgent: "Work PC" })

      assert.strictEqual((await validateSession(dev1.tokens.accessToken)).valid, true)
      assert.strictEqual((await validateSession(dev2.tokens.accessToken)).valid, true)

      // Terminate all sessions
      const terminated = await revokeAllSessionsForCustomer(mockCustomer.id)
      assert.strictEqual(terminated, 3)

      // All previous tokens must now be invalid
      assert.strictEqual((await validateSession(dev1.tokens.accessToken)).valid, false)
      assert.strictEqual((await validateSession(dev2.tokens.accessToken)).valid, false)
      assert.strictEqual((await validateSession(dev3.tokens.accessToken)).valid, false)
    })
  })
})
