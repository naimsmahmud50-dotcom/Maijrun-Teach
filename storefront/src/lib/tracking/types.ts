export type OrderStatus =
  | "ORDER_PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"

export type CourierProviderName = "mock" | "steadfast" | "pathao"

export interface TrackingTimelineEvent {
  status: OrderStatus
  title: string
  titleBn: string
  description: string
  descriptionBn: string
  timestamp: number
  location?: string
}

export interface OrderTrackingRecord {
  orderId: string
  customerId?: string
  phone: string // Full phone stored internally, masked in UI
  status: OrderStatus
  courier: CourierProviderName
  consignmentId?: string
  trackingCode?: string
  courierStatus?: string
  deliveryAddress: string
  district: string
  totalBdt: number
  items: Array<{
    productId: string
    title: string
    quantity: number
    thumbnail?: string
  }>
  events: TrackingTimelineEvent[]
  createdAt: number
  updatedAt: number
}

export interface CourierParcelPayload {
  orderId: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientDistrict: string
  amountToCollectBdt: number // 0 if pre-paid, full amount if COD
  itemDescription: string
}

export interface CourierParcelResult {
  success: boolean
  consignmentId: string
  trackingCode: string
  courier: CourierProviderName
  status: string
  message?: string
}
