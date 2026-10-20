/**
 * Central Shipping Configuration for MAIJRUN Tech (Bangladesh)
 * Change delivery amounts here or via environment variables without touching code.
 */
export const shippingConfig = {
  currencyCode: "bdt",
  insideDhaka: {
    name: "Inside Dhaka Delivery",
    amount: Number(process.env.NEXT_PUBLIC_SHIPPING_INSIDE_DHAKA_BDT || 80),
    description: "Express delivery within Dhaka city (24-48 hours)",
    code: "inside-dhaka",
  },
  outsideDhaka: {
    name: "Outside Dhaka Courier",
    amount: Number(process.env.NEXT_PUBLIC_SHIPPING_OUTSIDE_DHAKA_BDT || 150),
    description: "Courier delivery across Bangladesh (2-4 days)",
    code: "outside-dhaka",
  },
}

export type ShippingOptionKey = "insideDhaka" | "outsideDhaka"

export function getShippingCharge(districtOrCity: string | null | undefined): number {
  if (!districtOrCity) return shippingConfig.outsideDhaka.amount
  const normalized = districtOrCity.trim().toLowerCase()
  if (normalized.includes("dhaka")) {
    return shippingConfig.insideDhaka.amount
  }
  return shippingConfig.outsideDhaka.amount
}
