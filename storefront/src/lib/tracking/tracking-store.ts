import crypto from "crypto"
import {
  OrderTrackingRecord,
  OrderStatus,
  TrackingTimelineEvent,
  CourierProviderName,
} from "./types"
import { getCourierProvider } from "./courier/factory"
import { logSecurityAudit } from "../auth/audit-logger"
import { normalizeBangladeshMobile, maskPhoneNumber } from "../auth/otp-service"

const trackingStore = new Map<string, OrderTrackingRecord>()

// Guest tracking query rate limits: IP -> Array of timestamps
const guestRateLimits = new Map<string, number[]>()
const GUEST_QUERY_LIMIT = 10 // Max 10 queries per minute per IP

// Notification queue
interface QueuedNotification {
  id: string
  orderId: string
  phone: string
  status: OrderStatus
  attempts: number
  sent: boolean
  createdAt: number
}

const notificationQueue: QueuedNotification[] = []

const STATUS_TITLES: Record<OrderStatus, { en: string; bn: string; descEn: string; descBn: string }> = {
  ORDER_PLACED: {
    en: "Order Placed & Confirmed",
    bn: "অর্ডার গ্রহণ ও নিশ্চিত করা হয়েছে",
    descEn: "We have received your order and payment/COD verification is complete.",
    descBn: "আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং তথ্য যাচাই সম্পন্ন হয়েছে।",
  },
  PROCESSING: {
    en: "Processing & Quality Checked",
    bn: "প্রসেসিং ও কোয়ালিটি চেকিং সম্পন্ন",
    descEn: "Hardware components are packed, serials logged, and secured in tamper-proof packaging.",
    descBn: "কম্পোনেন্ট ও ল্যাপটপটি সিকিউর বক্সে প্যাকেজিং করা হয়েছে।",
  },
  SHIPPED: {
    en: "Shipped with Courier",
    bn: "কুরিয়ারে হস্তান্তর করা হয়েছে",
    descEn: "Parcel handed over to our courier partner for fast delivery.",
    descBn: "পার্সেলটি নির্ভরযোগ্য কুরিয়ারে বুকিং দেওয়া হয়েছে।",
  },
  DELIVERED: {
    en: "Delivered Successfully",
    bn: "সফলভাবে ডেলিভারি সম্পন্ন",
    descEn: "The package has been delivered to your destination.",
    descBn: "আপনার কাছে পণ্যটি সফলভাবে পৌঁছে দেওয়া হয়েছে।",
  },
  CANCELLED: {
    en: "Order Cancelled",
    bn: "অর্ডার বাতিল করা হয়েছে",
    descEn: "This order has been cancelled.",
    descBn: "অর্ডারটি বাতিল করা হয়েছে।",
  },
  RETURNED: {
    en: "Parcel Returned",
    bn: "পার্সেল ফেরত এসেছে",
    descEn: "The package was returned to MAIJRUN Tech central hub.",
    descBn: "পার্সেলটি সেন্ট্রাল হাবে ফেরত পাঠানো হয়েছে।",
  },
}

/**
 * Creates initial order tracking record
 */
export async function createTrackingRecord(
  data: Omit<OrderTrackingRecord, "createdAt" | "updatedAt" | "events">
): Promise<OrderTrackingRecord> {
  const now = Date.now()
  const initialEvent: TrackingTimelineEvent = {
    status: data.status,
    title: STATUS_TITLES[data.status].en,
    titleBn: STATUS_TITLES[data.status].bn,
    description: STATUS_TITLES[data.status].descEn,
    descriptionBn: STATUS_TITLES[data.status].descBn,
    timestamp: now,
    location: "MAIJRUN Tech Central Warehouse, Dhaka",
  }

  const record: OrderTrackingRecord = {
    ...data,
    events: [initialEvent],
    createdAt: now,
    updatedAt: now,
  }

  trackingStore.set(data.orderId, record)

  // Queue initial notification
  queueNotification(data.orderId, data.phone, data.status)

  logSecurityAudit({
    event: "TRACKING_RECORD_CREATED",
    phone: data.phone,
    details: { orderId: data.orderId, totalBdt: data.totalBdt },
  })

  return record
}

/**
 * Update tracking status and append timeline event
 */
export async function updateTrackingStatus(
  orderId: string,
  newStatus: OrderStatus,
  customNote?: string,
  location?: string
): Promise<OrderTrackingRecord | null> {
  const record = trackingStore.get(orderId)
  if (!record) return null

  const now = Date.now()
  record.status = newStatus
  record.updatedAt = now

  const statusMeta = STATUS_TITLES[newStatus]
  const newEvent: TrackingTimelineEvent = {
    status: newStatus,
    title: statusMeta.en,
    titleBn: statusMeta.bn,
    description: customNote || statusMeta.descEn,
    descriptionBn: customNote || statusMeta.descBn,
    timestamp: now,
    location: location || "In Transit, Bangladesh",
  }

  record.events.push(newEvent)

  // Trigger notification
  queueNotification(orderId, record.phone, newStatus)

  logSecurityAudit({
    event: "ORDER_STATUS_UPDATED",
    phone: record.phone,
    details: { orderId, newStatus },
  })

  return record
}

/**
 * Dispatch Order to Courier (Steadfast or Pathao)
 */
export async function dispatchOrderToCourier(
  orderId: string,
  courierName?: CourierProviderName
): Promise<{ success: boolean; record?: OrderTrackingRecord; message?: string }> {
  const record = trackingStore.get(orderId)
  if (!record) {
    return { success: false, message: "Order not found" }
  }

  const courier = getCourierProvider(courierName || record.courier)
  const result = await courier.createParcel({
    orderId: record.orderId,
    recipientName: "Customer",
    recipientPhone: record.phone,
    recipientAddress: record.deliveryAddress,
    recipientDistrict: record.district,
    amountToCollectBdt: 0, // In production, evaluate if COD
    itemDescription: record.items.map((i) => `${i.title} x${i.quantity}`).join(", "),
  })

  if (!result.success) {
    return { success: false, message: result.message || "Failed to create courier parcel" }
  }

  record.consignmentId = result.consignmentId
  record.trackingCode = result.trackingCode
  record.courier = courier.name as CourierProviderName
  record.courierStatus = result.status

  // Advance status to SHIPPED
  await updateTrackingStatus(
    orderId,
    "SHIPPED",
    `Handed over to ${courier.name.toUpperCase()} (Consignment: ${result.consignmentId}, Tracking: ${result.trackingCode})`,
    "Courier Hub, Dhaka"
  )

  return { success: true, record }
}

/**
 * Handles incoming courier webhook with signature verification
 */
export async function handleCourierWebhook(
  providerName: string,
  payload: any,
  signature: string
): Promise<{ success: boolean; message: string }> {
  const courier = getCourierProvider(providerName)

  // 1. Verify Webhook Signature / Secret
  const isValid = courier.verifyWebhookSignature(payload, signature)
  if (!isValid) {
    logSecurityAudit({
      event: "COURIER_WEBHOOK_FORGERY_ATTEMPT",
      details: { provider: providerName },
    })
    return { success: false, message: "Invalid webhook signature" }
  }

  // 2. Extract Consignment and Status
  const consignmentId = String(payload.consignment_id || payload.order_id || payload.consignmentId || "")
  const courierStatus = String(payload.status || payload.delivery_status || "").toLowerCase()

  if (!consignmentId) {
    return { success: false, message: "Missing consignment ID in payload" }
  }

  // Find matching order
  let targetOrder: OrderTrackingRecord | undefined
  for (const record of Array.from(trackingStore.values())) {
    if (record.consignmentId === consignmentId || record.orderId === consignmentId) {
      targetOrder = record
      break
    }
  }

  if (!targetOrder) {
    return { success: false, message: "Order matching consignment ID not found" }
  }

  // Translate courier status to internal status
  if (courierStatus.includes("delivered")) {
    await updateTrackingStatus(targetOrder.orderId, "DELIVERED", "Package delivered to customer")
  } else if (courierStatus.includes("cancelled") || courierStatus.includes("cancelled_by_customer")) {
    await updateTrackingStatus(targetOrder.orderId, "CANCELLED", "Order cancelled by courier/customer")
  } else if (courierStatus.includes("return")) {
    await updateTrackingStatus(targetOrder.orderId, "RETURNED", "Package returned to hub")
  }

  return { success: true, message: "Webhook processed" }
}

/**
 * Authenticated order tracking lookup with IDOR check
 */
export async function getTrackingByOrderId(
  orderId: string,
  customerId?: string
): Promise<OrderTrackingRecord | null> {
  const record = trackingStore.get(orderId)
  if (!record) return null

  // If customerId is provided, enforce ownership check
  if (customerId && record.customerId && record.customerId !== customerId) {
    logSecurityAudit({
      event: "IDOR_ATTEMPT_TRACKING",
      details: { requestedOrderId: orderId, unauthorizedCustomerId: customerId },
    })
    return null
  }

  return { ...record }
}

/**
 * Guest tracking lookup by Order ID + Phone Number (Rate limited to 10 queries/min/IP)
 */
export async function getGuestTracking({
  orderId,
  phone,
  ip = "127.0.0.1",
}: {
  orderId: string
  phone: string
  ip?: string
}): Promise<{ success: boolean; record?: OrderTrackingRecord; message?: string }> {
  // Rate limiting check
  const now = Date.now()
  const oneMinAgo = now - 60 * 1000
  const ipLogs = (guestRateLimits.get(ip) || []).filter((t) => t > oneMinAgo)

  if (ipLogs.length >= GUEST_QUERY_LIMIT) {
    logSecurityAudit({
      event: "GUEST_TRACKING_RATE_LIMIT",
      ip,
      details: { orderId },
    })
    return {
      success: false,
      message: "Too many tracking lookups. Please wait a minute and try again.",
    }
  }

  ipLogs.push(now)
  guestRateLimits.set(ip, ipLogs)

  const normalizedPhone = normalizeBangladeshMobile(phone)
  if (!normalizedPhone) {
    return { success: false, message: "Invalid Bangladesh phone number." }
  }

  const record = trackingStore.get(orderId.trim())
  if (!record) {
    return { success: false, message: "No order found matching the provided details." }
  }

  // Strict Phone Number Match (Anti-Brute Force Protection)
  if (record.phone !== normalizedPhone) {
    logSecurityAudit({
      event: "GUEST_TRACKING_PHONE_MISMATCH",
      phone: normalizedPhone,
      ip,
      details: { orderId },
    })
    return { success: false, message: "No order found matching the provided details." }
  }

  // Return masked record for privacy
  const sanitizedRecord: OrderTrackingRecord = {
    ...record,
    phone: maskPhoneNumber(record.phone),
  }

  return { success: true, record: sanitizedRecord }
}

/**
 * Queue notification with retry
 */
function queueNotification(orderId: string, phone: string, status: OrderStatus): void {
  const notif: QueuedNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId,
    phone,
    status,
    attempts: 0,
    sent: false,
    createdAt: Date.now(),
  }
  notificationQueue.push(notif)
  // Process immediately (simulated queue)
  processNotification(notif)
}

function processNotification(notif: QueuedNotification): void {
  notif.attempts++
  // Stub: in production, send SMS or email via queue worker
  notif.sent = true
}

export function getQueuedNotifications(): QueuedNotification[] {
  return [...notificationQueue]
}

/**
 * Testing Helpers
 */
export function resetTrackingStoreForTests(): void {
  trackingStore.clear()
  guestRateLimits.clear()
  notificationQueue.length = 0
}
