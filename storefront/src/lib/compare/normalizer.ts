import {
  NormalizedSpecs,
  ComparableProduct,
  ComparisonRow,
  ComparisonMatrix,
} from "./types"
import { formatBDT } from "../bangladesh"

/**
 * Extracts integer or float from a string with specific unit matching
 */
function extractNumber(val?: any, regex?: RegExp): number {
  if (typeof val === "number") return val
  if (!val || typeof val !== "string") return 0

  if (regex) {
    const match = val.match(regex)
    if (match && match[1]) {
      return parseFloat(match[1])
    }
  }

  const genericMatch = val.match(/(\d+(\.\d+)?)/)
  return genericMatch ? parseFloat(genericMatch[1]) : 0
}

/**
 * Sanitizes text to prevent XSS from admin-entered data
 */
function sanitizeText(val?: any): string {
  if (!val) return "N/A"
  return String(val)
    .replace(/[<>"'&]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;"
        case ">":
          return "&gt;"
        case '"':
          return "&quot;"
        case "'":
          return "&#39;"
        case "&":
          return "&amp;"
        default:
          return char
      }
    })
    .trim()
}

/**
 * Normalizes product metadata and variants into standardized numbers and units
 */
export function normalizeProductSpecs(product: any): NormalizedSpecs {
  const meta = product.metadata || {}
  const rawSpecs = meta.specs || meta || {}

  // 1. RAM in GB
  let ramGb = 0
  const ramStr = String(rawSpecs.ram || "")
  const ramMatch = ramStr.match(/(\d+)\s*(?:GB|gb)/)
  if (ramMatch) {
    ramGb = parseInt(ramMatch[1], 10)
  }

  // 2. Storage in GB (1TB = 1000GB, 2TB = 2000GB)
  let storageGb = 0
  const storageStr = String(rawSpecs.storage || "")
  const tbMatch = storageStr.match(/(\d+)\s*(?:TB|tb)/)
  const gbMatch = storageStr.match(/(\d+)\s*(?:GB|gb)/)
  if (tbMatch) {
    storageGb = parseInt(tbMatch[1], 10) * 1000
  } else if (gbMatch) {
    storageGb = parseInt(gbMatch[1], 10)
  }

  // 3. Weight in kg
  let weightKg = 0
  const weightStr = String(rawSpecs.weight || product.weight || "")
  if (weightStr.toLowerCase().includes("kg")) {
    weightKg = extractNumber(weightStr)
  } else if (weightStr.toLowerCase().includes("g") || (typeof product.weight === "number" && product.weight > 50)) {
    // If grams, convert to kg
    weightKg = extractNumber(weightStr) / 1000
  } else {
    weightKg = extractNumber(weightStr)
  }

  // 4. Display Size in inches & Refresh Rate in Hz
  const displayStr = String(rawSpecs.display || "")
  let displaySizeInches = 0
  const sizeMatch = displayStr.match(/(\d+(\.\d+)?)\s*(?:inch|"|'')/i)
  if (sizeMatch) {
    displaySizeInches = parseFloat(sizeMatch[1])
  }

  let refreshRateHz = 60
  const hzMatch = displayStr.match(/(\d+)\s*Hz/i)
  if (hzMatch) {
    refreshRateHz = parseInt(hzMatch[1], 10)
  }

  // 5. Battery in Wh
  let batteryWh = 0
  const batteryStr = String(rawSpecs.battery || "")
  const whMatch = batteryStr.match(/(\d+)\s*(?:Wh|wh)/i)
  if (whMatch) {
    batteryWh = parseInt(whMatch[1], 10)
  }

  // 6. Warranty in Years
  let warrantyYears = 1
  const warrantyStr = String(rawSpecs.warranty || "")
  const yrMatch = warrantyStr.match(/(\d+)\s*(?:Year|year|yr)/i)
  if (yrMatch) {
    warrantyYears = parseInt(yrMatch[1], 10)
  }

  // 7. Price in BDT
  let priceBdt = 0
  if (product.variants && product.variants.length > 0) {
    const v = product.variants[0]
    if (v.calculated_price?.calculated_amount) {
      priceBdt = v.calculated_price.calculated_amount
    } else if (v.prices && v.prices.length > 0) {
      const bdtPrice = v.prices.find((p: any) => p.currency_code?.toLowerCase() === "bdt")
      priceBdt = bdtPrice ? bdtPrice.amount : v.prices[0].amount
    }
  }

  return {
    brand: sanitizeText(rawSpecs.brand || "MAIJRUN"),
    model: sanitizeText(rawSpecs.model || product.title),
    category: sanitizeText(rawSpecs.category || (product.categories?.[0]?.name ?? "Laptops")),
    priceBdt,
    ramGb,
    ramType: sanitizeText(rawSpecs.ramType || (ramStr.includes("DDR5") ? "DDR5" : "DDR4")),
    storageGb,
    storageType: sanitizeText(rawSpecs.storageType || "PCIe NVMe SSD"),
    displaySizeInches,
    refreshRateHz,
    displayResolution: sanitizeText(displayStr.split(",")[0] || "Full HD"),
    displayPanel: sanitizeText(displayStr.includes("OLED") ? "OLED" : "IPS"),
    batteryWh,
    weightKg,
    warrantyYears,
    processor: sanitizeText(rawSpecs.processor || "Standard Processor"),
    processorFamily: sanitizeText(rawSpecs.processorFamily || "Core i7"),
    gpu: sanitizeText(rawSpecs.gpu || "Integrated Graphics"),
    ports: sanitizeText(rawSpecs.ports || "Standard USB & HDMI"),
    os: sanitizeText(rawSpecs.os || "Windows 11 Home"),
    raw: rawSpecs,
  }
}

/**
 * Builds side-by-side comparison matrix with difference detection and best-value markers
 */
export function buildComparisonMatrix(products: ComparableProduct[]): ComparisonMatrix {
  if (products.length === 0) {
    return { products: [], rows: [], differingCount: 0, identicalCount: 0 }
  }

  function findBestIndex(
    numbers: number[],
    criterion: "highest" | "lowest"
  ): number | undefined {
    const valid = numbers.filter((n) => n > 0)
    if (valid.length === 0) return undefined

    const allIdentical = numbers.every((n) => n === numbers[0])
    if (allIdentical) return undefined

    const targetVal =
      criterion === "highest" ? Math.max(...numbers) : Math.min(...numbers.filter((n) => n > 0))

    return numbers.indexOf(targetVal)
  }

  function checkIdentical(vals: any[]): boolean {
    return vals.every((v) => String(v).trim().toLowerCase() === String(vals[0]).trim().toLowerCase())
  }

  // Row Definitions
  const rows: ComparisonRow[] = [
    // 1. Price
    {
      key: "price",
      label: "Price (BDT)",
      labelBn: "মূল্য (টাকা)",
      category: "overview",
      values: products.map((p) => formatBDT(p.normalizedSpecs.priceBdt)),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.priceBdt)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.priceBdt),
        "lowest"
      ),
    },
    // 2. Processor
    {
      key: "processor",
      label: "Processor",
      labelBn: "প্রসেসর",
      category: "performance",
      values: products.map((p) => p.normalizedSpecs.processor),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.processor)),
    },
    // 3. RAM
    {
      key: "ram",
      label: "RAM Capacity",
      labelBn: "র‍্যামের পরিমাণ",
      category: "performance",
      values: products.map((p) => `${p.normalizedSpecs.ramGb} GB (${p.normalizedSpecs.ramType})`),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.ramGb)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.ramGb),
        "highest"
      ),
    },
    // 4. Storage
    {
      key: "storage",
      label: "Internal Storage",
      labelBn: "স্টোরেজ / এসএসডি",
      category: "performance",
      values: products.map((p) =>
        p.normalizedSpecs.storageGb >= 1000
          ? `${p.normalizedSpecs.storageGb / 1000} TB SSD`
          : `${p.normalizedSpecs.storageGb} GB SSD`
      ),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.storageGb)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.storageGb),
        "highest"
      ),
    },
    // 5. GPU
    {
      key: "gpu",
      label: "Graphics (GPU)",
      labelBn: "গ্রাফিক্স কার্ড",
      category: "performance",
      values: products.map((p) => p.normalizedSpecs.gpu),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.gpu)),
    },
    // 6. Display Size & Resolution
    {
      key: "display",
      label: "Display & Screen",
      labelBn: "ডিসপ্লে ও রেজ্যুলেশন",
      category: "display",
      values: products.map((p) => p.normalizedSpecs.displayResolution),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.displayResolution)),
    },
    // 7. Refresh Rate
    {
      key: "refreshRate",
      label: "Refresh Rate",
      labelBn: "রিফ্রেশ রেট",
      category: "display",
      values: products.map((p) => `${p.normalizedSpecs.refreshRateHz} Hz`),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.refreshRateHz)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.refreshRateHz),
        "highest"
      ),
    },
    // 8. Battery
    {
      key: "battery",
      label: "Battery Capacity",
      labelBn: "ব্যাটারি ক্যাপাসিটি",
      category: "battery",
      values: products.map((p) => `${p.normalizedSpecs.batteryWh} Wh`),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.batteryWh)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.batteryWh),
        "highest"
      ),
    },
    // 9. Weight
    {
      key: "weight",
      label: "Weight",
      labelBn: "ওজন",
      category: "physical",
      values: products.map((p) => `${p.normalizedSpecs.weightKg} kg`),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.weightKg)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.weightKg),
        "lowest"
      ),
    },
    // 10. Operating System
    {
      key: "os",
      label: "Operating System",
      labelBn: "অপারেটিং সিস্টেম",
      category: "features",
      values: products.map((p) => p.normalizedSpecs.os),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.os)),
    },
    // 11. Warranty
    {
      key: "warranty",
      label: "Official Warranty",
      labelBn: "অফিসিয়াল ওয়ারেন্টি",
      category: "features",
      values: products.map((p) => `${p.normalizedSpecs.warrantyYears} Years Official`),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.warrantyYears)),
      bestIndex: findBestIndex(
        products.map((p) => p.normalizedSpecs.warrantyYears),
        "highest"
      ),
    },
    // 12. Connectivity & Ports
    {
      key: "ports",
      label: "I/O Ports",
      labelBn: "পোর্টসমূহ",
      category: "features",
      values: products.map((p) => p.normalizedSpecs.ports),
      isIdentical: checkIdentical(products.map((p) => p.normalizedSpecs.ports)),
    },
  ]

  const differingCount = rows.filter((r) => !r.isIdentical).length
  const identicalCount = rows.filter((r) => r.isIdentical).length

  return {
    products,
    rows,
    differingCount,
    identicalCount,
  }
}

/**
 * Validates and sanitizes comparison query parameter `ids`
 * Enforces maximum of 3 valid IDs, alphanumeric characters only.
 */
export function sanitizeCompareIds(idsParam?: string | null): string[] {
  if (!idsParam || typeof idsParam !== "string") return []

  return Array.from(
    new Set(
      idsParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[a-zA-Z0-9_\-\.]+$/.test(s)) // Strict allow-list
    )
  ).slice(0, 3) // Strict max 3 products limit
}
