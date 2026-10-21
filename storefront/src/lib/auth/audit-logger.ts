import crypto from "crypto"
import { maskPhoneNumber } from "./otp-service-helper"

export interface SecurityAuditEvent {
  id: string
  event: string
  phoneMasked?: string
  ipHash?: string
  userAgent?: string
  details?: Record<string, any>
  timestamp: string
}

const auditLogStore: SecurityAuditEvent[] = []
const MAX_LOGS = 1000

export function hashIp(ip?: string): string {
  if (!ip) return "unknown"
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16)
}

export function logSecurityAudit({
  event,
  phone,
  ip,
  userAgent,
  details = {},
}: {
  event: string
  phone?: string
  ip?: string
  userAgent?: string
  details?: Record<string, any>
}): SecurityAuditEvent {
  // Sanitize details: strictly remove any keys containing otp, token, card, or password
  const sanitizedDetails: Record<string, any> = {}
  for (const [key, val] of Object.entries(details)) {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey.includes("otp") ||
      lowerKey.includes("token") ||
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("card")
    ) {
      sanitizedDetails[key] = "[REDACTED]"
    } else {
      sanitizedDetails[key] = val
    }
  }

  const logEntry: SecurityAuditEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event,
    phoneMasked: phone ? maskPhoneNumber(phone) : undefined,
    ipHash: ip ? hashIp(ip) : undefined,
    userAgent,
    details: sanitizedDetails,
    timestamp: new Date().toISOString(),
  }

  auditLogStore.push(logEntry)
  if (auditLogStore.length > MAX_LOGS) {
    auditLogStore.shift()
  }

  // Also print structured log to stdout in production/development (non-test)
  if (process.env.NODE_ENV !== "test") {
    console.info(`[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`)
  }

  return logEntry
}

export function getSecurityAuditLogs(limit = 100): SecurityAuditEvent[] {
  return auditLogStore.slice(-limit).reverse()
}

export function clearSecurityAuditLogs(): void {
  auditLogStore.length = 0
}
