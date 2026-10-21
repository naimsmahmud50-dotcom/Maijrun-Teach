import { SmsProvider, SmsSendResult } from "../types"

export interface MockSentSms {
  phone: string
  otp: string
  timestamp: number
  messageId: string
}

export class MockSmsProvider implements SmsProvider {
  readonly name = "mock"
  private static sentMessages: MockSentSms[] = []

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    MockSmsProvider.sentMessages.push({
      phone,
      otp,
      timestamp: Date.now(),
      messageId,
    })

    return {
      success: true,
      messageId,
    }
  }

  static getLastSentForPhone(phone: string): MockSentSms | undefined {
    return this.sentMessages
      .filter((m) => m.phone === phone)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  static getAllSent(): MockSentSms[] {
    return [...this.sentMessages]
  }

  static clear(): void {
    this.sentMessages = []
  }
}
