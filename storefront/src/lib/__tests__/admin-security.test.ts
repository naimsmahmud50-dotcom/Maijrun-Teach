import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotp,
  generateTotpUri,
} from "../admin/totp-service"
import {
  validatePasswordStrength,
  registerAdminUser,
  authenticateAdminStep1,
  authenticateAdminStep2,
  validateAdminSession,
  canPerformAdminAction,
  resetAdminAuthForTests,
} from "../admin/admin-auth"
import { getAdminAuditLogs, clearAdminAuditLogsForTests } from "../admin/audit"

describe("Phase 10: Admin Security & 2FA Tests", () => {
  beforeEach(() => {
    resetAdminAuthForTests()
    clearAdminAuditLogsForTests()
  })

  describe("1. RFC 6238 TOTP 2FA Engine", () => {
    it("should generate a valid 32-character Base32 TOTP secret", () => {
      const secret = generateTotpSecret()
      assert.strictEqual(typeof secret, "string")
      assert.strictEqual(secret.length, 32)
      assert.match(secret, /^[A-Z2-7]+$/)
    })

    it("should generate a 6-digit TOTP code and successfully verify it", () => {
      const secret = generateTotpSecret()
      const code = generateTotpCode(secret)

      assert.strictEqual(code.length, 6)
      assert.match(code, /^\d{6}$/)

      const isValid = verifyTotp(secret, code)
      assert.strictEqual(isValid, true)
    })

    it("should reject invalid or incorrect TOTP codes", () => {
      const secret = generateTotpSecret()
      assert.strictEqual(verifyTotp(secret, "000000"), false)
      assert.strictEqual(verifyTotp(secret, "12345"), false)
      assert.strictEqual(verifyTotp(secret, "abcdef"), false)
    })

    it("should generate standard otpauth URI for Google Authenticator", () => {
      const secret = "JBSWY3DPEHPK3PXP"
      const uri = generateTotpUri({
        secret,
        accountName: "admin@maijrun.com",
        issuer: "MAIJRUN Tech",
      })

      assert.ok(uri.startsWith("otpauth://totp/MAIJRUN%20Tech:admin@maijrun.com?"))
      assert.ok(uri.includes("secret=JBSWY3DPEHPK3PXP"))
      assert.ok(uri.includes("issuer=MAIJRUN%20Tech"))
    })
  })

  describe("2. Strong Password Policy & Lockout", () => {
    it("should enforce OWASP ASVS password strength requirements", () => {
      // Too short (<12 chars)
      assert.strictEqual(validatePasswordStrength("Short1!").valid, false)

      // Missing uppercase
      assert.strictEqual(validatePasswordStrength("alllowercase123!@#").valid, false)

      // Missing lowercase
      assert.strictEqual(validatePasswordStrength("ALLLUPPERCASE123!@#").valid, false)

      // Missing number
      assert.strictEqual(validatePasswordStrength("NoNumbersHere!@#$").valid, false)

      // Missing special character
      assert.strictEqual(validatePasswordStrength("NoSpecialChar12345").valid, false)

      // Valid strong password (>= 12 chars, upper, lower, digit, symbol)
      assert.strictEqual(validatePasswordStrength("MaijrunAdmin2026!#").valid, true)
    })

    it("should lock account after 5 consecutive failed login attempts for 30 minutes", async () => {
      const email = "manager@maijrun.com"
      const password = "MaijrunStrongPass2026!"
      const totpSecret = generateTotpSecret()

      registerAdminUser({
        email,
        name: "Inventory Manager",
        password,
        role: "manager",
        totpSecret,
      })

      // Attempt 1 to 4: Should fail with remaining count
      for (let i = 1; i <= 4; i++) {
        const res = await authenticateAdminStep1({ email, password: "WrongPassword123!" })
        assert.strictEqual(res.success, false)
        assert.ok(res.message.includes(`${5 - i} attempts remaining`))
      }

      // Attempt 5: Account should lock
      const lockRes = await authenticateAdminStep1({ email, password: "WrongPassword123!" })
      assert.strictEqual(lockRes.success, false)
      assert.ok(lockRes.message.includes("locked for 30 minutes"))

      // Attempt 6 (even with correct password): Must remain locked
      const blockedRes = await authenticateAdminStep1({ email, password })
      assert.strictEqual(blockedRes.success, false)
      assert.ok(blockedRes.message.includes("temporarily locked"))

      // Verify audit log captured brute force lockout
      const audits = getAdminAuditLogs()
      const lockoutAudit = audits.find((a) => a.action === "ACCOUNT_LOCKED_BRUTE_FORCE")
      assert.ok(lockoutAudit)
      assert.strictEqual(lockoutAudit?.adminEmail, email)
    })
  })

  describe("3. Two-Step 2FA Authentication Flow & Inactivity Session", () => {
    it("should require 2FA TOTP verification after password validation", async () => {
      const email = "owner@maijrun.com"
      const password = "MaijrunOwnerPass2026!"
      const totpSecret = generateTotpSecret()

      registerAdminUser({
        email,
        name: "Shop Owner",
        password,
        role: "owner",
        totpSecret,
      })

      // Step 1: Password authentication
      const step1 = await authenticateAdminStep1({ email, password })
      assert.strictEqual(step1.success, true)
      assert.strictEqual(step1.requires2Fa, true)
      assert.ok(step1.challengeToken)

      // Step 2: Invalid TOTP should fail
      const badStep2 = await authenticateAdminStep2({
        challengeToken: step1.challengeToken!,
        totpCode: "000000",
      })
      assert.strictEqual(badStep2.success, false)
      assert.strictEqual(badStep2.message, "Invalid 6-digit authenticator code.")

      // Step 2: Valid TOTP should succeed and return signed token
      const validCode = generateTotpCode(totpSecret)
      const goodStep2 = await authenticateAdminStep2({
        challengeToken: step1.challengeToken!,
        totpCode: validCode,
      })
      assert.strictEqual(goodStep2.success, true)
      assert.ok(goodStep2.token)
      assert.strictEqual(goodStep2.session?.email, email)
      assert.strictEqual(goodStep2.session?.role, "owner")

      // Verify session token
      const sessionCheck = await validateAdminSession(goodStep2.token)
      assert.strictEqual(sessionCheck.valid, true)
      assert.strictEqual(sessionCheck.session?.email, email)
    })

    it("should reject tampered or expired session tokens", async () => {
      assert.strictEqual((await validateAdminSession("invalid.token")).valid, false)
      assert.strictEqual((await validateAdminSession(null)).valid, false)
      assert.strictEqual((await validateAdminSession(undefined)).valid, false)
    })
  })

  describe("4. Role-Based Access Control (RBAC) Matrices", () => {
    it("should grant Owner unrestricted permissions across all resources", () => {
      assert.strictEqual(canPerformAdminAction("owner", "delete", "products"), true)
      assert.strictEqual(canPerformAdminAction("owner", "delete", "orders"), true)
      assert.strictEqual(canPerformAdminAction("owner", "create", "admins"), true)
      assert.strictEqual(canPerformAdminAction("owner", "read", "audit"), true)
    })

    it("should enforce Manager permissions (products, orders, inventory, coupons, audit read-only, no admin management)", () => {
      assert.strictEqual(canPerformAdminAction("manager", "update", "products"), true)
      assert.strictEqual(canPerformAdminAction("manager", "update", "inventory"), true)
      assert.strictEqual(canPerformAdminAction("manager", "fulfill", "orders"), true)
      assert.strictEqual(canPerformAdminAction("manager", "read", "audit"), true)

      // Manager cannot manage admin users or delete audit logs
      assert.strictEqual(canPerformAdminAction("manager", "create", "admins"), false)
      assert.strictEqual(canPerformAdminAction("manager", "delete", "audit"), false)
    })

    it("should restrict Staff to operational order fulfillment and read-only views", () => {
      assert.strictEqual(canPerformAdminAction("staff", "read", "products"), true)
      assert.strictEqual(canPerformAdminAction("staff", "read", "orders"), true)
      assert.strictEqual(canPerformAdminAction("staff", "fulfill", "orders"), true)

      // Staff cannot adjust inventory directly, modify coupons, or view audit logs
      assert.strictEqual(canPerformAdminAction("staff", "update", "inventory"), false)
      assert.strictEqual(canPerformAdminAction("staff", "create", "coupons"), false)
      assert.strictEqual(canPerformAdminAction("staff", "read", "audit"), false)
      assert.strictEqual(canPerformAdminAction("staff", "create", "admins"), false)
    })
  })
})
