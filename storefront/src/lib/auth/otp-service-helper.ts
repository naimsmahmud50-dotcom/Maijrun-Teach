/**
 * Validates and normalizes Bangladesh mobile numbers to standard E.164 (+8801XXXXXXXXX)
 */
export function normalizeBangladeshMobile(phone: string): string | null {
  if (!phone || typeof phone !== "string") return null

  // Strip all non-digit characters except leading plus
  let cleaned = phone.trim().replace(/[^\d+]/g, "")

  if (cleaned.startsWith("+880")) {
    cleaned = cleaned.substring(1) // 880...
  } else if (cleaned.startsWith("0")) {
    cleaned = `88${cleaned}` // 8801...
  } else if (!cleaned.startsWith("880")) {
    cleaned = `880${cleaned}`
  }

  // Final format must be 8801[3-9]XXXXXXXX (13 digits without plus)
  if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`
  }

  return null
}

/**
 * Mask phone number for public display and audit logs (+880 17****-***78)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 10) return "***"
  const clean = phone.replace(/[^\d+]/g, "")
  if (clean.length === 14 && clean.startsWith("+8801")) {
    return `${clean.substring(0, 6)}****-***${clean.substring(clean.length - 2)}`
  }
  return `${clean.substring(0, 3)}****${clean.substring(clean.length - 2)}`
}
