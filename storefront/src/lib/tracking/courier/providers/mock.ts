import crypto from "crypto"
import { CourierProvider } from "../types"
import { CourierParcelPayload, CourierParcelResult } from "../../types"

export class MockCourierProvider implements CourierProvider {
  readonly name = "mock"
  private static parcels = new Map<
    string,
    {
      consignmentId: string
      trackingCode: string
      orderId: string
      status: string
      updatedAt: number
    }
  >()

  async createParcel(payload: CourierParcelPayload): Promise<CourierParcelResult> {
    const consignmentId = `STF_MOCK_${Date.now()}`
    const trackingCode = `TRK_${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    MockCourierProvider.parcels.set(consignmentId, {
      consignmentId,
      trackingCode,
      orderId: payload.orderId,
      status: "in_review",
      updatedAt: Date.now(),
    })

    return {
      success: true,
      consignmentId,
      trackingCode,
      courier: "mock",
      status: "in_review",
      message: "Mock parcel created successfully",
    }
  }

  async trackParcel(consignmentId: string): Promise<{
    status: string
    rawStatus: string
    updatedAt: number
    location?: string
  }> {
    const parcel = MockCourierProvider.parcels.get(consignmentId)
    if (!parcel) {
      return {
        status: "not_found",
        rawStatus: "not_found",
        updatedAt: Date.now(),
      }
    }

    return {
      status: parcel.status,
      rawStatus: parcel.status,
      updatedAt: parcel.updatedAt,
      location: "Dhaka Central Sorting Hub",
    }
  }

  verifyWebhookSignature(payload: string | Record<string, any>, signature: string): boolean {
    const secret = process.env.COURIER_WEBHOOK_SECRET || "mock_courier_webhook_secret_2026"
    const bodyStr = typeof payload === "string" ? payload : JSON.stringify(payload)
    const expected = crypto.createHmac("sha256", secret).update(bodyStr).digest("hex")

    try {
      const sigBuf = Buffer.from(signature, "hex")
      const expBuf = Buffer.from(expected, "hex")
      if (sigBuf.length !== expBuf.length) return false
      return crypto.timingSafeEqual(sigBuf, expBuf)
    } catch {
      return false
    }
  }

  static advanceStatus(consignmentId: string, newStatus: string): boolean {
    const parcel = this.parcels.get(consignmentId)
    if (!parcel) return false
    parcel.status = newStatus
    parcel.updatedAt = Date.now()
    return true
  }

  static clear(): void {
    this.parcels.clear()
  }
}
