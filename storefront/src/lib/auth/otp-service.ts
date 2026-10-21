import crypto from "crypto"
import { OtpRecord, VerifyOtpResult, CustomerAuthUser } from "./types"
import { getSmsProvider } from "./sms/factory"
import { logSecurityAudit } from "./audit-logger"

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds
const MAX_ATTEMPTS = 5
const MAX_SENDS_PER_PHONE_HOUR = 5
const MAX_SENDS_PER_IP_DAY = 5
const DEFAULT_DAILY_SMS_CAP = 1000

// In-memory repositories (Can be backed by Redis / Postgres in multi-cluster setup)
const otpStore = new Map<string, OtpRecord>()
const phoneSendTimestamps = new Map<string, number[]>()
const ipSendTimestamps = new Map<string, number[]>()
let dailySmsCount = 0
let lastDayReset = new Date().toDateString()

function checkAndResetDailyBudget(): void {
  const today = new Date().toDateString()
  if (today !== lastDayReset) {
    dailySmsCount = 0
    lastDayReset = today
  }
}

import { normalizeBangladeshMobile, maskPhoneNumber } from "./otp-service-helper"
export { normalizeBangladeshMobile, maskPhoneNumber }

/**
 * Cloudflare Turnstile token verification
 */
export async function verifyTurnstile(
  token?: string,
  ip?: string
): Promise<{ success: boolean; message?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // In test or local sandbox without configured key, bypass validation
  if (!secretKey || process.env.NODE_ENV === "test") {
    return { success: true }
  }

  if (!token) {
    return { success: false, message: "Security bot verification required." }
  }

  try {
    const formData = new URLSearchParams()
    formData.append("secret", secretKey)
    formData.append("response", token)
    if (ip) formData.append("remoteip", ip)

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    )

    const data = await response.json()
    if (data.success) {
      return { success: true }
    }

    return { success: false, message: "Bot verification failed. Please try again." }
  } catch (err) {
    return { success: false, message: "Could not verify security challenge." }
  }
}

/**
 * Request OTP Generation & Dispatch
 */
export async function requestOtp({
  phone,
  ip = "127.0.0.1",
  turnstileToken,
  smsGateway,
}: {
  phone: string
  ip?: string
  turnstileToken?: string
  smsGateway?: string
}): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  // 1. Validate and normalize Bangladesh phone
  const normalizedPhone = normalizeBangladeshMobile(phone)
  if (!normalizedPhone) {
    return {
      success: false,
      message: "Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712345678).",
    }
  }

  // 2. Cloudflare Turnstile verification
  const turnstileCheck = await verifyTurnstile(turnstileToken, ip)
  if (!turnstileCheck.success) {
    return { success: false, message: turnstileCheck.message || "Bot verification failed." }
  }

  // 3. Daily SMS budget check
  checkAndResetDailyBudget()
  const dailyCap = parseInt(process.env.DAILY_SMS_CAP || String(DEFAULT_DAILY_SMS_CAP), 10)
  if (dailySmsCount >= dailyCap) {
    logSecurityAudit({
      event: "SMS_BUDGET_EXCEEDED",
      phone: normalizedPhone,
      ip,
      details: { dailySmsCount, dailyCap },
    })
    return {
      success: false,
      message: "SMS daily limit reached. Please contact support or try again tomorrow.",
    }
  }

  const now = Date.now()

  // 4. Rate Limit: 60s resend cooldown per phone
  const existingRecord = otpStore.get(normalizedPhone)
  if (existingRecord) {
    const elapsed = now - existingRecord.lastResendAt
    if (elapsed < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      return {
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        cooldownSeconds: remainingSeconds,
      }
    }
  }

  // 5. Rate Limit: Max 5 sends per number per hour
  const oneHourAgo = now - 60 * 60 * 1000
  const phoneSends = (phoneSendTimestamps.get(normalizedPhone) || []).filter((t) => t > oneHourAgo)
  if (phoneSends.length >= MAX_SENDS_PER_PHONE_HOUR) {
    return {
      success: false,
      message: "Too many OTP requests for this phone number. Please wait an hour.",
    }
  }

  // 6. Rate Limit: Max 5 sends per IP per day
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const ipSends = (ipSendTimestamps.get(ip) || []).filter((t) => t > oneDayAgo)
  if (ipSends.length >= MAX_SENDS_PER_IP_DAY) {
    return {
      success: false,
      message: "Too many OTP requests from this connection. Please try again tomorrow.",
    }
  }

  // 7. Cryptographically Secure 6-Digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString()

  // 8. Salted HMAC-SHA256 Hash stored at rest (Plaintext OTP is never stored!)
  const salt = crypto.randomBytes(16).toString("hex")
  const hmacSecret = process.env.OTP_SECRET || "maijrun_otp_secure_hmac_secret_2026"
  const otpHash = crypto
    .createHmac("sha256", hmacSecret)
    .update(`${rawOtp}:${salt}`)
    .digest("hex")

  const record: OtpRecord = {
    phone: normalizedPhone,
    otpHash,
    salt,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
    lastResendAt: now,
  }

  otpStore.set(normalizedPhone, record)

  // Update rate limit windows
  phoneSends.push(now)
  phoneSendTimestamps.set(normalizedPhone, phoneSends)

  ipSends.push(now)
  ipSendTimestamps.set(ip, ipSends)

  dailySmsCount++

  // 9. Dispatch via selected SMS Provider
  const smsProvider = getSmsProvider(smsGateway)
  const sendResult = await smsProvider.sendOtp(normalizedPhone, rawOtp)

  logSecurityAudit({
    event: "OTP_SENT",
    phone: normalizedPhone,
    ip,
    details: { provider: smsProvider.name, success: sendResult.success },
  })

  if (!sendResult.success) {
    return {
      success: false,
      message: "Failed to dispatch verification SMS. Please try again shortly.",
    }
  }

  return {
    success: true,
    message: "A 6-digit verification code has been sent to your mobile number.",
    cooldownSeconds: 60,
  }
}

/**
 * Verify OTP with Constant-Time TimingSafe Comparison
 */
export async function verifyOtp({
  phone,
  otp,
  ip = "127.0.0.1",
}: {
  phone: string
  otp: string
  ip?: string
}): Promise<VerifyOtpResult> {
  const normalizedPhone = normalizeBangladeshMobile(phone)
  if (!normalizedPhone || !otp || otp.trim().length !== 6) {
    return { success: false, message: "Invalid phone number or OTP format." }
  }

  const record = otpStore.get(normalizedPhone)
  if (!record) {
    return {
      success: false,
      message: "No pending OTP found or verification session expired.",
    }
  }

  const now = Date.now()

  // 1. Check Expiry (5 minutes)
  if (now > record.expiresAt) {
    otpStore.delete(normalizedPhone)
    logSecurityAudit({
      event: "OTP_EXPIRED",
      phone: normalizedPhone,
      ip,
    })
    return {
      success: false,
      message: "Verification code has expired. Please request a new one.",
    }
  }

  // 2. Check Brute-force Lockout (Max 5 attempts)
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedPhone)
    logSecurityAudit({
      event: "OTP_BRUTE_FORCE_LOCKOUT",
      phone: normalizedPhone,
      ip,
      details: { attempts: record.attempts },
    })
    return {
      success: false,
      message: "Too many incorrect attempts. This code is locked. Please request a new one.",
    }
  }

  // 3. Constant-Time Timing-Safe Comparison
  const hmacSecret = process.env.OTP_SECRET || "maijrun_otp_secure_hmac_secret_2026"
  const candidateHash = crypto
    .createHmac("sha256", hmacSecret)
    .update(`${otp.trim()}:${record.salt}`)
    .digest("hex")

  const candidateBuffer = Buffer.from(candidateHash, "hex")
  const storedBuffer = Buffer.from(record.otpHash, "hex")

  let isMatch = false
  try {
    if (candidateBuffer.length === storedBuffer.length) {
      isMatch = crypto.timingSafeEqual(candidateBuffer, storedBuffer)
    }
  } catch {
    isMatch = false
  }

  if (!isMatch) {
    record.attempts += 1
    logSecurityAudit({
      event: "OTP_FAILED_ATTEMPT",
      phone: normalizedPhone,
      ip,
      details: { attempt: record.attempts, remaining: MAX_ATTEMPTS - record.attempts },
    })

    return {
      success: false,
      message: `Incorrect code. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
    }
  }

  // 4. Invalidate immediately on success (Single-use guarantee)
  otpStore.delete(normalizedPhone)

  logSecurityAudit({
    event: "OTP_VERIFIED_SUCCESS",
    phone: normalizedPhone,
    ip,
  })

  // Return success
  return {
    success: true,
    message: "Phone verified successfully.",
  }
}

/**
 * Testing Helpers for Resetting State
 */
export function resetOtpServiceStateForTests(): void {
  otpStore.clear()
  phoneSendTimestamps.clear()
  ipSendTimestamps.clear()
  dailySmsCount = 0
}
