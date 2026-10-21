export interface SmsSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface SmsProvider {
  readonly name: string
  sendOtp(phone: string, otp: string): Promise<SmsSendResult>
}
