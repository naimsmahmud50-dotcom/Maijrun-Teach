import crypto from "crypto"
import {
  PaymentProvider,
  OrderPaymentPayload,
  PaymentInitiationResult,
  PaymentVerificationResult,
  RefundRequest,
  RefundResult,
} from "../types"

export class CodPaymentAdapter implements PaymentProvider {
  readonly gatewayId = "cod" as const
  readonly isSandbox = false

  async initiatePayment(payload: OrderPaymentPayload): Promise<PaymentInitiationResult> {
    const totalAmount = payload.subtotalBdt + payload.shippingBdt - (payload.discountBdt || 0)
    const paymentId = "COD_" + crypto.randomBytes(8).toString("hex")

    return {
      success: true,
      paymentId,
      gateway: this.gatewayId,
      redirectUrl: payload.successUrl,
      orderId: payload.orderId,
      amount: totalAmount,
      currency: "BDT",
      status: "PENDING_PAYMENT",
    }
  }

  async verifyPayment(params: {
    orderId: string
  }): Promise<PaymentVerificationResult> {
    const transactionId = "COD_" + crypto.randomBytes(6).toString("hex").toUpperCase()

    return {
      success: true,
      status: "PENDING_PAYMENT", // COD remains pending until physical delivery
      orderId: params.orderId,
      transactionId,
      currency: "BDT",
      paidAt: undefined,
      rawResponse: {
        paymentMethod: "Cash on Delivery",
        orderId: params.orderId,
        advancePayment: 0,
      },
    }
  }

  verifyWebhookSignature(): boolean {
    return true
  }

  async refund(params: RefundRequest): Promise<RefundResult> {
    return {
      success: true,
      refundId: "RFD_COD_" + crypto.randomBytes(6).toString("hex").toUpperCase(),
      amountBdt: params.amountBdt,
      status: "REFUNDED",
    }
  }
}
