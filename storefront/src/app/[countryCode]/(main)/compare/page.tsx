import { Metadata } from "next"
import CompareTemplate from "@/modules/compare/templates"
import { sanitizeCompareIds, normalizeProductSpecs, buildComparisonMatrix } from "@/lib/compare/normalizer"
import { ComparableProduct } from "@/lib/compare/types"
import { listProducts } from "@/lib/data/products"
import { DEMO_PRODUCTS } from "@/lib/demo-products"

export const metadata: Metadata = {
  title: "Compare Laptops & Desktops | MAIJRUN Tech",
  description:
    "Compare technical hardware specifications, benchmark specs, and BDT prices side-by-side. Choose the best laptop or desktop for your workload with MAIJRUN Tech.",
  openGraph: {
    title: "Compare Laptops & Desktops | MAIJRUN Tech",
    description:
      "Side-by-side technical comparison matrix with difference highlighting and best value markers.",
  },
}

type Params = {
  searchParams: Promise<{ ids?: string }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function ComparePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const ids = sanitizeCompareIds(searchParams.ids)

  let comparableProducts: ComparableProduct[] = []

  if (ids.length > 0) {
    // 1. Fetch available products with fallback to DEMO_PRODUCTS
    let allProducts: any[] = []
    try {
      const res = await listProducts({
        countryCode: params.countryCode,
        queryParams: { limit: 100 },
      })
      allProducts = res.response.products
    } catch {
      allProducts = DEMO_PRODUCTS
    }

    if (!allProducts || allProducts.length === 0) {
      allProducts = DEMO_PRODUCTS
    }

    // Match products by id or handle according to sanitized ids order
    for (const id of ids) {
      const found =
        allProducts.find((p) => p.id === id || p.handle === id) ||
        DEMO_PRODUCTS.find((p) => p.id === id || p.handle === id)

      if (found) {
        const normalized = normalizeProductSpecs(found)
        comparableProducts.push({
          id: found.id,
          title: found.title,
          handle: found.handle,
          thumbnail: found.thumbnail || found.images?.[0]?.url || "",
          priceBdt: normalized.priceBdt,
          category: normalized.category,
          inStock: Boolean(
            found.variants?.[0]?.inventory_quantity &&
              found.variants[0].inventory_quantity > 0
          ),
          inventoryQuantity: found.variants?.[0]?.inventory_quantity ?? 0,
          normalizedSpecs: normalized,
        })
      }
    }
  }

  const matrix = buildComparisonMatrix(comparableProducts)

  return (
    <CompareTemplate
      matrix={matrix}
      countryCode={params.countryCode}
    />
  )
}
