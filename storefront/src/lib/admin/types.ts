export type AdminRole = "owner" | "manager" | "staff"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  passwordHash: string
  passwordSalt: string
  totpSecret: string // Base32 encoded TOTP secret
  twoFactorEnabled: boolean
  failedAttempts: number
  lockedUntil?: number
  lastLoginAt?: number
  createdAt: number
}

export interface AdminSession {
  sessionId: string
  adminId: string
  email: string
  role: AdminRole
  userAgent: string
  ip: string
  createdAt: number
  expiresAt: number
}

export interface AdminAuditLog {
  id: string
  adminId: string
  adminEmail: string
  action: string
  entityType: "product" | "order" | "inventory" | "coupon" | "auth" | "system"
  entityId?: string
  details?: Record<string, any>
  timestamp: string
}

export interface SalesAnalytics {
  todayRevenueBdt: number
  weekRevenueBdt: number
  monthRevenueBdt: number
  totalOrdersCount: number
  pendingOrdersCount: number
  shippedOrdersCount: number
  lowStockCount: number
  statusBreakdown: Record<string, number>
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed_bdt"
  discountValue: number
  minOrderValueBdt: number
  usageLimit: number
  usedCount: number
  expiresAt: number
  isActive: boolean
}
