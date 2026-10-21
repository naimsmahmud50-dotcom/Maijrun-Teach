import crypto from "crypto"
import { SessionData, AuthTokens, CustomerAuthUser } from "./types"
import { hashIp, logSecurityAudit } from "./audit-logger"

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes (short-lived access token)
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SESSION_SECRET = process.env.SESSION_SECRET || "maijrun_auth_session_secure_secret_2026"

// In-memory active session store (can be connected to Redis or Postgres table in production)
const activeSessions = new Map<string, SessionData>()
const refreshTokensStore = new Map<string, { sessionId: string; customerId: string; expiresAt: number }>()

/**
 * Creates an HMAC signature for token payloads
 */
function signPayload(payloadStr: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payloadStr).digest("base64url")
}

/**
 * Encodes and signs a token
 */
function createSignedToken(payload: Record<string, any>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = signPayload(data)
  return `${data}.${signature}`
}

/**
 * Verifies and decodes a signed token with timingSafeEqual
 */
export function verifySignedToken<T = any>(token?: string | null): T | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null

  const [data, signature] = token.split(".")
  if (!data || !signature) return null

  const expectedSignature = signPayload(data)
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (sigBuffer.length !== expectedBuffer.length) return null
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null

  try {
    const jsonStr = Buffer.from(data, "base64url").toString("utf8")
    const payload = JSON.parse(jsonStr)

    // Check expiry
    if (payload.exp && Date.now() > payload.exp) {
      return null
    }

    return payload as T
  } catch {
    return null
  }
}

/**
 * Issue new session and token pair for verified customer
 */
export async function createCustomerSession({
  customer,
  userAgent = "Unknown Device",
  ip = "127.0.0.1",
}: {
  customer: CustomerAuthUser
  userAgent?: string
  ip?: string
}): Promise<{ session: SessionData; tokens: AuthTokens }> {
  const sessionId = `sess_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`
  const now = Date.now()
  const accessExpiry = now + ACCESS_TOKEN_TTL_MS
  const refreshExpiry = now + REFRESH_TOKEN_TTL_MS

  const session: SessionData = {
    sessionId,
    customerId: customer.id,
    phone: customer.phone,
    userAgent,
    ipHash: hashIp(ip),
    createdAt: now,
    lastActiveAt: now,
    expiresAt: refreshExpiry,
  }

  activeSessions.set(sessionId, session)

  // 1. Access Token (15 min TTL)
  const accessToken = createSignedToken({
    sub: customer.id,
    sessionId,
    phone: customer.phone,
    exp: accessExpiry,
    type: "access",
  })

  // 2. Rotating Refresh Token
  const refreshTokenId = `ref_${crypto.randomBytes(24).toString("hex")}`
  refreshTokensStore.set(refreshTokenId, {
    sessionId,
    customerId: customer.id,
    expiresAt: refreshExpiry,
  })

  const refreshToken = createSignedToken({
    sub: customer.id,
    sessionId,
    tokenId: refreshTokenId,
    exp: refreshExpiry,
    type: "refresh",
  })

  logSecurityAudit({
    event: "SESSION_CREATED",
    phone: customer.phone,
    ip,
    userAgent,
    details: { sessionId, customerId: customer.id },
  })

  return {
    session,
    tokens: {
      accessToken,
      refreshToken,
    },
  }
}

/**
 * Validates access token and verifies active session existence
 */
export async function validateSession(accessToken?: string): Promise<{
  valid: boolean
  session?: SessionData
  customerId?: string
}> {
  const payload = verifySignedToken<{ sub: string; sessionId: string; type: string }>(accessToken)
  if (!payload || payload.type !== "access") {
    return { valid: false }
  }

  const session = activeSessions.get(payload.sessionId)
  if (!session) {
    return { valid: false }
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(payload.sessionId)
    return { valid: false }
  }

  // Update last active timestamp
  session.lastActiveAt = Date.now()

  return {
    valid: true,
    session,
    customerId: payload.sub,
  }
}

/**
 * Rotate Refresh Token and return fresh token pair
 */
export async function rotateRefreshToken(oldRefreshToken: string): Promise<AuthTokens | null> {
  const payload = verifySignedToken<{ sub: string; sessionId: string; tokenId: string; type: string }>(
    oldRefreshToken
  )
  if (!payload || payload.type !== "refresh") {
    return null
  }

  const stored = refreshTokensStore.get(payload.tokenId)
  if (!stored || stored.sessionId !== payload.sessionId) {
    // Possible token reuse attack! Invalidate the entire session
    activeSessions.delete(payload.sessionId)
    logSecurityAudit({
      event: "SUSPICIOUS_REFRESH_TOKEN_REUSE",
      details: { sessionId: payload.sessionId, customerId: payload.sub },
    })
    return null
  }

  // Invalidate used refresh token immediately (Single-use rotation)
  refreshTokensStore.delete(payload.tokenId)

  const session = activeSessions.get(payload.sessionId)
  if (!session) return null

  const now = Date.now()
  const accessExpiry = now + ACCESS_TOKEN_TTL_MS
  const refreshExpiry = now + REFRESH_TOKEN_TTL_MS

  // Issue new access token
  const newAccessToken = createSignedToken({
    sub: session.customerId,
    sessionId: session.sessionId,
    phone: session.phone,
    exp: accessExpiry,
    type: "access",
  })

  // Issue new rotating refresh token
  const newRefreshTokenId = `ref_${crypto.randomBytes(24).toString("hex")}`
  refreshTokensStore.set(newRefreshTokenId, {
    sessionId: session.sessionId,
    customerId: session.customerId,
    expiresAt: refreshExpiry,
  })

  const newRefreshToken = createSignedToken({
    sub: session.customerId,
    sessionId: session.sessionId,
    tokenId: newRefreshTokenId,
    exp: refreshExpiry,
    type: "refresh",
  })

  session.lastActiveAt = now

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

/**
 * Revoke specific session (single logout)
 */
export async function revokeSession(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId)
  if (session) {
    logSecurityAudit({
      event: "SESSION_LOGOUT",
      phone: session.phone,
      details: { sessionId, customerId: session.customerId },
    })
    activeSessions.delete(sessionId)
  }

  // Clear linked refresh tokens
  for (const [tokenId, record] of Array.from(refreshTokensStore.entries())) {
    if (record.sessionId === sessionId) {
      refreshTokensStore.delete(tokenId)
    }
  }
}

/**
 * Revoke ALL sessions for a customer (log out all devices)
 */
export async function revokeAllSessionsForCustomer(customerId: string): Promise<number> {
  let count = 0
  for (const [sessionId, session] of Array.from(activeSessions.entries())) {
    if (session.customerId === customerId) {
      activeSessions.delete(sessionId)
      count++
    }
  }

  for (const [tokenId, record] of Array.from(refreshTokensStore.entries())) {
    if (record.customerId === customerId) {
      refreshTokensStore.delete(tokenId)
    }
  }

  logSecurityAudit({
    event: "SESSION_LOGOUT_ALL_DEVICES",
    details: { customerId, terminatedSessionsCount: count },
  })

  return count
}

/**
 * List all active sessions for a customer
 */
export async function getCustomerSessions(customerId: string): Promise<SessionData[]> {
  const sessions: SessionData[] = []
  const now = Date.now()

  for (const session of Array.from(activeSessions.values())) {
    if (session.customerId === customerId) {
      if (now <= session.expiresAt) {
        sessions.push({ ...session })
      }
    }
  }

  return sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt)
}

/**
 * Testing Helpers
 */
export function resetSessionStoreForTests(): void {
  activeSessions.clear()
  refreshTokensStore.clear()
}
