export interface NormalizedSpecs {
  brand: string
  model?: string
  category: string

  // Numerical metrics for objective comparison
  priceBdt: number
  ramGb: number
  ramType: string
  storageGb: number
  storageType: string
  displaySizeInches: number
  refreshRateHz: number
  displayResolution: string
  displayPanel: string
  batteryWh: number
  weightKg: number
  warrantyYears: number

  // Textual descriptors
  processor: string
  processorFamily: string
  gpu: string
  ports: string
  os: string

  // Raw metadata copy
  raw: Record<string, any>
}

export interface ComparableProduct {
  id: string
  title: string
  handle: string
  thumbnail: string
  priceBdt: number
  category: string
  inStock: boolean
  inventoryQuantity: number
  normalizedSpecs: NormalizedSpecs
}

export type BestValueCriteria = "highest" | "lowest"

export interface ComparisonRow {
  key: string
  label: string
  labelBn: string
  category: "overview" | "performance" | "display" | "battery" | "physical" | "features"
  values: (string | number)[]
  isIdentical: boolean
  bestIndex?: number // Index of the product having the best value (e.g. highest RAM or lowest price)
  unit?: string
}

export interface ComparisonMatrix {
  products: ComparableProduct[]
  rows: ComparisonRow[]
  differingCount: number
  identicalCount: number
}
