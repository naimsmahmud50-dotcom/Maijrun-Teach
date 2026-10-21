import crypto from "crypto"

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

/**
 * Base32 Encoder for TOTP secrets
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let output = ""

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31]
  }

  return output
}

/**
 * Base32 Decoder for TOTP secrets
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "")
  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i])
    if (val === -1) continue
    value = (value << 5) | val
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

/**
 * Generates a new cryptographically secure Base32 TOTP secret (20 bytes)
 */
export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20))
}

/**
 * Computes an RFC 6238 TOTP code for a given timestamp counter
 */
export function computeTotp(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigInt64BE(BigInt(counter))

  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest()

  // Dynamic truncation (RFC 4226 / RFC 6238)
  const offset = hmac[hmac.length - 1] & 0x0f
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  const otp = (codeInt % 1000000).toString().padStart(6, "0")
  return otp
}

/**
 * Verifies a 6-digit TOTP code with time drift window (-1, 0, +1)
 */
export function verifyTotp(
  secretBase32: string,
  token: string,
  window = 1,
  timeStepSeconds = 30
): boolean {
  if (!token || token.trim().length !== 6) return false

  const cleanToken = token.trim()
  const currentCounter = Math.floor(Date.now() / 1000 / timeStepSeconds)

  for (let i = -window; i <= window; i++) {
    const expected = computeTotp(secretBase32, currentCounter + i)
    try {
      if (
        expected.length === cleanToken.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanToken))
      ) {
        return true
      }
    } catch {
      // Buffer mismatch fallback
    }
  }

  return false
}

/**
 * Computes the current 6-digit TOTP code for a secret
 */
export function generateTotpCode(secretBase32: string, timeStepSeconds = 30): string {
  const currentCounter = Math.floor(Date.now() / 1000 / timeStepSeconds)
  return computeTotp(secretBase32, currentCounter)
}

/**
 * Generates an otpauth:// URI for Google Authenticator / Authy QR code
 */
export function generateTotpUri(
  optionsOrEmail: string | { secret: string; accountName: string; issuer?: string },
  secretBase32?: string
): string {
  if (typeof optionsOrEmail === "object") {
    const issuer = encodeURIComponent(optionsOrEmail.issuer || "MAIJRUN Tech")
    const account = optionsOrEmail.accountName
    return `otpauth://totp/${issuer}:${account}?secret=${optionsOrEmail.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  }

  const issuer = encodeURIComponent("MAIJRUN Tech")
  const account = optionsOrEmail
  return `otpauth://totp/${issuer}:${account}?secret=${secretBase32}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
}

