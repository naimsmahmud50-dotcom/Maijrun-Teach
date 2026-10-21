import { SmsProvider, SmsSendResult } from "../types"

export class TwilioSmsProvider implements SmsProvider {
  readonly name = "twilio"
  private accountSid: string
  private authToken: string
  private fromPhone: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ""
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ""
    this.fromPhone = process.env.TWILIO_FROM_PHONE || ""
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.accountSid || !this.authToken || !this.fromPhone) {
      return {
        success: false,
        error: "Twilio credentials not configured",
      }
    }

    const cleanPhone = phone.startsWith("+") ? phone : `+${phone.replace(/[^\d]/g, "")}`
    const message = `Your MAIJRUN Tech OTP is ${otp}. Valid for 5 minutes.`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: cleanPhone,
            From: this.fromPhone,
            Body: message,
          }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
        }
      }

      return {
        success: false,
        error: data.message || "Twilio request failed",
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.name === "AbortError" ? "Twilio timeout" : err.message,
      }
    }
  }
}
