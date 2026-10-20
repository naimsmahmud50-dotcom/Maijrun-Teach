import { HttpTypes } from "@medusajs/types"
import { parseProductSpecs, getProductStockInfo } from "./specs"

export interface ParsedFilters {
  brands: string[]
  processors: string[]
  minPrice?: number
  maxPrice?: number
  inStockOnly: boolean
  sortBy?: string
  page: number
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface FilterFacets {
  brands: FacetOption[]
  processors: FacetOption[]
  priceRange: {
    min: number
    max: number
  }
  inStockCount: number
  totalCount: number
}

/**
 * Safely parses and sanitizes raw query parameters into typed filter state.
 * Never throws on malformed query strings (e.g. ?minPrice=abc&maxPrice=-50).
 */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams
): ParsedFilters {
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined
    }
    const val = searchParams[key]
    if (Array.isArray(val)) return val[0]
    return val
  }

  // Parse comma-separated or multi-value arrays
  const parseList = (key: string): string[] => {
    let raw: string[] = []
    if (searchParams instanceof URLSearchParams) {
      const vals = searchParams.getAll(key)
      raw = vals.flatMap((v) => v.split(","))
    } else {
      const val = searchParams[key]
      if (Array.isArray(val)) {
        raw = val.flatMap((v) => v.split(","))
      } else if (typeof val === "string") {
        raw = val.split(",")
      }
    }
    return Array.from(
      new Set(
        raw
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length <= 50)
      )
    )
  }

  const rawMinPrice = getParam("minPrice")
  const rawMaxPrice = getParam("maxPrice")
  let minPrice: number | undefined = undefined
  let maxPrice: number | undefined = undefined

  if (rawMinPrice && !isNaN(Number(rawMinPrice))) {
    const parsed = Math.max(0, Math.floor(Number(rawMinPrice)))
    minPrice = parsed
  }

  if (rawMaxPrice && !isNaN(Number(rawMaxPrice))) {
    const parsed = Math.max(0, Math.floor(Number(rawMaxPrice)))
    maxPrice = parsed
  }

  // If minPrice > maxPrice, swap or normalize safely
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    const temp = minPrice
    minPrice = maxPrice
    maxPrice = temp
  }

  const inStockRaw = getParam("inStock")
  const inStockOnly = inStockRaw === "true" || inStockRaw === "1"

  const rawPage = getParam("page")
  const page = rawPage && !isNaN(Number(rawPage)) ? Math.max(1, parseInt(rawPage, 10)) : 1

  const sortBy = getParam("sortBy")

  return {
    brands: parseList("brand"),
    processors: parseList("processor"),
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy: sortBy?.trim(),
    page,
  }
}

/**
 * Extracts lowest numerical price of a product across its variants.
 */
export function getProductLowestAmount(product: HttpTypes.StoreProduct): number {
  if (!product.variants || product.variants.length === 0) {
    return 0
  }

  let lowest = Infinity
  for (const variant of product.variants as any[]) {
    if (typeof variant.calculated_price?.calculated_amount === "number") {
      if (variant.calculated_price.calculated_amount < lowest) {
        lowest = variant.calculated_price.calculated_amount
      }
    } else if (Array.isArray(variant.prices) && variant.prices.length > 0) {
      for (const price of variant.prices) {
        if (typeof price.amount === "number" && price.amount < lowest) {
          lowest = price.amount
        }
      }
    }
  }

  return lowest === Infinity ? 0 : lowest
}

/**
 * Dynamically derives available filter options, counts, and price boundaries from real product data.
 */
export function deriveFilterFacets(products: HttpTypes.StoreProduct[]): FilterFacets {
  const brandCountMap = new Map<string, number>()
  const processorCountMap = new Map<string, number>()
  let minPrice = Infinity
  let maxPrice = 0
  let inStockCount = 0

  for (const product of products) {
    const specs = parseProductSpecs(product.metadata)
    const stock = getProductStockInfo(product)

    if (stock.isPurchaseable && stock.status !== "out_of_stock") {
      inStockCount++
    }

    // Dynamic brand detection
    const brand = specs?.brand || (product.title?.split(" ")[0] ?? "")
    if (brand && brand.trim().length > 0) {
      const b = brand.trim()
      brandCountMap.set(b, (brandCountMap.get(b) || 0) + 1)
    }

    // Dynamic processor detection
    const procFamily =
      specs?.processorFamily ||
      (specs?.processor?.includes("Core i7")
        ? "Core i7"
        : specs?.processor?.includes("Core i5")
        ? "Core i5"
        : specs?.processor?.includes("Core i9")
        ? "Core i9"
        : specs?.processor?.includes("Ryzen 7")
        ? "Ryzen 7"
        : specs?.processor?.includes("Ryzen 9")
        ? "Ryzen 9"
        : specs?.processor?.includes("M3")
        ? "Apple M-Series"
        : null)

    if (procFamily) {
      processorCountMap.set(
        procFamily,
        (processorCountMap.get(procFamily) || 0) + 1
      )
    }

    // Price boundaries
    const price = getProductLowestAmount(product)
    if (price > 0) {
      if (price < minPrice) minPrice = price
      if (price > maxPrice) maxPrice = price
    }
  }

  const brands: FacetOption[] = Array.from(brandCountMap.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  const processors: FacetOption[] = Array.from(processorCountMap.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  return {
    brands,
    processors,
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === 0 ? 500000 : maxPrice,
    },
    inStockCount,
    totalCount: products.length,
  }
}

/**
 * Filter an array of products based on the parsed filters.
 * Implements AND between groups and OR within groups.
 */
export function filterProducts(
  products: HttpTypes.StoreProduct[],
  filters: ParsedFilters
): HttpTypes.StoreProduct[] {
  return products.filter((product) => {
    const specs = parseProductSpecs(product.metadata)
    const stock = getProductStockInfo(product)
    const price = getProductLowestAmount(product)

    // 1. In Stock Only
    if (filters.inStockOnly) {
      if (!stock.isPurchaseable || stock.status === "out_of_stock") {
        return false
      }
    }

    // 2. Brand Filter (OR within brand list)
    if (filters.brands.length > 0) {
      const productBrand = (
        specs?.brand ||
        product.title?.split(" ")[0] ||
        ""
      ).toLowerCase()
      const matchBrand = filters.brands.some((b) =>
        productBrand.includes(b.toLowerCase())
      )
      if (!matchBrand) return false
    }

    // 3. Processor Filter (OR within processor list)
    if (filters.processors.length > 0) {
      const procFamily = (specs?.processorFamily || "").toLowerCase()
      const fullProc = (specs?.processor || "").toLowerCase()
      const title = (product.title || "").toLowerCase()

      const matchProcessor = filters.processors.some((p) => {
        const target = p.toLowerCase()
        return (
          procFamily.includes(target) ||
          fullProc.includes(target) ||
          title.includes(target)
        )
      })

      if (!matchProcessor) return false
    }

    // 4. Min Price
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      if (price > 0 && price < filters.minPrice) {
        return false
      }
    }

    // 5. Max Price
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      if (price > 0 && price > filters.maxPrice) {
        return false
      }
    }

    return true
  })
}

/**
 * Builds updated query string, always resetting page to 1 when filters change.
 */
export function buildFilterQuery(
  currentParams: URLSearchParams,
  updates: Record<string, string | string[] | number | boolean | null | undefined>
): string {
  const next = new URLSearchParams(currentParams.toString())

  // Always reset page to 1 on any filter modification
  next.delete("page")

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      next.delete(key)
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        next.delete(key)
      } else {
        next.set(key, value.join(","))
      }
    } else if (typeof value === "boolean") {
      if (value) {
        next.set(key, "true")
      } else {
        next.delete(key)
      }
    } else {
      next.set(key, String(value))
    }
  }

  return next.toString()
}
