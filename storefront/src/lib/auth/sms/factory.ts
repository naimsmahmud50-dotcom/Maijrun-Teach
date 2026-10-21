import { SmsProvider } from "./types"
import { MockSmsProvider } from "./providers/mock"
import { SslWirelessSmsProvider } from "./providers/sslwireless"
import { BulkSmsBdProvider } from "./providers/bulksmsbd"
import { TwilioSmsProvider } from "./providers/twilio"

export function getSmsProvider(providerName?: string): SmsProvider {
  const selected = (providerName || process.env.SMS_GATEWAY_PROVIDER || "mock").toLowerCase()

  switch (selected) {
    case "sslwireless":
      return new SslWirelessSmsProvider()
    case "bulksmsbd":
      return new BulkSmsBdProvider()
    case "twilio":
      return new TwilioSmsProvider()
    case "mock":
    default:
      return new MockSmsProvider()
  }
}
