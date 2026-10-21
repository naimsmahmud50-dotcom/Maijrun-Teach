import { PaymentGatewayId, PaymentProvider } from "./types"
import { BkashPaymentAdapter } from "./adapters/bkash"
import { NagadPaymentAdapter } from "./adapters/nagad"
import { SslCommerzPaymentAdapter } from "./adapters/sslcommerz"
import { CodPaymentAdapter } from "./adapters/cod"

const providers: Record<PaymentGatewayId, PaymentProvider> = {
  bkash: new BkashPaymentAdapter(),
  nagad: new NagadPaymentAdapter(),
  sslcommerz: new SslCommerzPaymentAdapter(),
  cod: new CodPaymentAdapter(),
}

export function getPaymentProvider(gatewayId: PaymentGatewayId): PaymentProvider {
  const provider = providers[gatewayId]
  if (!provider) {
    throw new Error(`Unsupported payment gateway: "${gatewayId}"`)
  }
  return provider
}

export function getAllSupportedGateways(): {
  id: PaymentGatewayId
  name: string
  nameBn: string
  tagline: string
  taglineBn: string
  color: string
}[] {
  return [
    {
      id: "bkash",
      name: "bKash",
      nameBn: "বিকাশ",
      tagline: "Instant mobile payment via bKash App or PIN",
      taglineBn: "বিকাশ অ্যাপ অথবা পিন দিয়ে তাৎক্ষণিক পেমেন্ট",
      color: "#E2136E",
    },
    {
      id: "nagad",
      name: "Nagad",
      nameBn: "নগদ",
      tagline: "Pay instantly from your Nagad digital wallet",
      taglineBn: "আপনার নগদ ওয়ালেট থেকে সরাসরি পেমেন্ট করুন",
      color: "#F7941D",
    },
    {
      id: "sslcommerz",
      name: "Cards & Internet Banking",
      nameBn: "কার্ড ও নেট ব্যাংকিং",
      tagline: "Visa, Mastercard, Amex, DBBL Nexus & 30+ Banks",
      taglineBn: "ভিসা, মাস্টারকার্ড, ডিবিবিএল নেক্সাস ও ৩০+ ব্যাংক",
      color: "#0B63CE",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      nameBn: "ক্যাশ অন ডেলিভারি",
      tagline: "Pay cash after product reaches your doorstep",
      taglineBn: "পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন",
      color: "#16A34A",
    },
  ]
}
