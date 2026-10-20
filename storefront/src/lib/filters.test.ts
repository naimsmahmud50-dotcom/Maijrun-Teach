import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { HttpTypes } from "@medusajs/types"
import {
  parseFilterParams,
  getProductLowestAmount,
  deriveFilterFacets,
  filterProducts,
  buildFilterQuery,
} from "./filters"

describe("Filter Parameters Parser", () => {
  test("parses standard URLSearchParams accurately", () => {
    const params = new URLSearchParams(
      "brand=Asus,Lenovo&processor=Core+i7&minPrice=50000&maxPrice=150000&inStock=true&page=2&sortBy=price_asc"
    )

    const parsed = parseFilterParams(params)
    assert.deepEqual(parsed.brands, ["Asus", "Lenovo"])
    assert.deepEqual(parsed.processors, ["Core i7"])
    assert.equal(parsed.minPrice, 50000)
    assert.equal(parsed.maxPrice, 150000)
    assert.equal(parsed.inStockOnly, true)
    assert.equal(parsed.page, 2)
    assert.equal(parsed.sortBy, "price_asc")
  })

  test("sanitizes malformed numbers and negative values", () => {
    const params = {
      minPrice: "invalid_num",
      maxPrice: "-100",
      page: "xyz",
      inStock: "not_a_bool",
    }

    const parsed = parseFilterParams(params)
    assert.equal(parsed.minPrice, undefined)
    assert.equal(parsed.maxPrice, 0)
    assert.equal(parsed.page, 1)
    assert.equal(parsed.inStockOnly, false)
  })

  test("auto-swaps minPrice and maxPrice when min > max", () => {
    const params = {
      minPrice: "200000",
      maxPrice: "80000",
    }

    const parsed = parseFilterParams(params)
    assert.equal(parsed.minPrice, 80000)
    assert.equal(parsed.maxPrice, 200000)
  })

  test("deduplicates array items and trims whitespace", () => {
    const params = {
      brand: [" Asus ", "Dell", "Asus", " "],
    }

    const parsed = parseFilterParams(params)
    assert.deepEqual(parsed.brands, ["Asus", "Dell"])
  })
})

describe("Lowest Amount Extractor", () => {
  test("returns lowest variant price", () => {
    const product = {
      id: "prod_1",
      variants: [
        { prices: [{ amount: 120000 }] },
        { prices: [{ amount: 95000 }, { amount: 130000 }] },
      ],
    } as unknown as HttpTypes.StoreProduct

    assert.equal(getProductLowestAmount(product), 95000)
  })

  test("returns 0 if product has no variants or prices", () => {
    const productEmpty = {
      id: "prod_2",
      variants: [],
    } as unknown as HttpTypes.StoreProduct

    assert.equal(getProductLowestAmount(productEmpty), 0)
  })
})

describe("Facet Derivation and Filtering", () => {
  const mockProducts: HttpTypes.StoreProduct[] = [
    {
      id: "p1",
      title: "Asus ROG Zephyrus G16",
      variants: [
        {
          prices: [{ amount: 245000 }],
          inventory_quantity: 8,
          manage_inventory: true,
          allow_backorder: false,
        },
      ],
      metadata: {
        specs: {
          brand: "Asus",
          processor: "Intel Core i9-14900HX",
          processorFamily: "Core i9",
        },
      },
    } as unknown as HttpTypes.StoreProduct,
    {
      id: "p2",
      title: "Lenovo Legion Pro 5",
      variants: [
        {
          prices: [{ amount: 175000 }],
          inventory_quantity: 3,
          manage_inventory: true,
          allow_backorder: false,
        },
      ],
      metadata: {
        specs: {
          brand: "Lenovo",
          processor: "AMD Ryzen 7 7745HX",
          processorFamily: "Ryzen 7",
        },
      },
    } as unknown as HttpTypes.StoreProduct,
    {
      id: "p3",
      title: "Apple MacBook Pro 14",
      variants: [
        {
          prices: [{ amount: 220000 }],
          inventory_quantity: 12,
          manage_inventory: true,
          allow_backorder: false,
        },
      ],
      metadata: {
        specs: {
          brand: "Apple",
          processor: "Apple M3 Pro",
          processorFamily: "Apple M-Series",
        },
      },
    } as unknown as HttpTypes.StoreProduct,
    {
      id: "p4",
      title: "Dell XPS 15",
      variants: [
        {
          prices: [{ amount: 215000 }],
          inventory_quantity: 0,
          manage_inventory: true,
          allow_backorder: false,
        },
      ],
      metadata: {
        specs: {
          brand: "Dell",
          processor: "Intel Core i7-13700H",
          processorFamily: "Core i7",
        },
      },
    } as unknown as HttpTypes.StoreProduct,
  ]

  test("derives correct facets and bounds from mock catalog", () => {
    const facets = deriveFilterFacets(mockProducts)
    assert.equal(facets.totalCount, 4)
    assert.equal(facets.inStockCount, 3) // Dell is 0 stock
    assert.equal(facets.priceRange.min, 175000)
    assert.equal(facets.priceRange.max, 245000)

    const brandNames = facets.brands.map((b) => b.value)
    assert.ok(brandNames.includes("Asus"))
    assert.ok(brandNames.includes("Lenovo"))
    assert.ok(brandNames.includes("Apple"))
    assert.ok(brandNames.includes("Dell"))
  })

  test("filters products with inStockOnly condition", () => {
    const filtered = filterProducts(mockProducts, {
      brands: [],
      processors: [],
      inStockOnly: true,
      page: 1,
    })

    assert.equal(filtered.length, 3)
    assert.ok(!filtered.some((p) => p.id === "p4")) // Dell XPS 15 (0 stock) must be excluded
  })

  test("filters products with brand selection (OR logic)", () => {
    const filtered = filterProducts(mockProducts, {
      brands: ["Asus", "Apple"],
      processors: [],
      inStockOnly: false,
      page: 1,
    })

    assert.equal(filtered.length, 2)
    assert.deepEqual(
      filtered.map((p) => p.id).sort(),
      ["p1", "p3"]
    )
  })

  test("filters products with price range", () => {
    const filtered = filterProducts(mockProducts, {
      brands: [],
      processors: [],
      minPrice: 200000,
      maxPrice: 230000,
      inStockOnly: false,
      page: 1,
    })

    assert.equal(filtered.length, 2) // Dell (215000) and Apple (220000)
    assert.deepEqual(
      filtered.map((p) => p.id).sort(),
      ["p3", "p4"]
    )
  })

  test("combines multiple filter dimensions with AND logic", () => {
    const filtered = filterProducts(mockProducts, {
      brands: ["Apple", "Dell"],
      processors: ["Apple M-Series"],
      minPrice: 100000,
      maxPrice: 300000,
      inStockOnly: true,
      page: 1,
    })

    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].id, "p3")
  })
})

describe("Filter Query Builder", () => {
  test("generates updated query string and resets page to 1", () => {
    const current = new URLSearchParams("page=3&sortBy=price_desc&brand=Dell")
    const updated = buildFilterQuery(current, {
      brand: ["Asus", "Lenovo"],
      inStock: true,
    })

    const resultParams = new URLSearchParams(updated)
    assert.equal(resultParams.get("page"), null) // Page was removed/reset
    assert.equal(resultParams.get("sortBy"), "price_desc")
    assert.equal(resultParams.get("brand"), "Asus,Lenovo")
    assert.equal(resultParams.get("inStock"), "true")
  })

  test("clears keys when value is null, undefined or empty array", () => {
    const current = new URLSearchParams("brand=Dell&inStock=true&minPrice=50000")
    const updated = buildFilterQuery(current, {
      brand: [],
      inStock: false,
      minPrice: null,
    })

    const resultParams = new URLSearchParams(updated)
    assert.equal(resultParams.get("brand"), null)
    assert.equal(resultParams.get("inStock"), null)
    assert.equal(resultParams.get("minPrice"), null)
  })
})
