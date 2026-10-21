import { describe, it } from "node:test"
import assert from "node:assert"
import {
  normalizeProductSpecs,
  buildComparisonMatrix,
  sanitizeCompareIds,
} from "../compare/normalizer"
import { ComparableProduct } from "../compare/types"

describe("Phase 8: Laptop & Desktop Comparison Tool Unit Tests", () => {
  const sampleProductA = {
    id: "prod_laptop_a",
    title: "Asus ROG Zephyrus G16",
    handle: "asus-rog-zephyrus-g16",
    metadata: {
      specs: {
        brand: "Asus",
        processor: "Intel Core Ultra 9 185H",
        processorFamily: "Core i9",
        ram: "32GB LPDDR5X",
        storage: "1TB PCIe Gen4 SSD",
        gpu: "NVIDIA GeForce RTX 4080 12GB",
        display: '16.0" 2.5K 240Hz OLED Display',
        battery: "90Wh 4-cell Li-ion",
        os: "Windows 11 Home",
        ports: "1x TB4, 2x USB-A, HDMI 2.1",
        weight: "1.85 kg",
        warranty: "2 Years Official Warranty",
      },
    },
    variants: [
      {
        id: "var_a",
        inventory_quantity: 5,
        calculated_price: {
          calculated_amount: 245000,
          currency_code: "bdt",
        },
      },
    ],
  }

  const sampleProductB = {
    id: "prod_laptop_b",
    title: "Lenovo Legion Pro 5",
    handle: "lenovo-legion-pro-5",
    metadata: {
      specs: {
        brand: "Lenovo",
        processor: "AMD Ryzen 7 7745HX",
        processorFamily: "Ryzen 7",
        ram: "16GB DDR5 5200MHz",
        storage: "512GB M.2 NVMe SSD",
        gpu: "NVIDIA GeForce RTX 4070 8GB",
        display: '16.0" WQXGA 240Hz IPS Display',
        battery: "80Wh Li-ion",
        os: "Windows 11 Home",
        ports: "4x USB-A, 2x USB-C, HDMI 2.1",
        weight: "2.50 kg",
        warranty: "2 Years Official Warranty",
      },
    },
    variants: [
      {
        id: "var_b",
        inventory_quantity: 2,
        calculated_price: {
          calculated_amount: 175000,
          currency_code: "bdt",
        },
      },
    ],
  }

  describe("1. Technical Specs Normalization", () => {
    it("should correctly normalize RAM, Storage, and Units", () => {
      const normA = normalizeProductSpecs(sampleProductA)
      assert.strictEqual(normA.ramGb, 32)
      assert.strictEqual(normA.ramType, "DDR5")
      assert.strictEqual(normA.storageGb, 1000) // 1TB = 1000GB
      assert.strictEqual(normA.displaySizeInches, 16)
      assert.strictEqual(normA.refreshRateHz, 240)
      assert.strictEqual(normA.batteryWh, 90)
      assert.strictEqual(normA.weightKg, 1.85)
      assert.strictEqual(normA.warrantyYears, 2)
      assert.strictEqual(normA.priceBdt, 245000)

      const normB = normalizeProductSpecs(sampleProductB)
      assert.strictEqual(normB.ramGb, 16)
      assert.strictEqual(normB.storageGb, 512)
      assert.strictEqual(normB.refreshRateHz, 240)
      assert.strictEqual(normB.batteryWh, 80)
      assert.strictEqual(normB.weightKg, 2.5)
      assert.strictEqual(normB.priceBdt, 175000)
    })

    it("should handle multi-terabyte storage (e.g. 2TB -> 2000GB)", () => {
      const product2TB = {
        title: "Workstation Desktop",
        metadata: { specs: { storage: "2TB NVMe PCIe 4.0 SSD" } },
        variants: [{ calculated_price: { calculated_amount: 320000 } }],
      }
      const norm = normalizeProductSpecs(product2TB)
      assert.strictEqual(norm.storageGb, 2000)
    })

    it("should sanitize malicious admin-entered XSS payload in specs", () => {
      const xssProduct = {
        title: "Dangerous Product",
        metadata: {
          specs: {
            brand: "<script>alert('XSS')</script>Lenovo",
            processor: 'Core i7" onmouseover="alert(1)',
            os: "Windows 11 <img src=x onerror=alert(2)>",
          },
        },
      }
      const norm = normalizeProductSpecs(xssProduct)
      assert.ok(!norm.brand.includes("<script>"))
      assert.ok(norm.brand.includes("&lt;script&gt;"))
      assert.ok(!norm.processor.includes('"'))
      assert.ok(norm.processor.includes("&quot;"))
      assert.ok(!norm.os.includes("<img"))
    })
  })

  describe("2. Comparison Matrix & Best-Value Highlighting", () => {
    it("should accurately resolve best-value indices and identical rows", () => {
      const normA = normalizeProductSpecs(sampleProductA)
      const normB = normalizeProductSpecs(sampleProductB)

      const prodA: ComparableProduct = {
        id: sampleProductA.id,
        title: sampleProductA.title,
        handle: sampleProductA.handle,
        thumbnail: "",
        priceBdt: normA.priceBdt,
        category: "Laptops",
        inStock: true,
        inventoryQuantity: 5,
        normalizedSpecs: normA,
      }

      const prodB: ComparableProduct = {
        id: sampleProductB.id,
        title: sampleProductB.title,
        handle: sampleProductB.handle,
        thumbnail: "",
        priceBdt: normB.priceBdt,
        category: "Laptops",
        inStock: true,
        inventoryQuantity: 2,
        normalizedSpecs: normB,
      }

      const matrix = buildComparisonMatrix([prodA, prodB])

      assert.strictEqual(matrix.products.length, 2)
      assert.ok(matrix.rows.length >= 10)

      // Price: product B (175000 BDT) is cheaper than A (245000 BDT), so bestIndex = 1
      const priceRow = matrix.rows.find((r) => r.key === "price")
      assert.ok(priceRow)
      assert.strictEqual(priceRow?.bestIndex, 1)
      assert.strictEqual(priceRow?.isIdentical, false)

      // RAM: product A (32 GB) is higher than B (16 GB), so bestIndex = 0
      const ramRow = matrix.rows.find((r) => r.key === "ram")
      assert.ok(ramRow)
      assert.strictEqual(ramRow?.bestIndex, 0)
      assert.strictEqual(ramRow?.isIdentical, false)

      // Storage: product A (1000 GB) is higher than B (512 GB), so bestIndex = 0
      const storageRow = matrix.rows.find((r) => r.key === "storage")
      assert.ok(storageRow)
      assert.strictEqual(storageRow?.bestIndex, 0)

      // Weight: product A (1.85 kg) is lighter than B (2.5 kg), so bestIndex = 0
      const weightRow = matrix.rows.find((r) => r.key === "weight")
      assert.ok(weightRow)
      assert.strictEqual(weightRow?.bestIndex, 0)

      // Refresh Rate: both are 240Hz, so isIdentical should be true and bestIndex should be undefined
      const hzRow = matrix.rows.find((r) => r.key === "refreshRate")
      assert.ok(hzRow)
      assert.strictEqual(hzRow?.isIdentical, true)
      assert.strictEqual(hzRow?.bestIndex, undefined)

      // OS: both are Windows 11 Home, so isIdentical = true
      const osRow = matrix.rows.find((r) => r.key === "os")
      assert.ok(osRow)
      assert.strictEqual(osRow?.isIdentical, true)

      assert.ok(matrix.differingCount > 0)
      assert.ok(matrix.identicalCount > 0)
    })
  })

  describe("3. Security & Query Sanitization (OWASP ASVS L2)", () => {
    it("should enforce maximum of 3 products", () => {
      const ids = sanitizeCompareIds("id1,id2,id3,id4,id5")
      assert.strictEqual(ids.length, 3)
      assert.deepStrictEqual(ids, ["id1", "id2", "id3"])
    })

    it("should filter out duplicate IDs", () => {
      const ids = sanitizeCompareIds("prod_1,prod_2,prod_1,prod_2")
      assert.deepStrictEqual(ids, ["prod_1", "prod_2"])
    })

    it("should strip malicious SQLi and XSS characters from ids query parameter", () => {
      const malicious = "valid-id1,SELECT * FROM users,<script>alert(1)</script>,prod_2"
      const ids = sanitizeCompareIds(malicious)
      // Only "valid-id1" and "prod_2" conform to /^[a-zA-Z0-9_\-\.]+$/
      assert.deepStrictEqual(ids, ["valid-id1", "prod_2"])
    })

    it("should safely handle null, undefined, empty, and invalid types", () => {
      assert.deepStrictEqual(sanitizeCompareIds(null), [])
      assert.deepStrictEqual(sanitizeCompareIds(undefined), [])
      assert.deepStrictEqual(sanitizeCompareIds(""), [])
      assert.deepStrictEqual(sanitizeCompareIds("   "), [])
    })
  })
})
