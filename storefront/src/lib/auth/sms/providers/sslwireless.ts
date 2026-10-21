import { SmsProvider, SmsSendResult } from "../types"

export class SslWirelessSmsProvider implements SmsProvider {
  readonly name = "sslwireless"
  private apiToken: string
  private sid: string
  private domain: string

  constructor() {
    this.apiToken = process.env.SSL_WIRELESS_API_TOKEN || ""
    this.sid = process.env.SSL_WIRELESS_SID || "MAIJRUNTECH"
    this.domain = process.env.SSL_WIRELESS_DOMAIN || "https://smsplus.sslwireless.com"
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.apiToken) {
      return {
        success: false,
        error: "SSL Wireless API token not configured",
      }
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "")
    const message = `Your MAIJRUN Tech security verification code is ${otp}. Valid for 5 minutes. Never share this code.`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(`${this.domain}/api/v3/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          api_token: this.apiToken,
          sid: this.sid,
          msisdn: cleanPhone,
          sms: message,
          csms_id: `MJR_${Date.now()}`,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.ok && (data.status === "SUCCESS" || data.status_code === 200)) {
        return {
          success: true,
          messageId: data.smsinfo?.[0]?.sms_id || `ssl_${Date.now()}`,
        }
      }

      return {
        success: false,
        error: data.error_message || data.status || "SSL Wireless SMS request failed",
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.name === "AbortError" ? "SSL Wireless timeout" : err.message,
      }
    }
  }
}
