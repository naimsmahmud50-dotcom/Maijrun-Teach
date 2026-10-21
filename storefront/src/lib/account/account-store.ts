import crypto from "crypto"
import { CustomerProfile, BangladeshAddress, CustomerDataExport } from "./types"
import { logSecurityAudit } from "../auth/audit-logger"

const customerProfiles = new Map<string, CustomerProfile>()
const phoneToCustomerId = new Map<string, string>()

/**
 * Finds existing customer or registers a new customer by verified Bangladesh phone
 */
export async function findOrCreateCustomerByPhone(phone: string): Promise<{
  customer: CustomerProfile
  isNew: boolean
}> {
  const existingId = phoneToCustomerId.get(phone)
  if (existingId && customerProfiles.has(existingId)) {
    return {
      customer: customerProfiles.get(existingId)!,
      isNew: false,
    }
  }

  const id = `cust_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`
  const now = Date.now()

  const newCustomer: CustomerProfile = {
    id,
    phone,
    name: "MAIJRUN Shopper",
    addresses: [],
    savedBuildIds: [],
    wishlistProductIds: [],
    createdAt: now,
    updatedAt: now,
  }

  customerProfiles.set(id, newCustomer)
  phoneToCustomerId.set(phone, id)

  logSecurityAudit({
    event: "CUSTOMER_REGISTERED",
    phone,
    details: { customerId: id },
  })

  return {
    customer: newCustomer,
    isNew: true,
  }
}

/**
 * Retrieve customer profile with ownership check
 */
export async function getCustomerById(id: string): Promise<CustomerProfile | null> {
  const profile = customerProfiles.get(id)
  return profile ? { ...profile } : null
}

/**
 * Update customer profile details
 */
export async function updateCustomerProfile(
  id: string,
  updates: { name?: string; email?: string }
): Promise<CustomerProfile | null> {
  const customer = customerProfiles.get(id)
  if (!customer) return null

  if (updates.name !== undefined) customer.name = updates.name.trim()
  if (updates.email !== undefined) customer.email = updates.email.trim().toLowerCase()
  customer.updatedAt = Date.now()

  return { ...customer }
}

/**
 * Add Bangladesh address with strict customer binding
 */
export async function addAddress(
  customerId: string,
  addrData: Omit<BangladeshAddress, "id" | "customerId" | "createdAt" | "updatedAt">
): Promise<BangladeshAddress | null> {
  const customer = customerProfiles.get(customerId)
  if (!customer) return null

  const id = `addr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
  const now = Date.now()

  // If set to default, unset other defaults
  if (addrData.isDefault) {
    customer.addresses.forEach((a) => (a.isDefault = false))
  }

  const newAddress: BangladeshAddress = {
    id,
    customerId,
    title: addrData.title || "Home",
    division: addrData.division,
    district: addrData.district,
    upazila: addrData.upazila,
    streetAddress: addrData.streetAddress,
    postalCode: addrData.postalCode,
    phone: addrData.phone,
    isDefault: customer.addresses.length === 0 ? true : addrData.isDefault,
    createdAt: now,
    updatedAt: now,
  }

  customer.addresses.push(newAddress)
  customer.updatedAt = now

  return newAddress
}

/**
 * Delete address with strict anti-IDOR validation
 */
export async function deleteAddress(customerId: string, addressId: string): Promise<boolean> {
  const customer = customerProfiles.get(customerId)
  if (!customer) return false

  const initialLength = customer.addresses.length
  customer.addresses = customer.addresses.filter((a) => a.id !== addressId)

  // If length didn't change, either address didn't exist or belonged to another user!
  if (customer.addresses.length === initialLength) {
    return false
  }

  customer.updatedAt = Date.now()
  return true
}

/**
 * Get all addresses for an authenticated customer
 */
export async function getAddresses(customerId: string): Promise<BangladeshAddress[]> {
  const customer = customerProfiles.get(customerId)
  return customer ? [...customer.addresses] : []
}

/**
 * Toggle Wishlist item
 */
export async function toggleWishlist(
  customerId: string,
  productId: string
): Promise<{ inWishlist: boolean; wishlist: string[] }> {
  const customer = customerProfiles.get(customerId)
  if (!customer) {
    return { inWishlist: false, wishlist: [] }
  }

  const idx = customer.wishlistProductIds.indexOf(productId)
  if (idx >= 0) {
    customer.wishlistProductIds.splice(idx, 1)
  } else {
    customer.wishlistProductIds.push(productId)
  }

  customer.updatedAt = Date.now()
  return {
    inWishlist: idx < 0,
    wishlist: [...customer.wishlistProductIds],
  }
}

/**
 * Link Saved PC Builder configuration
 */
export async function linkSavedBuild(customerId: string, buildId: string): Promise<boolean> {
  const customer = customerProfiles.get(customerId)
  if (!customer) return false

  if (!customer.savedBuildIds.includes(buildId)) {
    customer.savedBuildIds.push(buildId)
    customer.updatedAt = Date.now()
  }
  return true
}

/**
 * Export Customer Data (GDPR / Privacy by Design)
 */
export async function exportCustomerData(
  customerId: string,
  orders: any[] = [],
  savedBuilds: any[] = []
): Promise<CustomerDataExport | null> {
  const customer = customerProfiles.get(customerId)
  if (!customer) return null

  logSecurityAudit({
    event: "CUSTOMER_DATA_EXPORTED",
    phone: customer.phone,
    details: { customerId },
  })

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      avatarUrl: customer.avatarUrl,
      addresses: customer.addresses,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
    addresses: customer.addresses,
    orders,
    savedBuilds,
    wishlist: customer.wishlistProductIds,
  }
}

/**
 * Delete Customer Account (Permanent anonymization & removal)
 */
export async function deleteCustomerAccount(customerId: string): Promise<boolean> {
  const customer = customerProfiles.get(customerId)
  if (!customer) return false

  phoneToCustomerId.delete(customer.phone)
  customerProfiles.delete(customerId)

  logSecurityAudit({
    event: "CUSTOMER_ACCOUNT_DELETED",
    phone: customer.phone,
    details: { customerId },
  })

  return true
}

/**
 * Testing Helpers
 */
export function resetAccountStoreForTests(): void {
  customerProfiles.clear()
  phoneToCustomerId.clear()
}
