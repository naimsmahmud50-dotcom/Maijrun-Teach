import crypto from "crypto"
import { AdminUser, AdminSession, AdminRole } from "./types"
import { verifyTotp } from "./totp-service"
import { recordAdminAudit } from "./audit"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes short-lived session
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || "maijrun_admin_secret_key_2026"

const adminUsers = new Map<string, AdminUser>()
const adminSessions = new Map<string, AdminSession>()
const pendingTwoFactorLogins = new Map<string, { adminId: string; expiresAt: number }>()

/**
 * Strong Password Policy Validator (min 12 chars, upper, lower, number, special char)
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 12) {
    return { valid: false, message: "Password must be at least 12 characters long." }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character." }
  }
  return { valid: true }
}

/**
 * Hash password with salted HMAC-SHA256
 */
export function hashAdminPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", ADMIN_SECRET).update(`${password}:${salt}`).digest("hex")
}

/**
 * Register or seed admin user
 */
export function registerAdminUser({
  email,
  name,
  password,
  role = "manager",
  totpSecret,
  twoFactorEnabled = true,
}: {
  email: string
  name: string
  password: string
  role?: AdminRole
  totpSecret: string
  twoFactorEnabled?: boolean
}): AdminUser {
  const cleanEmail = email.trim().toLowerCase()
  const salt = crypto.randomBytes(16).toString("hex")
  const passwordHash = hashAdminPassword(password, salt)

  const admin: AdminUser = {
    id: `adm_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    email: cleanEmail,
    name,
    role,
    passwordHash,
    passwordSalt: salt,
    totpSecret,
    twoFactorEnabled,
    failedAttempts: 0,
    createdAt: Date.now(),
  }

  adminUsers.set(cleanEmail, admin)
  return admin
}

/**
 * Step 1: Verify Email and Password
 * Returns a 2FA challenge token on success
 */
export async function authenticateAdminStep1({
  email,
  password,
  ip = "127.0.0.1",
}: {
  email: string
  password: string
  ip?: string
}): Promise<{
  success: boolean
  requires2Fa?: boolean
  challengeToken?: string
  message: string
}> {
  const cleanEmail = email.trim().toLowerCase()
  const admin = adminUsers.get(cleanEmail)

  if (!admin) {
    return { success: false, message: "Invalid administrator credentials." }
  }

  const now = Date.now()

  // 1. Check Lockout
  if (admin.lockedUntil && now < admin.lockedUntil) {
    const remainingMinutes = Math.ceil((admin.lockedUntil - now) / 60000)
    return {
      success: false,
      message: `Account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
    }
  }

  // 2. Verify Password with timingSafeEqual
  const candidateHash = hashAdminPassword(password, admin.passwordSalt)
  const candidateBuf = Buffer.from(candidateHash, "hex")
  const storedBuf = Buffer.from(admin.passwordHash, "hex")

  let isMatch = false
  try {
    if (candidateBuf.length === storedBuf.length) {
      isMatch = crypto.timingSafeEqual(candidateBuf, storedBuf)
    }
  } catch {
    isMatch = false
  }

  if (!isMatch) {
    admin.failedAttempts++
    if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockedUntil = now + LOCKOUT_DURATION_MS
      recordAdminAudit({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "ACCOUNT_LOCKED_BRUTE_FORCE",
        entityType: "auth",
        details: { failedAttempts: admin.failedAttempts, ip },
      })
      return {
        success: false,
        message: "Too many failed attempts. Your account has been locked for 30 minutes.",
      }
    }
    return {
      success: false,
      message: `Invalid credentials. ${MAX_FAILED_ATTEMPTS - admin.failedAttempts} attempts remaining.`,
    }
  }

  // Password correct: reset failed attempts
  admin.failedAttempts = 0
  admin.lockedUntil = undefined

  // 3. Issue short-lived 2FA challenge token (5 min TTL)
  const challengeToken = `2fa_${crypto.randomBytes(24).toString("hex")}`
  pendingTwoFactorLogins.set(challengeToken, {
    adminId: admin.id,
    expiresAt: now + 5 * 60 * 1000,
  })

  return {
    success: true,
    requires2Fa: true,
    challengeToken,
    message: "Password verified. Please provide your 6-digit 2FA authenticator code.",
  }
}

/**
 * Step 2: Verify 2FA TOTP code and issue administrative session
 */
export async function authenticateAdminStep2({
  challengeToken,
  totpCode,
  userAgent = "Admin Console",
  ip = "127.0.0.1",
}: {
  challengeToken: string
  totpCode: string
  userAgent?: string
  ip?: string
}): Promise<{
  success: boolean
  session?: AdminSession
  token?: string
  message: string
}> {
  const challenge = pendingTwoFactorLogins.get(challengeToken)
  if (!challenge || Date.now() > challenge.expiresAt) {
    pendingTwoFactorLogins.delete(challengeToken)
    return { success: false, message: "Authentication challenge expired. Please login again." }
  }

  // Find admin
  let admin: AdminUser | undefined
  for (const u of Array.from(adminUsers.values())) {
    if (u.id === challenge.adminId) {
      admin = u
      break
    }
  }

  if (!admin) {
    return { success: false, message: "Admin user not found." }
  }

  // Verify TOTP
  const isValidTotp = verifyTotp(admin.totpSecret, totpCode)
  if (!isValidTotp) {
    recordAdminAudit({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "2FA_VERIFICATION_FAILED",
      entityType: "auth",
      details: { ip },
    })
    return { success: false, message: "Invalid 6-digit authenticator code." }
  }

  // Invalidate challenge
  pendingTwoFactorLogins.delete(challengeToken)

  const sessionId = `admsess_${Date.now()}_${crypto.randomBytes(12).toString("hex")}`
  const now = Date.now()

  const session: AdminSession = {
    sessionId,
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    userAgent,
    ip,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  }

  adminSessions.set(sessionId, session)
  admin.lastLoginAt = now

  // Sign session token
  const tokenPayload = Buffer.from(
    JSON.stringify({
      sessionId,
      adminId: admin.id,
      role: admin.role,
      exp: session.expiresAt,
    })
  ).toString("base64url")

  const signature = crypto.createHmac("sha256", ADMIN_SECRET).update(tokenPayload).digest("base64url")
  const sessionToken = `${tokenPayload}.${signature}`

  recordAdminAudit({
    adminId: admin.id,
    adminEmail: admin.email,
    action: "ADMIN_LOGIN_SUCCESS",
    entityType: "auth",
    details: { sessionId, role: admin.role, ip },
  })

  return {
    success: true,
    session,
    token: sessionToken,
    message: "Admin authenticated successfully.",
  }
}

/**
 * Validate Admin Session Token and enforce short-lived inactivity timeout
 */
export async function validateAdminSession(sessionToken?: string | null): Promise<{
  valid: boolean
  session?: AdminSession
}> {
  if (!sessionToken || !sessionToken.includes(".")) return { valid: false }

  const [payloadStr, signature] = sessionToken.split(".")
  const expectedSig = crypto.createHmac("sha256", ADMIN_SECRET).update(payloadStr).digest("base64url")

  if (signature !== expectedSig) return { valid: false }

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"))
    const session = adminSessions.get(payload.sessionId)

    if (!session || Date.now() > session.expiresAt) {
      if (session) adminSessions.delete(payload.sessionId)
      return { valid: false }
    }

    // Refresh inactivity TTL on active requests
    session.expiresAt = Date.now() + SESSION_TTL_MS
    return { valid: true, session }
  } catch {
    return { valid: false }
  }
}

/**
 * Invalidate Admin Session (Logout)
 */
export function invalidateAdminSession(sessionId: string): void {
  adminSessions.delete(sessionId)
}

/**
 * RBAC Permission Checker
 */
export function canPerformAdminAction(
  role: AdminRole,
  action: "read" | "create" | "update" | "delete" | "fulfill",
  resource: "products" | "inventory" | "orders" | "coupons" | "admins" | "audit"
): boolean {
  if (role === "owner") return true

  if (role === "manager") {
    // Manager has full access to products, inventory, orders, coupons
    if (["products", "inventory", "orders", "coupons"].includes(resource)) return true
    if (resource === "audit" && action === "read") return true
    return false
  }

  if (role === "staff") {
    // Staff can read orders, products, inventory, and fulfill orders / print slips
    if (["products", "inventory"].includes(resource) && action === "read") return true
    if (resource === "orders" && ["read", "fulfill"].includes(action)) return true
    return false
  }

  return false
}

/**
 * Testing Helpers
 */
export function resetAdminAuthForTests(): void {
  adminUsers.clear()
  adminSessions.clear()
  pendingTwoFactorLogins.clear()
}
