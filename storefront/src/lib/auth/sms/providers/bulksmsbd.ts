import { SmsProvider, SmsSendResult } from "../types"

export class BulkSmsBdProvider implements SmsProvider {
  readonly name = "bulksmsbd"
  private apiKey: string
  private senderId: string

  constructor() {
    this.apiKey = process.env.BULKSMSBD_API_KEY || ""
    this.senderId = process.env.BULKSMSBD_SENDER_ID || "MAIJRUN"
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "BulkSMSBD API key not configured",
      }
    }

    // Strip +88 prefix if needed or ensure 11 digits format
    let cleanPhone = phone.replace(/[^\d]/g, "")
    if (cleanPhone.startsWith("880")) {
      cleanPhone = cleanPhone.substring(2)
    }

    const message = `Your MAIJRUN Tech OTP is ${otp}. Valid for 5 minutes. Do not share.`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch("http://bulksmsbd.net/api/smsapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          type: "text",
          number: cleanPhone,
          senderid: this.senderId,
          message: message,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (data.response_code === 202 || data.success) {
        return {
          success: true,
          messageId: String(data.message_id || `bulk_${Date.now()}`),
        }
      }

      return {
        success: false,
        error: data.error_message || "BulkSMSBD sending failed",
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.name === "AbortError" ? "BulkSMSBD timeout" : err.message,
      }
    }
  }
}
