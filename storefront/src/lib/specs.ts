import { z } from "zod"

/**
 * Standard Tech Specification Schema for MAIJRUN Tech Products
 */
export const ProductSpecsSchema = z.object({
  brand: z.string().optional(),
  processor: z.string().optional(),
  processorFamily: z.enum([
    "Core i3",
    "Core i5",
    "Core i7",
    "Core i9",
    "Ryzen 5",
    "Ryzen 7",
    "Ryzen 9",
    "Apple M-Series",
    "Other",
  ]).optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  gpu: z.string().optional(),
  display: z.string().optional(),
  battery: z.string().optional(),
  os: z.string().optional(),
  ports: z.string().optional(),
  weight: z.string().optional(),
  warranty: z.string().optional(),
  isDemo: z.boolean().optional(),
})

export type ProductSpecs = z.infer<typeof ProductSpecsSchema>

/**
 * Stock Status Types & Logic
 */
export type StockStatusType = "in_stock" | "low_stock" | "out_of_stock"

export interface StockInfo {
  status: StockStatusType
  label: string
  badgeClass: string
  availableQuantity: number
  isPurchaseable: boolean
}

export function getStockStatus(
  quantity: number | null | undefined,
  manageInventory = true,
  allowBackorder = false,
  lowStockThreshold = 5
): StockInfo {
  // If product does not manage inventory or allows backorders, it is always in stock
  if (!manageInventory || allowBackorder) {
    return {
      status: "in_stock",
      label: "In Stock",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      availableQuantity: typeof quantity === "number" ? quantity : 999,
      isPurchaseable: true,
    }
  }

  const qty = typeof quantity === "number" && !isNaN(quantity) ? quantity : 0

  if (qty <= 0) {
    return {
      status: "out_of_stock",
      label: "Out of Stock",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      availableQuantity: 0,
      isPurchaseable: false,
    }
  }

  if (qty <= lowStockThreshold) {
    return {
      status: "low_stock",
      label: `Low Stock (${qty} remaining)`,
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      availableQuantity: qty,
      isPurchaseable: true,
    }
  }

  return {
    status: "in_stock",
    label: "In Stock",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    availableQuantity: qty,
    isPurchaseable: true,
  }
}

/**
 * Parses technical specifications from Medusa product metadata.
 * Returns null if metadata is missing, empty, or has no spec attributes.
 */
export function parseProductSpecs(
  metadata: Record<string, unknown> | null | undefined
): ProductSpecs | null {
  if (!metadata || typeof metadata !== "object") {
    return null
  }

  // Handle nested `specs` key or flat metadata
  const rawSpecs =
    metadata.specs && typeof metadata.specs === "object"
      ? (metadata.specs as Record<string, unknown>)
      : metadata

  const parsed = ProductSpecsSchema.safeParse(rawSpecs)
  if (!parsed.success) {
    return null
  }

  // Ensure at least one known spec field is populated
  const hasAtLeastOneField = Object.entries(parsed.data).some(
    ([key, value]) => key !== "isDemo" && typeof value === "string" && value.trim().length > 0
  )

  if (!hasAtLeastOneField) {
    return null
  }

  return parsed.data
}

export interface SpecDisplayRow {
  label: string
  value: string
  key: keyof ProductSpecs
}

export const SPEC_DEFINITIONS: { key: keyof ProductSpecs; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "processor", label: "Processor (CPU)" },
  { key: "ram", label: "System Memory (RAM)" },
  { key: "storage", label: "Storage Drive (SSD/HDD)" },
  { key: "gpu", label: "Graphics Card (GPU)" },
  { key: "display", label: "Display Screen" },
  { key: "battery", label: "Battery & Charger" },
  { key: "os", label: "Operating System" },
  { key: "ports", label: "I/O Ports & Connectivity" },
  { key: "weight", label: "Physical Weight" },
  { key: "warranty", label: "Warranty Coverage" },
]

export function getVisibleSpecRows(specs: ProductSpecs | null): SpecDisplayRow[] {
  if (!specs) return []

  return SPEC_DEFINITIONS.map(({ key, label }) => {
    const val = specs[key]
    if (typeof val === "string" && val.trim().length > 0) {
      return { key, label, value: val.trim() }
    }
    return null
  }).filter((row): row is SpecDisplayRow => row !== null)
}

/**
 * Calculates aggregate inventory levels across all product variants.
 */
export function getProductInventoryQuantity(product: any): {
  totalQuantity: number
  hasManagedInventory: boolean
  allowsBackorder: boolean
} {
  if (!product || !product.variants || product.variants.length === 0) {
    return { totalQuantity: 0, hasManagedInventory: false, allowsBackorder: false }
  }

  let total = 0
  let anyManaged = false
  let anyBackorder = false

  for (const variant of product.variants) {
    if (variant.manage_inventory) {
      anyManaged = true
    }
    if (variant.allow_backorder) {
      anyBackorder = true
    }
    if (typeof variant.inventory_quantity === "number") {
      total += variant.inventory_quantity
    }
  }

  return {
    totalQuantity: total,
    hasManagedInventory: anyManaged,
    allowsBackorder: anyBackorder,
  }
}

/**
 * Returns complete stock information for a product.
 */
export function getProductStockInfo(
  product: any,
  lowStockThreshold = 5
): StockInfo {
  const { totalQuantity, hasManagedInventory, allowsBackorder } =
    getProductInventoryQuantity(product)
  return getStockStatus(
    totalQuantity,
    hasManagedInventory,
    allowsBackorder,
    lowStockThreshold
  )
}

