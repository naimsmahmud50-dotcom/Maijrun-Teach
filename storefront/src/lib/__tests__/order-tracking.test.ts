import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import crypto from "crypto"
import {
  createTrackingRecord,
  updateTrackingStatus,
  dispatchOrderToCourier,
  handleCourierWebhook,
  getTrackingByOrderId,
  getGuestTracking,
  resetTrackingStoreForTests,
} from "../tracking/tracking-store"
import { MockCourierProvider } from "../tracking/courier/providers/mock"

describe("Phase 9: Live Order Tracking & Courier Engine Tests", () => {
  const sampleOrder = {
    orderId: "MJR-2026-X8K9P2",
    customerId: "cust_12345",
    phone: "+8801712345678",
    status: "ORDER_PLACED" as const,
    courier: "mock" as const,
    deliveryAddress: "House 12, Road 4, Dhanmondi",
    district: "Dhaka",
    totalBdt: 245080,
    items: [
      {
        productId: "prod_asus_zephyrus_g16",
        title: "Asus ROG Zephyrus G16 (2025)",
        quantity: 1,
      },
    ],
  }

  beforeEach(() => {
    resetTrackingStoreForTests()
    MockCourierProvider.clear()
  })

  describe("1. Tracking Timeline & Progress Lifecycle", () => {
    it("should initialize order with ORDER_PLACED timeline event", async () => {
      const record = await createTrackingRecord(sampleOrder)
      assert.strictEqual(record.status, "ORDER_PLACED")
      assert.strictEqual(record.events.length, 1)
      assert.strictEqual(record.events[0].status, "ORDER_PLACED")
      assert.ok(record.events[0].title.includes("Order Placed"))
    })

    it("should transition status and append audit events sequentially", async () => {
      await createTrackingRecord(sampleOrder)

      // Step 2: Processing
      const processing = await updateTrackingStatus(sampleOrder.orderId, "PROCESSING", "Packed in anti-static box")
      assert.strictEqual(processing?.status, "PROCESSING")
      assert.strictEqual(processing?.events.length, 2)

      // Step 3: Shipped
      const shipped = await updateTrackingStatus(sampleOrder.orderId, "SHIPPED", "Handed over to courier")
      assert.strictEqual(shipped?.status, "SHIPPED")
      assert.strictEqual(shipped?.events.length, 3)

      // Step 4: Delivered
      const delivered = await updateTrackingStatus(sampleOrder.orderId, "DELIVERED", "Customer signed receipt")
      assert.strictEqual(delivered?.status, "DELIVERED")
      assert.strictEqual(delivered?.events.length, 4)
    })
  })

  describe("2. Courier Integration & Webhooks", () => {
    it("should dispatch order to courier and update consignment ID", async () => {
      await createTrackingRecord(sampleOrder)
      const dispatchRes = await dispatchOrderToCourier(sampleOrder.orderId, "mock")

      assert.strictEqual(dispatchRes.success, true)
      assert.ok(dispatchRes.record?.consignmentId)
      assert.ok(dispatchRes.record?.trackingCode)
      assert.strictEqual(dispatchRes.record?.status, "SHIPPED")
    })

    it("should process courier webhook and update status to DELIVERED", async () => {
      await createTrackingRecord(sampleOrder)
      const dispatch = await dispatchOrderToCourier(sampleOrder.orderId, "mock")
      const cid = dispatch.record!.consignmentId!

      // Generate legitimate HMAC signature
      const secret = process.env.COURIER_WEBHOOK_SECRET || "mock_courier_webhook_secret_2026"
      const payload = { consignment_id: cid, status: "delivered" }
      const validSig = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex")

      const webhookRes = await handleCourierWebhook("mock", payload, validSig)
      assert.strictEqual(webhookRes.success, true)

      // Verify order updated to DELIVERED
      const updated = await getTrackingByOrderId(sampleOrder.orderId)
      assert.strictEqual(updated?.status, "DELIVERED")
    })

    it("should reject forged courier webhook signatures (Anti-Tampering)", async () => {
      await createTrackingRecord(sampleOrder)
      const dispatch = await dispatchOrderToCourier(sampleOrder.orderId, "mock")
      const cid = dispatch.record!.consignmentId!

      const forgedSig = "deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678"
      const payload = { consignment_id: cid, status: "delivered" }

      const webhookRes = await handleCourierWebhook("mock", payload, forgedSig)
      assert.strictEqual(webhookRes.success, false)
      assert.strictEqual(webhookRes.message, "Invalid webhook signature")
    })
  })

  describe("3. Guest Tracking & IDOR Protection", () => {
    it("should allow guest tracking with matching phone number and mask phone in response", async () => {
      await createTrackingRecord(sampleOrder)

      const guestRes = await getGuestTracking({
        orderId: sampleOrder.orderId,
        phone: "01712345678", // local format matches normalized
        ip: "10.0.0.1",
      })

      assert.strictEqual(guestRes.success, true)
      assert.ok(guestRes.record)
      assert.strictEqual(guestRes.record?.phone, "+88017****-***78") // Masked!
    })

    it("should reject guest tracking when phone number does not match (anti-enumeration)", async () => {
      await createTrackingRecord(sampleOrder)

      const guestRes = await getGuestTracking({
        orderId: sampleOrder.orderId,
        phone: "01999999999", // Wrong phone
        ip: "10.0.0.2",
      })

      assert.strictEqual(guestRes.success, false)
      assert.strictEqual(guestRes.record, undefined)
      assert.match(guestRes.message!, /No order found/i)
    })

    it("should enforce rate limiting on guest tracking queries (max 10 queries/min/IP)", async () => {
      await createTrackingRecord(sampleOrder)

      // 10 queries allowed
      for (let i = 0; i < 10; i++) {
        const res = await getGuestTracking({
          orderId: sampleOrder.orderId,
          phone: "01712345678",
          ip: "192.168.10.50",
        })
        assert.strictEqual(res.success, true)
      }

      // 11th query from same IP within the minute is rate-limited
      const rateLimited = await getGuestTracking({
        orderId: sampleOrder.orderId,
        phone: "01712345678",
        ip: "192.168.10.50",
      })

      assert.strictEqual(rateLimited.success, false)
      assert.match(rateLimited.message!, /Too many tracking lookups/i)
    })
  })
})
