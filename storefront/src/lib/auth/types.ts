export interface OtpRecord {
  phone: string
  otpHash: string
  salt: string
  expiresAt: number
  attempts: number
  createdAt: number
  lastResendAt: number
}

export interface SessionData {
  sessionId: string
  customerId: string
  phone: string
  userAgent: string
  ipHash: string
  createdAt: number
  lastActiveAt: number
  expiresAt: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface CustomerAuthUser {
  id: string
  phone: string
  name?: string
  email?: string
  createdAt: number
  updatedAt: number
}

export interface SendOtpPayload {
  phone: string
  turnstileToken?: string
}

export interface VerifyOtpPayload {
  phone: string
  otp: string
}

export interface VerifyOtpResult {
  success: boolean
  message: string
  user?: CustomerAuthUser
  tokens?: AuthTokens
  isNewUser?: boolean
}
