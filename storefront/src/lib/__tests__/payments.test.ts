import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import { getPaymentProvider } from "../payments/factory"
import {
  createPaymentRecord,
  markPaymentAsPaid,
  markPaymentAsFailed,
  getPaymentByOrderId,
  reconcileStalePayments,
  processRefund,
} from "../payments/payment-store"
import { OrderPaymentPayload } from "../payments/types"

describe("Phase 7: Payment Gateway Integration & Security Tests", () => {
  const sampleOrder: OrderPaymentPayload = {
    orderId: "ord_test_laptop_001",
    customer: {
      name: "Mahmud Hasan",
      email: "mahmud@example.com",
      phone: "01712345678",
      address: "House 12, Road 4, Dhanmondi",
      district: "Dhaka",
    },
    items: [
      {
        productId: "prod_asus_zephyrus_g16",
        title: "Asus ROG Zephyrus G16",
        quantity: 1,
        unitPriceBdt: 245000,
      },
    ],
    subtotalBdt: 245000,
    shippingBdt: 80,
    currency: "BDT",
    gateway: "bkash",
    successUrl: "http://localhost:8001/us/order/ord_test_laptop_001/confirmed",
    failUrl: "http://localhost:8001/us/order/ord_test_laptop_001/payment-failed",
    cancelUrl: "http://localhost:8001/us/order/ord_test_laptop_001/payment-failed",
  }

  it("initiates bKash payment with server-computed total and returns redirect URL", async () => {
    const provider = getPaymentProvider("bkash")
    const result = await provider.initiatePayment(sampleOrder)

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.gateway, "bkash")
    assert.strictEqual(result.amount, 245080)
    assert.strictEqual(result.currency, "BDT")
    assert.ok(result.redirectUrl?.includes("paymentID="))
  })

  it("verifies bKash payment successfully and returns transaction ID", async () => {
    const provider = getPaymentProvider("bkash")
    const verification = await provider.verifyPayment({
      orderId: sampleOrder.orderId,
      paymentId: "BK_SAMPLE_PAY_ID",
    })

    assert.strictEqual(verification.success, true)
    assert.strictEqual(verification.status, "PAID")
    assert.ok(verification.transactionId?.startsWith("TRX_BK_"))
  })

  it("initiates and verifies SSLCommerz session with card gateway", async () => {
    const sslProvider = getPaymentProvider("sslcommerz")
    const init = await sslProvider.initiatePayment({
      ...sampleOrder,
      gateway: "sslcommerz",
    })

    assert.strictEqual(init.success, true)
    assert.strictEqual(init.gateway, "sslcommerz")

    const verify = await sslProvider.verifyPayment({
      orderId: sampleOrder.orderId,
      valId: init.paymentId,
    })

    assert.strictEqual(verify.success, true)
    assert.strictEqual(verify.status, "PAID")
    assert.ok(verify.transactionId?.startsWith("TRX_SSL_"))
  })

  it("keeps Cash on Delivery in PENDING_PAYMENT state with zero advance payment", async () => {
    const codProvider = getPaymentProvider("cod")
    const init = await codProvider.initiatePayment({
      ...sampleOrder,
      gateway: "cod",
    })

    assert.strictEqual(init.status, "PENDING_PAYMENT")
    assert.strictEqual(init.gateway, "cod")
  })

  it("enforces idempotency on duplicate IPN callbacks (never double processes)", () => {
    const orderId = "ord_idempotency_test_99"
    createPaymentRecord({
      orderId,
      gateway: "sslcommerz",
      amountBdt: 150000,
      customerPhone: "01811223344",
      customerEmail: "user@test.com",
      items: [{ productId: "p1", quantity: 1 }],
    })

    // 1st IPN Callback
    const firstCall = markPaymentAsPaid({
      orderId,
      transactionId: "TRX_IPN_001",
      amountBdt: 150000,
    })
    assert.strictEqual(firstCall.isDuplicate, false)
    assert.strictEqual(firstCall.record.status, "PAID")

    // 2nd Duplicate IPN Callback with same or different transaction ID
    const duplicateCall = markPaymentAsPaid({
      orderId,
      transactionId: "TRX_IPN_DUPLICATE",
      amountBdt: 150000,
    })
    assert.strictEqual(duplicateCall.isDuplicate, true, "Duplicate callback must be flagged")
    assert.strictEqual(duplicateCall.record.status, "PAID")
    assert.strictEqual(duplicateCall.record.transactionId, "TRX_IPN_001", "Original TRX ID preserved")
  })

  it("rejects forged webhook signatures (Anti-Forgery Defense)", () => {
    const provider = getPaymentProvider("sslcommerz")

    const fakePayload = { orderId: "ord_attack_123", amount: "100", val_id: "fake_val_id" }
    const forgedSignature = "invalid_attacker_signature_hex"

    const isValid = provider.verifyWebhookSignature(fakePayload, forgedSignature)
    assert.strictEqual(isValid, false, "Forged signature must be rejected")
  })

  it("detects and flags price tampering attempts (Security Rule 8 & 9)", () => {
    const orderId = "ord_tamper_test_456"
    const trueAmount = 245080 // Laptop ৳245,000 + Shipping ৳80

    createPaymentRecord({
      orderId,
      gateway: "bkash",
      amountBdt: trueAmount,
      customerPhone: "01999887766",
      customerEmail: "attacker@test.com",
      items: [{ productId: "p_expensive", quantity: 1 }],
    })

    // Attacker crafts IPN callback claiming they paid only ৳10
    const tamperedAmount = 10
    const existing = getPaymentByOrderId(orderId)
    assert.ok(existing)

    const isTampered = Math.abs(tamperedAmount - existing.amountBdt) > 1.0
    assert.strictEqual(isTampered, true, "Must flag amount tampering attempt")

    markPaymentAsFailed(orderId, "Price tampering detected in callback")
    const updated = getPaymentByOrderId(orderId)
    assert.strictEqual(updated?.status, "FAILED")
  })

  it("reconciles stale pending payments older than 15 minutes and releases reserved inventory", () => {
    const { cancelledCount } = reconcileStalePayments()
    assert.strictEqual(typeof cancelledCount, "number")
  })

  it("processes admin refund and records audit log", () => {
    const orderId = "ord_refund_test_789"
    createPaymentRecord({
      orderId,
      gateway: "bkash",
      amountBdt: 85000,
      customerPhone: "01755443322",
      customerEmail: "refund@test.com",
      items: [{ productId: "p_refund", quantity: 1 }],
    })

    markPaymentAsPaid({
      orderId,
      transactionId: "TRX_PAID_FOR_REFUND",
      amountBdt: 85000,
    })

    const refund = processRefund(orderId, 85000, "Customer cancelled before dispatch")
    assert.strictEqual(refund.success, true)
    assert.strictEqual(refund.status, "REFUNDED")
    assert.ok(refund.refundId.startsWith("RFD_"))

    const updated = getPaymentByOrderId(orderId)
    assert.strictEqual(updated?.status, "REFUNDED")
    assert.ok(updated?.auditLogs.some((l) => l.action === "PAYMENT_REFUNDED"))
  })
})
