import { NextResponse } from "next/server"
import { DEMO_PRODUCTS } from "@lib/demo-products"

export async function GET() {
  const products = DEMO_PRODUCTS.map((p) => {
    const variant = p.variants?.[0]
    const price = variant?.calculated_price?.calculated_amount || 0
    const specs = (p.metadata as any)?.specs || {}
    const brand = specs.brand || "MAIJRUN"
    const category = p.categories?.[0]?.name || "Hardware"

    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail || p.images?.[0]?.url || "",
      price,
      brand,
      category,
      inStock: (variant?.inventory_quantity || 1) > 0,
    }
  })

  return NextResponse.json({ products })
}
