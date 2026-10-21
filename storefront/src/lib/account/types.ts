export interface BangladeshAddress {
  id: string
  customerId: string
  title: string // e.g. "Home", "Office"
  division: string // e.g. "Dhaka", "Chattogram", "Rajshahi", etc.
  district: string // e.g. "Dhaka", "Gazipur", "Sylhet"
  upazila: string // e.g. "Dhanmondi", "Mirpur", "Sadar"
  streetAddress: string
  postalCode?: string
  phone: string
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface CustomerProfile {
  id: string
  phone: string
  name: string
  email?: string
  avatarUrl?: string
  addresses: BangladeshAddress[]
  savedBuildIds: string[]
  wishlistProductIds: string[]
  createdAt: number
  updatedAt: number
}

export interface CustomerDataExport {
  exportedAt: string
  profile: Omit<CustomerProfile, "wishlistProductIds" | "savedBuildIds">
  addresses: BangladeshAddress[]
  orders: any[]
  savedBuilds: any[]
  wishlist: any[]
}
