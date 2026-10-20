import { test, describe } from "node:test"
import assert from "node:assert/strict"
import {
  parseProductSpecs,
  getVisibleSpecRows,
  getStockStatus,
  ProductSpecsSchema,
} from "./specs"

describe("Product Specs Parser & Schema", () => {
  test("parses valid nested specs object", () => {
    const metadata = {
      specs: {
        brand: "Asus",
        processor: "AMD Ryzen 7 7840HS",
        processorFamily: "Ryzen 7",
        ram: "16GB DDR5",
        storage: "1TB NVMe Gen4",
        warranty: "2 Years Official Warranty",
      },
    }

    const result = parseProductSpecs(metadata)
    assert.ok(result)
    assert.equal(result.brand, "Asus")
    assert.equal(result.processor, "AMD Ryzen 7 7840HS")
    assert.equal(result.warranty, "2 Years Official Warranty")
  })

  test("parses valid flat metadata object", () => {
    const metadata = {
      brand: "Apple",
      processor: "Apple M3 Pro",
      ram: "18GB Unified",
      storage: "512GB SSD",
      warranty: "1 Year Official Apple Warranty",
    }

    const result = parseProductSpecs(metadata)
    assert.ok(result)
    assert.equal(result.brand, "Apple")
    assert.equal(result.processor, "Apple M3 Pro")
  })

  test("returns null for empty, null, or undefined metadata", () => {
    assert.equal(parseProductSpecs(null), null)
    assert.equal(parseProductSpecs(undefined), null)
    assert.equal(parseProductSpecs({}), null)
    assert.equal(parseProductSpecs({ specs: {} }), null)
  })

  test("returns null when all fields are empty whitespace", () => {
    const metadata = {
      brand: "   ",
      processor: "",
    }
    assert.equal(parseProductSpecs(metadata), null)
  })

  test("getVisibleSpecRows hides missing rows and formats rows", () => {
    const specs = {
      brand: "Lenovo",
      processor: "Intel Core i7-13700H",
      ram: "32GB DDR5",
      storage: "", // Empty string should be excluded
      warranty: "3 Years Official Onsite Warranty",
    }

    const rows = getVisibleSpecRows(specs)
    assert.equal(rows.length, 4)
    assert.deepEqual(
      rows.map((r) => r.key),
      ["brand", "processor", "ram", "warranty"]
    )
    assert.equal(rows[0].label, "Brand")
    assert.equal(rows[0].value, "Lenovo")
  })
})

describe("Stock Status & Inventory Evaluation", () => {
  test("identifies out_of_stock when quantity is 0 or negative", () => {
    const zeroStock = getStockStatus(0)
    assert.equal(zeroStock.status, "out_of_stock")
    assert.equal(zeroStock.isPurchaseable, false)

    const negativeStock = getStockStatus(-3)
    assert.equal(negativeStock.status, "out_of_stock")
    assert.equal(negativeStock.isPurchaseable, false)
  })

  test("identifies low_stock when quantity is <= threshold", () => {
    const lowStock = getStockStatus(3, true, false, 5)
    assert.equal(lowStock.status, "low_stock")
    assert.equal(lowStock.isPurchaseable, true)
    assert.match(lowStock.label, /Low Stock \(3 remaining\)/)
  })

  test("identifies in_stock when quantity is above threshold", () => {
    const inStock = getStockStatus(25, true, false, 5)
    assert.equal(inStock.status, "in_stock")
    assert.equal(inStock.isPurchaseable, true)
    assert.equal(inStock.label, "In Stock")
  })

  test("considers item in stock if manageInventory is false", () => {
    const unmanaged = getStockStatus(0, false)
    assert.equal(unmanaged.status, "in_stock")
    assert.equal(unmanaged.isPurchaseable, true)
  })

  test("handles undefined quantity safely", () => {
    const undef = getStockStatus(undefined, true, false)
    assert.equal(undef.status, "out_of_stock")
    assert.equal(undef.isPurchaseable, false)
  })
})
