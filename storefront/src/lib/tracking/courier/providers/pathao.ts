import crypto from "crypto"
import { CourierProvider } from "../types"
import { CourierParcelPayload, CourierParcelResult } from "../../types"

export class PathaoCourierProvider implements CourierProvider {
  readonly name = "pathao"
  private clientId: string
  private clientSecret: string
  private webhookSecret: string
  private baseUrl: string

  constructor() {
    this.clientId = process.env.PATHAO_CLIENT_ID || ""
    this.clientSecret = process.env.PATHAO_CLIENT_SECRET || ""
    this.webhookSecret = process.env.PATHAO_WEBHOOK_SECRET || ""
    this.baseUrl = process.env.PATHAO_BASE_URL || "https://api-hermes.pathao.com/aladdin/api/v1"
  }

  async createParcel(payload: CourierParcelPayload): Promise<CourierParcelResult> {
    if (!this.clientId || !this.clientSecret) {
      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "pathao",
        status: "failed",
        message: "Pathao Courier credentials missing",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          merchant_order_id: payload.orderId,
          recipient_name: payload.recipientName,
          recipient_phone: payload.recipientPhone,
          recipient_address: payload.recipientAddress,
          amount_to_collect: payload.amountToCollectBdt,
          item_description: payload.itemDescription,
          item_type: 2, // Parcels / Electronics
        }),
      })

      const data = await response.json()

      if (response.ok && data.data?.consignment_id) {
        return {
          success: true,
          consignmentId: String(data.data.consignment_id),
          trackingCode: String(data.data.tracking_code || data.data.consignment_id),
          courier: "pathao",
          status: "order_created",
          message: "Pathao order created successfully",
        }
      }

      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "pathao",
        status: "error",
        message: data.message || "Failed to create Pathao order",
      }
    } catch (err: any) {
      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "pathao",
        status: "error",
        message: err.message,
      }
    }
  }

  async trackParcel(consignmentId: string): Promise<{
    status: string
    rawStatus: string
    updatedAt: number
    location?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${consignmentId}/info`, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
      const data = await response.json()
      if (response.ok && data.data) {
        return {
          status: data.data.order_status,
          rawStatus: data.data.order_status,
          updatedAt: Date.now(),
        }
      }
      return { status: "unknown", rawStatus: "not_found", updatedAt: Date.now() }
    } catch {
      return { status: "unknown", rawStatus: "network_error", updatedAt: Date.now() }
    }
  }

  verifyWebhookSignature(payload: string | Record<string, any>, signature: string): boolean {
    const secret = this.webhookSecret || process.env.COURIER_WEBHOOK_SECRET || ""
    if (!secret) return false

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
}
