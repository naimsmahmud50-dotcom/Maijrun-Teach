import { SalesAnalytics, Coupon } from "./types"
import { DEMO_PRODUCTS } from "../demo-products"
import { recordAdminAudit } from "./audit"
import {
  dispatchOrderToCourier,
  updateTrackingStatus,
  createTrackingRecord,
} from "../tracking/tracking-store"

export interface AdminProductItem {
  id: string
  title: string
  handle: string
  category: string
  brand: string
  priceBdt: number
  inventoryQuantity: number
  thumbnail: string
  specs: Record<string, any>
  createdAt: number
}

export interface InventoryAdjustmentLog {
  id: string
  productId: string
  productTitle: string
  delta: number
  newQuantity: number
  reason: string
  adjustedBy: string
  timestamp: string
}

export interface AdminOrderRecord {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  district: string
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  paymentMethod: string
  totalBdt: number
  itemCount: number
  items: Array<{ title: string; quantity: number; unitPriceBdt: number }>
  courier?: "steadfast" | "pathao" | "mock"
  consignmentId?: string
  trackingCode?: string
  createdAt: number
}

// In-memory repositories
const adminProducts = new Map<string, AdminProductItem>()
const adminOrders = new Map<string, AdminOrderRecord>()
const inventoryLogs: InventoryAdjustmentLog[] = []
const couponsStore = new Map<string, Coupon>()

// Initialize default catalog from DEMO_PRODUCTS
function initDefaultCatalog(): void {
  if (adminProducts.size > 0) return

  for (const p of DEMO_PRODUCTS) {
    const meta = (p.metadata?.specs || p.metadata || {}) as Record<string, any>
    const price = p.variants?.[0]?.calculated_price?.calculated_amount ?? 150000
    const qty = p.variants?.[0]?.inventory_quantity ?? 5

    adminProducts.set(p.id, {
      id: p.id,
      title: p.title,
      handle: p.handle,
      category: meta.category || "Laptops",
      brand: meta.brand || "MAIJRUN",
      priceBdt: price,
      inventoryQuantity: qty,
      thumbnail: p.thumbnail || p.images?.[0]?.url || "",
      specs: meta,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    })
  }

  // Seed default sample orders
  if (adminOrders.size === 0) {
    adminOrders.set("MJR-2026-X8K9P2", {
      id: "ord_01",
      orderNumber: "MJR-2026-X8K9P2",
      customerName: "Mahmud Hasan",
      customerPhone: "+8801712345678",
      customerAddress: "House 12, Road 4, Dhanmondi",
      district: "Dhaka",
      status: "SHIPPED",
      paymentMethod: "bKash",
      totalBdt: 245080,
      itemCount: 1,
      items: [{ title: "Asus ROG Zephyrus G16 (2025)", quantity: 1, unitPriceBdt: 245000 }],
      courier: "steadfast",
      consignmentId: "STF_998124",
      trackingCode: "TRK_88491",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    })

    adminOrders.set("MJR-2026-W4B2M1", {
      id: "ord_02",
      orderNumber: "MJR-2026-W4B2M1",
      customerName: "Tanvir Ahmed",
      customerPhone: "+8801812345678",
      customerAddress: "GEC Circle, Nasirabad",
      district: "Chattogram",
      status: "PROCESSING",
      paymentMethod: "Cash on Delivery",
      totalBdt: 175150,
      itemCount: 1,
      items: [{ title: "Lenovo Legion Pro 5 AMD Ryzen 7", quantity: 1, unitPriceBdt: 175000 }],
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
    })
  }

  // Seed default coupon
  if (couponsStore.size === 0) {
    couponsStore.set("MAIJRUN10", {
      id: "coup_01",
      code: "MAIJRUN10",
      discountType: "percentage",
      discountValue: 10,
      minOrderValueBdt: 50000,
      usageLimit: 500,
      usedCount: 42,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      isActive: true,
    })
  }
}

initDefaultCatalog()

/**
 * Products Operations
 */
export async function getAdminProducts(): Promise<AdminProductItem[]> {
  initDefaultCatalog()
  return Array.from(adminProducts.values())
}

export async function upsertAdminProduct(
  product: Partial<AdminProductItem> & { title: string; priceBdt: number },
  adminEmail = "admin@maijrun.com"
): Promise<AdminProductItem> {
  initDefaultCatalog()
  const id = product.id || `prod_${Date.now()}`
  const existing = adminProducts.get(id)

  const item: AdminProductItem = {
    id,
    title: product.title,
    handle: product.handle || product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: product.category || "Laptops",
    brand: product.brand || "MAIJRUN",
    priceBdt: product.priceBdt,
    inventoryQuantity: product.inventoryQuantity ?? 5,
    thumbnail: product.thumbnail || "",
    specs: product.specs || {},
    createdAt: existing?.createdAt || Date.now(),
  }

  adminProducts.set(id, item)

  recordAdminAudit({
    adminId: "admin",
    adminEmail,
    action: existing ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
    entityType: "product",
    entityId: id,
    details: { title: item.title, priceBdt: item.priceBdt },
  })

  return item
}

export async function deleteAdminProduct(id: string, adminEmail = "admin@maijrun.com"): Promise<boolean> {
  const existing = adminProducts.get(id)
  if (!existing) return false

  adminProducts.delete(id)
  recordAdminAudit({
    adminId: "admin",
    adminEmail,
    action: "PRODUCT_DELETED",
    entityType: "product",
    entityId: id,
    details: { title: existing.title },
  })
  return true
}

/**
 * Bulk CSV Export
 */
export function exportProductsCsv(): string {
  initDefaultCatalog()
  const headers = ["ID", "Title", "Brand", "Category", "Price BDT", "Stock", "Processor", "RAM", "Storage"]
  const rows: string[] = [headers.join(",")]

  for (const p of Array.from(adminProducts.values())) {
    const row = [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.priceBdt,
      p.inventoryQuantity,
      `"${p.specs.processor || ""}"`,
      `"${p.specs.ram || ""}"`,
      `"${p.specs.storage || ""}"`,
    ]
    rows.push(row.join(","))
  }

  return rows.join("\n")
}

/**
 * Bulk CSV Import
 */
export function importProductsCsv(csvContent: string): { importedCount: number; errors: string[] } {
  const lines = csvContent.split("\n").filter((l) => l.trim().length > 0)
  if (lines.length < 2) return { importedCount: 0, errors: ["Empty or invalid CSV file."] }

  let imported = 0
  const errors: string[] = []

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((s) => s.trim().replace(/^"|"$/g, ""))
    if (parts.length >= 5) {
      const [id, title, brand, category, priceStr, stockStr] = parts
      const price = parseFloat(priceStr)
      const stock = parseInt(stockStr || "5", 10)

      if (title && !isNaN(price)) {
        upsertAdminProduct({
          id: id || `csv_${Date.now()}_${i}`,
          title,
          brand: brand || "MAIJRUN",
          category: category || "Components",
          priceBdt: price,
          inventoryQuantity: isNaN(stock) ? 5 : stock,
        })
        imported++
      } else {
        errors.push(`Row ${i + 1}: Invalid title or price value.`)
      }
    }
  }

  return { importedCount: imported, errors }
}

/**
 * Inventory Adjustment & Low-Stock Alerts
 */
export async function adjustInventory(
  productId: string,
  delta: number,
  reason: string,
  adminEmail = "admin@maijrun.com"
): Promise<{ success: boolean; newQuantity?: number; isLowStock?: boolean }> {
  initDefaultCatalog()
  const product = adminProducts.get(productId)
  if (!product) return { success: false }

  product.inventoryQuantity = Math.max(0, product.inventoryQuantity + delta)
  const isLowStock = product.inventoryQuantity < 3

  const log: InventoryAdjustmentLog = {
    id: `invlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    productId,
    productTitle: product.title,
    delta,
    newQuantity: product.inventoryQuantity,
    reason,
    adjustedBy: adminEmail,
    timestamp: new Date().toISOString(),
  }

  inventoryLogs.push(log)

  recordAdminAudit({
    adminId: "admin",
    adminEmail,
    action: "INVENTORY_ADJUSTED",
    entityType: "inventory",
    entityId: productId,
    details: { delta, newQuantity: product.inventoryQuantity, reason },
  })

  return {
    success: true,
    newQuantity: product.inventoryQuantity,
    isLowStock,
  }
}

export function getInventoryLogs(): InventoryAdjustmentLog[] {
  return [...inventoryLogs].reverse()
}

/**
 * Order Fulfillment & Courier Dispatch
 */
export async function getAdminOrders(): Promise<AdminOrderRecord[]> {
  initDefaultCatalog()
  return Array.from(adminOrders.values())
}

export async function fulfillOrder(
  orderNumber: string,
  courierName: "steadfast" | "pathao" | "mock",
  adminEmail = "admin@maijrun.com"
): Promise<{ success: boolean; order?: AdminOrderRecord; message?: string }> {
  initDefaultCatalog()
  const order = adminOrders.get(orderNumber)
  if (!order) return { success: false, message: "Order not found" }

  // Call tracking store to create courier parcel
  let dispatchRes = await dispatchOrderToCourier(orderNumber, courierName)
  if (!dispatchRes.success && dispatchRes.message === "Order not found") {
    await createTrackingRecord({
      orderId: order.orderNumber,
      phone: order.customerPhone,
      deliveryAddress: order.customerAddress,
      district: order.district,
      totalBdt: order.totalBdt,
      items: order.items.map((it, idx) => ({
        productId: `prod_item_${idx}`,
        title: it.title,
        quantity: it.quantity,
      })),
      status: "PROCESSING",
      courier: courierName,
    })
    dispatchRes = await dispatchOrderToCourier(orderNumber, courierName)
  }

  // If live credentials are not configured in dev/test, fallback gracefully to mock courier provider
  if (!dispatchRes.success && (dispatchRes.message?.includes("credentials missing") || dispatchRes.message?.includes("API credentials"))) {
    dispatchRes = await dispatchOrderToCourier(orderNumber, "mock")
  }

  if (!dispatchRes.success) {
    return { success: false, message: dispatchRes.message }
  }

  order.status = "SHIPPED"
  order.courier = courierName
  order.consignmentId = dispatchRes.record?.consignmentId || `${courierName.toUpperCase()}_${Date.now()}`
  order.trackingCode = dispatchRes.record?.trackingCode || `TRK_${Date.now()}`

  recordAdminAudit({
    adminId: "admin",
    adminEmail,
    action: "ORDER_FULFILLED_COURIER_DISPATCHED",
    entityType: "order",
    entityId: orderNumber,
    details: { courier: courierName, consignmentId: order.consignmentId },
  })

  return { success: true, order }
}

export async function cancelOrRefundOrder(
  orderNumber: string,
  restock = true,
  adminEmail = "admin@maijrun.com"
): Promise<{ success: boolean; message: string }> {
  initDefaultCatalog()
  const order = adminOrders.get(orderNumber)
  if (!order) return { success: false, message: "Order not found" }

  order.status = "CANCELLED"

  // Restock inventory
  if (restock) {
    for (const item of order.items) {
      // Find matching product
      for (const prod of Array.from(adminProducts.values())) {
        if (prod.title === item.title) {
          await adjustInventory(prod.id, item.quantity, `Restock from cancelled order ${orderNumber}`, adminEmail)
          break
        }
      }
    }
  }

  // Update tracking
  await updateTrackingStatus(orderNumber, "CANCELLED", "Order cancelled and refunded by admin")

  recordAdminAudit({
    adminId: "admin",
    adminEmail,
    action: "ORDER_CANCELLED_REFUNDED",
    entityType: "order",
    entityId: orderNumber,
    details: { restocked: restock },
  })

  return { success: true, message: `Order ${orderNumber} cancelled and refunded.` }
}

/**
 * Coupon Management & Valuation
 */
export function getCoupons(): Coupon[] {
  initDefaultCatalog()
  return Array.from(couponsStore.values())
}

export function validateCoupon(
  code: string,
  subtotalBdt: number
): { valid: boolean; discountAmountBdt: number; message?: string } {
  initDefaultCatalog()
  const coupon = couponsStore.get(code.trim().toUpperCase())
  if (!coupon || !coupon.isActive) {
    return { valid: false, discountAmountBdt: 0, message: "Invalid or inactive coupon code." }
  }

  if (Date.now() > coupon.expiresAt) {
    return { valid: false, discountAmountBdt: 0, message: "This coupon code has expired." }
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmountBdt: 0, message: "This coupon has reached its usage limit." }
  }

  if (subtotalBdt < coupon.minOrderValueBdt) {
    return {
      valid: false,
      discountAmountBdt: 0,
      message: `Minimum order value of ৳${coupon.minOrderValueBdt.toLocaleString()} required.`,
    }
  }

  let discount = 0
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotalBdt * coupon.discountValue) / 100)
  } else {
    discount = coupon.discountValue
  }

  return { valid: true, discountAmountBdt: discount }
}

/**
 * Sales Analytics Calculator
 */
export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  initDefaultCatalog()
  const orders = Array.from(adminOrders.values())
  const products = Array.from(adminProducts.values())

  let todayRevenue = 0
  let weekRevenue = 0
  let monthRevenue = 0
  const breakdown: Record<string, number> = {
    PENDING_PAYMENT: 0,
    PAID: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  }

  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

  for (const o of orders) {
    breakdown[o.status] = (breakdown[o.status] || 0) + 1

    if (o.status !== "CANCELLED") {
      if (o.createdAt >= oneMonthAgo) monthRevenue += o.totalBdt
      if (o.createdAt >= oneWeekAgo) weekRevenue += o.totalBdt
      if (o.createdAt >= oneDayAgo) todayRevenue += o.totalBdt
    }
  }

  const lowStockCount = products.filter((p) => p.inventoryQuantity < 3).length

  return {
    todayRevenueBdt: todayRevenue,
    weekRevenueBdt: weekRevenue,
    monthRevenueBdt: monthRevenue,
    totalOrdersCount: orders.length,
    pendingOrdersCount: breakdown.PROCESSING + breakdown.PENDING_PAYMENT,
    shippedOrdersCount: breakdown.SHIPPED + breakdown.DELIVERED,
    lowStockCount,
    statusBreakdown: breakdown,
  }
}

/**
 * Testing Helpers
 */
export function resetAdminStoreForTests(): void {
  adminProducts.clear()
  adminOrders.clear()
  inventoryLogs.length = 0
  couponsStore.clear()
  initDefaultCatalog()
}
