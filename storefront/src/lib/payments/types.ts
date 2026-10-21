export type PaymentGatewayId = "bkash" | "nagad" | "sslcommerz" | "cod"

export type PaymentStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"

export interface OrderItemPayload {
  productId: string
  title: string
  quantity: number
  unitPriceBdt: number
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  district: string
  city?: string
}

export interface OrderPaymentPayload {
  orderId: string
  cartId?: string
  customer: CustomerInfo
  items: OrderItemPayload[]
  subtotalBdt: number
  shippingBdt: number
  discountBdt?: number
  currency: "BDT"
  gateway: PaymentGatewayId
  successUrl: string
  failUrl: string
  cancelUrl: string
}

export interface PaymentInitiationResult {
  success: boolean
  paymentId: string // Internal or gateway payment ID
  gateway: PaymentGatewayId
  redirectUrl?: string
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  errorMessage?: string
}

export interface PaymentVerificationResult {
  success: boolean
  status: PaymentStatus
  orderId: string
  transactionId?: string
  gatewayPaymentId?: string
  amountPaid?: number
  currency?: string
  paidAt?: string
  rawResponse?: any
  errorMessage?: string
}

export interface RefundRequest {
  orderId: string
  paymentId: string
  amountBdt: number
  reason: string
  refundedBy?: string
}

export interface RefundResult {
  success: boolean
  refundId: string
  amountBdt: number
  status: "REFUNDED" | "FAILED"
  errorMessage?: string
}

export interface PaymentRecord {
  id: string // Payment transaction record ID
  orderId: string
  gateway: PaymentGatewayId
  amountBdt: number
  currency: "BDT"
  status: PaymentStatus
  transactionId?: string
  gatewayPaymentId?: string
  idempotencyKey: string
  customerPhone: string
  customerEmail: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  refundedAt?: string
  auditLogs: { timestamp: string; action: string; details?: string }[]
}

/**
 * Standard Payment Provider interface implemented by all gateway adapters
 */
export interface PaymentProvider {
  readonly gatewayId: PaymentGatewayId
  readonly isSandbox: boolean

  initiatePayment(payload: OrderPaymentPayload): Promise<PaymentInitiationResult>
  verifyPayment(params: {
    orderId: string
    paymentId?: string
    valId?: string
    paymentRefId?: string
  }): Promise<PaymentVerificationResult>
  verifyWebhookSignature(payload: any, signature?: string | null): boolean
  refund(params: RefundRequest): Promise<RefundResult>
}
