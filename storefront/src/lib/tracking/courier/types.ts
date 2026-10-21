import { CourierParcelPayload, CourierParcelResult } from "../types"

export interface CourierProvider {
  readonly name: string
  createParcel(payload: CourierParcelPayload): Promise<CourierParcelResult>
  trackParcel(consignmentId: string): Promise<{
    status: string
    rawStatus: string
    updatedAt: number
    location?: string
  }>
  verifyWebhookSignature(payload: string | Record<string, any>, signature: string): boolean
}
