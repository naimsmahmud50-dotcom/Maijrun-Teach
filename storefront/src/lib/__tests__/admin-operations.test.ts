import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"
import {
  getAdminProducts,
  upsertAdminProduct,
  adjustInventory,
  getInventoryLogs,
  getAdminOrders,
  fulfillOrder,
  cancelOrRefundOrder,
  exportProductsCsv,
  importProductsCsv,
  getSalesAnalytics,
  resetAdminStoreForTests,
} from "../admin/store"
import { clearAdminAuditLogsForTests } from "../admin/audit"

describe("Phase 10: Admin Operations, Inventory & Fulfillment Tests", () => {
  beforeEach(() => {
    resetAdminStoreForTests()
    clearAdminAuditLogsForTests()
  })

  describe("1. Catalog Management & PC Builder Compatibility Attributes", () => {
    it("should create and update products with full compatibility metadata", async () => {
      const product = await upsertAdminProduct(
        {
          id: "prod_test_cpu_9800x3d",
          title: "AMD Ryzen 7 9800X3D Processor",
          category: "Processors",
          brand: "AMD",
          priceBdt: 62000,
          inventoryQuantity: 8,
          specs: {
            socket: "AM5",
            tdp: 120,
            cores: 8,
            threads: 16,
            warrantyYears: 3,
          },
        },
        "admin@maijrun.com"
      )

      assert.strictEqual(product.id, "prod_test_cpu_9800x3d")
      assert.strictEqual(product.priceBdt, 62000)
      assert.strictEqual(product.specs.socket, "AM5")
      assert.strictEqual(product.specs.tdp, 120)

      const all = await getAdminProducts()
      const found = all.find((p) => p.id === "prod_test_cpu_9800x3d")
      assert.ok(found)
      assert.strictEqual(found?.inventoryQuantity, 8)
    })
  })

  describe("2. Bulk CSV Export & Import", () => {
    it("should export products to CSV format with headers", () => {
      const csv = exportProductsCsv()
      assert.ok(csv.startsWith("ID,Title,Brand,Category,Price BDT,Stock"))
      assert.ok(csv.includes("Zephyrus"))
    })

    it("should import products from CSV into catalog", async () => {
      const csvData = [
        "ID,Title,Brand,Category,Price BDT,Stock,Processor,RAM,Storage",
        '"prod_csv_1","Intel Core i7-14700K","Intel","Processors",48000,10,"14700K","",""',
        '"prod_csv_2","MSI MAG Z790 Tomahawk","MSI","Motherboards",34000,5,"","DDR5",""',
      ].join("\n")

      const result = importProductsCsv(csvData)
      assert.strictEqual(result.importedCount, 2)
      assert.strictEqual(result.errors.length, 0)

      const products = await getAdminProducts()
      const p1 = products.find((p) => p.id === "prod_csv_1")
      const p2 = products.find((p) => p.id === "prod_csv_2")

      assert.ok(p1)
      assert.strictEqual(p1?.priceBdt, 48000)
      assert.strictEqual(p1?.brand, "Intel")

      assert.ok(p2)
      assert.strictEqual(p2?.priceBdt, 34000)
      assert.strictEqual(p2?.brand, "MSI")
    })
  })

  describe("3. Inventory Management & Low Stock Tracking", () => {
    it("should adjust inventory and create an immutable audit log", async () => {
      const initialLogsCount = getInventoryLogs().length
      const products = await getAdminProducts()
      const targetProduct = products[0]
      const initialStock = targetProduct.inventoryQuantity

      const res = await adjustInventory(
        targetProduct.id,
        -2,
        "Counter sale at IDB branch",
        "manager@maijrun.com"
      )

      assert.strictEqual(res.success, true)
      assert.strictEqual(res.newQuantity, initialStock - 2)

      const logs = getInventoryLogs()
      assert.strictEqual(logs.length, initialLogsCount + 1)

      const latestLog = logs[0] // getInventoryLogs returns reversed list
      assert.strictEqual(latestLog.productId, targetProduct.id)
      assert.strictEqual(latestLog.delta, -2)
      assert.strictEqual(latestLog.newQuantity, initialStock - 2)
      assert.strictEqual(latestLog.adjustedBy, "manager@maijrun.com")
    })

    it("should correctly identify low stock products (< 3 units)", async () => {
      const products = await getAdminProducts()
      const target = products[0]

      // Reduce to 1 unit
      const res = await adjustInventory(target.id, -(target.inventoryQuantity - 1), "Stock adjustment", "staff@maijrun.com")
      assert.strictEqual(res.isLowStock, true)

      const updatedProducts = await getAdminProducts()
      const lowStockList = updatedProducts.filter((p) => p.inventoryQuantity < 3)
      assert.ok(lowStockList.some((p) => p.id === target.id))
    })
  })

  describe("4. Order Fulfillment & Courier Dispatch", () => {
    it("should fulfill order with Steadfast courier and assign consignment ID", async () => {
      const orders = await getAdminOrders()
      const order = orders.find((o) => o.status === "PROCESSING")
      assert.ok(order)

      const fulfilled = await fulfillOrder(order!.orderNumber, "steadfast", "staff@maijrun.com")
      assert.strictEqual(fulfilled.success, true)
      assert.strictEqual(fulfilled.order?.status, "SHIPPED")
      assert.strictEqual(fulfilled.order?.courier, "steadfast")
      assert.ok(fulfilled.order?.consignmentId)
    })

    it("should fulfill order with Pathao courier and assign consignment ID", async () => {
      const orders = await getAdminOrders()
      const order = orders.find((o) => o.status === "PROCESSING")
      assert.ok(order)

      const fulfilled = await fulfillOrder(order!.orderNumber, "pathao", "staff@maijrun.com")
      assert.strictEqual(fulfilled.success, true)
      assert.strictEqual(fulfilled.order?.status, "SHIPPED")
      assert.strictEqual(fulfilled.order?.courier, "pathao")
      assert.ok(fulfilled.order?.consignmentId)
    })
  })

  describe("5. Order Cancellation, Refund & Inventory Restock", () => {
    it("should cancel order and automatically restock items when restock=true", async () => {
      const productsBefore = await getAdminProducts()
      const zephyrus = productsBefore.find((p) => p.title.includes("Zephyrus"))!
      const initialStock = zephyrus.inventoryQuantity

      // Cancel order MJR-2026-X8K9P2 which has 1 unit of Zephyrus
      const cancelRes = await cancelOrRefundOrder(
        "MJR-2026-X8K9P2",
        true,
        "owner@maijrun.com"
      )

      assert.strictEqual(cancelRes.success, true)

      const ordersAfter = await getAdminOrders()
      const order = ordersAfter.find((o) => o.orderNumber === "MJR-2026-X8K9P2")
      assert.strictEqual(order?.status, "CANCELLED")

      const productsAfter = await getAdminProducts()
      const zephyrusAfter = productsAfter.find((p) => p.title.includes("Zephyrus"))!
      assert.strictEqual(zephyrusAfter.inventoryQuantity, initialStock + 1)
    })
  })

  describe("6. Sales Analytics Aggregation", () => {
    it("should calculate accurate revenue and status statistics", async () => {
      const stats = await getSalesAnalytics()
      assert.ok(stats.todayRevenueBdt >= 0)
      assert.ok(stats.weekRevenueBdt >= 0)
      assert.ok(stats.monthRevenueBdt >= 0)
      assert.ok(stats.totalOrdersCount >= 2)
      assert.ok(stats.statusBreakdown.SHIPPED >= 1)
      assert.ok(stats.statusBreakdown.PROCESSING >= 1)
    })
  })
})
