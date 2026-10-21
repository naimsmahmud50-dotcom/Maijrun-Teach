import crypto from "crypto"
import { PaymentRecord, PaymentStatus, PaymentGatewayId, RefundResult } from "./types"

/**
 * Thread-safe payment record repository
 * In production, backed by PostgreSQL table (orders_payment)
 */
const paymentRecords = new Map<string, PaymentRecord>()
const orderToPaymentMap = new Map<string, string>()

export interface StockReservation {
  orderId: string
  items: { productId: string; quantity: number }[]
  expiresAt: number
  status: "ACTIVE" | "RELEASED" | "CONFIRMED"
}

const stockReservations = new Map<string, StockReservation>()

/**
 * Creates a new payment record and reserves inventory for 15 minutes
 */
export function createPaymentRecord(params: {
  orderId: string
  gateway: PaymentGatewayId
  amountBdt: number
  customerPhone: string
  customerEmail: string
  items: { productId: string; quantity: number }[]
}): PaymentRecord {
  // Check if an existing active payment record exists for this order
  const existingPaymentId = orderToPaymentMap.get(params.orderId)
  if (existingPaymentId) {
    const existing = paymentRecords.get(existingPaymentId)
    if (existing && existing.status === "PAID") {
      return existing
    }
  }

  const id = "pay_" + crypto.randomBytes(8).toString("hex")
  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`${params.orderId}-${params.amountBdt}-${params.gateway}`)
    .digest("hex")

  const record: PaymentRecord = {
    id,
    orderId: params.orderId,
    gateway: params.gateway,
    amountBdt: params.amountBdt,
    currency: "BDT",
    status: "PENDING_PAYMENT",
    idempotencyKey,
    // Redact sensitive phone number for audit safety (e.g. 017****1234)
    customerPhone: params.customerPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
    customerEmail: params.customerEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditLogs: [
      {
        timestamp: new Date().toISOString(),
        action: "PAYMENT_INITIATED",
        details: `Initiated via ${params.gateway.toUpperCase()} for ৳${params.amountBdt}`,
      },
    ],
  }

  paymentRecords.set(id, record)
  orderToPaymentMap.set(params.orderId, id)

  // Reserve inventory for 15 minutes (900 seconds)
  const ttlMs = 15 * 60 * 1000
  stockReservations.set(params.orderId, {
    orderId: params.orderId,
    items: params.items,
    expiresAt: Date.now() + ttlMs,
    status: "ACTIVE",
  })

  return record
}

/**
 * Idempotently marks a payment as PAID
 * If duplicate callback arrives, preserves existing record without double-processing
 */
export function markPaymentAsPaid(params: {
  orderId: string
  transactionId: string
  amountBdt: number
  gatewayPaymentId?: string
}): { record: PaymentRecord; isDuplicate: boolean } {
  const paymentId = orderToPaymentMap.get(params.orderId)
  let record = paymentId ? paymentRecords.get(paymentId) : undefined

  if (!record) {
    // Fallback create if callback arrives first
    record = createPaymentRecord({
      orderId: params.orderId,
      gateway: "sslcommerz",
      amountBdt: params.amountBdt,
      customerPhone: "01700000000",
      customerEmail: "customer@maijrun.com",
      items: [],
    })
  }

  // Idempotency check: Already processed
  if (record.status === "PAID") {
    return { record, isDuplicate: true }
  }

  record.status = "PAID"
  record.transactionId = params.transactionId
  record.gatewayPaymentId = params.gatewayPaymentId
  record.paidAt = new Date().toISOString()
  record.updatedAt = new Date().toISOString()
  record.auditLogs.push({
    timestamp: new Date().toISOString(),
    action: "PAYMENT_CONFIRMED",
    details: `Confirmed TRX: ${params.transactionId}. Amount: ৳${params.amountBdt}`,
  })

  // Confirm stock reservation permanently
  const reservation = stockReservations.get(params.orderId)
  if (reservation) {
    reservation.status = "CONFIRMED"
  }

  return { record, isDuplicate: false }
}

/**
 * Marks payment as failed and immediately releases reserved inventory
 */
export function markPaymentAsFailed(orderId: string, reason: string): PaymentRecord | undefined {
  const paymentId = orderToPaymentMap.get(orderId)
  const record = paymentId ? paymentRecords.get(paymentId) : undefined

  if (record && record.status !== "PAID") {
    record.status = "FAILED"
    record.updatedAt = new Date().toISOString()
    record.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: "PAYMENT_FAILED",
      details: reason,
    })

    // Release stock
    const reservation = stockReservations.get(orderId)
    if (reservation) {
      reservation.status = "RELEASED"
    }
  }

  return record
}

/**
 * Finds payment record by Order ID
 */
export function getPaymentByOrderId(orderId: string): PaymentRecord | undefined {
  const paymentId = orderToPaymentMap.get(orderId)
  return paymentId ? paymentRecords.get(paymentId) : undefined
}

/**
 * Background reconciliation: cancels stale PENDING payments older than 15 minutes
 */
export function reconcileStalePayments(): { cancelledCount: number } {
  const now = Date.now()
  let cancelledCount = 0

  stockReservations.forEach((res, orderId) => {
    if (res.status === "ACTIVE" && res.expiresAt < now) {
      const paymentId = orderToPaymentMap.get(orderId)
      const record = paymentId ? paymentRecords.get(paymentId) : undefined

      if (record && record.status === "PENDING_PAYMENT") {
        record.status = "CANCELLED"
        record.updatedAt = new Date().toISOString()
        record.auditLogs.push({
          timestamp: new Date().toISOString(),
          action: "PAYMENT_EXPIRED_RECONCILIATION",
          details: "Pending payment exceeded 15 minutes timeout. Stock released.",
        })
        res.status = "RELEASED"
        cancelledCount++
      }
    }
  })

  return { cancelledCount }
}

/**
 * Records admin refund
 */
export function processRefund(
  orderId: string,
  amountBdt: number,
  reason: string
): RefundResult {
  const paymentId = orderToPaymentMap.get(orderId)
  const record = paymentId ? paymentRecords.get(paymentId) : undefined

  if (!record || record.status !== "PAID") {
    return {
      success: false,
      refundId: "",
      amountBdt,
      status: "FAILED",
      errorMessage: "Order is not paid or payment record not found",
    }
  }

  const refundId = "RFD_" + crypto.randomBytes(6).toString("hex").toUpperCase()
  record.status = "REFUNDED"
  record.refundedAt = new Date().toISOString()
  record.updatedAt = new Date().toISOString()
  record.auditLogs.push({
    timestamp: new Date().toISOString(),
    action: "PAYMENT_REFUNDED",
    details: `Refunded ৳${amountBdt}. Reason: ${reason}. RefundID: ${refundId}`,
  })

  return {
    success: true,
    refundId,
    amountBdt,
    status: "REFUNDED",
  }
}
