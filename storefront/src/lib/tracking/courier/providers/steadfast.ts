import crypto from "crypto"
import { CourierProvider } from "../types"
import { CourierParcelPayload, CourierParcelResult } from "../../types"

export class SteadfastCourierProvider implements CourierProvider {
  readonly name = "steadfast"
  private apiKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.STEADFAST_API_KEY || ""
    this.secretKey = process.env.STEADFAST_SECRET_KEY || ""
    this.baseUrl = process.env.STEADFAST_BASE_URL || "https://portal.steadfast.com.bd/api/v1"
  }

  async createParcel(payload: CourierParcelPayload): Promise<CourierParcelResult> {
    if (!this.apiKey || !this.secretKey) {
      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "steadfast",
        status: "failed",
        message: "Steadfast Courier API credentials missing",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/create_order`, {
        method: "POST",
        headers: {
          "Api-Key": this.apiKey,
          "Secret-Key": this.secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: payload.orderId,
          recipient_name: payload.recipientName,
          recipient_phone: payload.recipientPhone,
          recipient_address: payload.recipientAddress,
          cod_amount: payload.amountToCollectBdt,
          note: payload.itemDescription,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === 200 && data.consignment) {
        return {
          success: true,
          consignmentId: String(data.consignment.consignment_id),
          trackingCode: String(data.consignment.tracking_code),
          courier: "steadfast",
          status: data.consignment.status || "in_review",
          message: "Steadfast consignment created",
        }
      }

      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "steadfast",
        status: "error",
        message: data.message || "Failed to create Steadfast order",
      }
    } catch (err: any) {
      return {
        success: false,
        consignmentId: "",
        trackingCode: "",
        courier: "steadfast",
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
    if (!this.apiKey || !this.secretKey) {
      return { status: "unknown", rawStatus: "missing_credentials", updatedAt: Date.now() }
    }

    try {
      const response = await fetch(`${this.baseUrl}/status_by_cid/${consignmentId}`, {
        method: "GET",
        headers: {
          "Api-Key": this.apiKey,
          "Secret-Key": this.secretKey,
        },
      })
      const data = await response.json()
      if (response.ok && data.delivery_status) {
        return {
          status: data.delivery_status,
          rawStatus: data.delivery_status,
          updatedAt: Date.now(),
        }
      }
      return { status: "unknown", rawStatus: data.message || "not_found", updatedAt: Date.now() }
    } catch {
      return { status: "unknown", rawStatus: "network_error", updatedAt: Date.now() }
    }
  }

  verifyWebhookSignature(payload: string | Record<string, any>, signature: string): boolean {
    if (!this.secretKey) return false
    const bodyStr = typeof payload === "string" ? payload : JSON.stringify(payload)
    const expected = crypto.createHmac("sha256", this.secretKey).update(bodyStr).digest("hex")

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
