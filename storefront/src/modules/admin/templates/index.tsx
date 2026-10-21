"use client"

import React, { useState, useEffect } from "react"
import {
  AdminProductItem,
  AdminOrderRecord,
  InventoryAdjustmentLog,
  getAdminProducts,
  getAdminOrders,
  getSalesAnalytics,
  getCoupons,
  getInventoryLogs,
  fulfillOrder,
  cancelOrRefundOrder,
  adjustInventory,
  exportProductsCsv,
  importProductsCsv,
  upsertAdminProduct,
} from "@/lib/admin/store"
import { getAdminAuditLogs } from "@/lib/admin/audit"
import { AdminAuditLog, SalesAnalytics, Coupon } from "@/lib/admin/types"
import { formatBDT } from "@/lib/bangladesh"
import PrintableInvoice from "../components/printable-invoice"

export default function AdminDashboardTemplate() {
  const [activeTab, setActiveTab] = useState<
    "analytics" | "products" | "inventory" | "orders" | "coupons" | "audit"
  >("analytics")

  // State
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null)
  const [products, setProducts] = useState<AdminProductItem[]>([])
  const [orders, setOrders] = useState<AdminOrderRecord[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [inventoryLogs, setInventoryLogs] = useState<InventoryAdjustmentLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<AdminOrderRecord | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Load data
  const loadDashboardData = async () => {
    try {
      const [an, prods, ords] = await Promise.all([
        getSalesAnalytics(),
        getAdminProducts(),
        getAdminOrders(),
      ])
      setAnalytics(an)
      setProducts(prods)
      setOrders(ords)
      setCoupons(getCoupons())
      setInventoryLogs(getInventoryLogs())
      setAuditLogs(getAdminAuditLogs(50))
    } catch {}
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Fulfill handler
  const handleFulfill = async (orderNumber: string, courier: "steadfast" | "pathao") => {
    const res = await fulfillOrder(orderNumber, courier)
    if (res.success) {
      setActionMessage(`Order ${orderNumber} dispatched via ${courier.toUpperCase()}! Consignment created.`)
      setTimeout(() => setActionMessage(null), 4000)
      loadDashboardData()
    }
  }

  // Cancel/Refund handler
  const handleCancel = async (orderNumber: string) => {
    if (confirm(`Are you sure you want to cancel and refund order ${orderNumber}? Stock will be replenished.`)) {
      const res = await cancelOrRefundOrder(orderNumber, true)
      setActionMessage(res.message)
      setTimeout(() => setActionMessage(null), 4000)
      loadDashboardData()
    }
  }

  // CSV Export handler
  const handleExportCsv = () => {
    const csv = exportProductsCsv()
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `maijrun_products_catalog_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              MAIJRUN Tech Admin Control Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              v2.18
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production Management Hub • Laptops, Components & PC Builder Compatibility
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2FA Active (TOTP)</span>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
            OWNER
          </span>
        </div>
      </header>

      {actionMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto">
        {[
          { key: "analytics", label: "📊 Sales & Analytics" },
          { key: "products", label: "💻 Catalog & Compatibility" },
          { key: "inventory", label: "📦 Inventory & Alerts" },
          { key: "orders", label: "🚚 Orders & Fulfillment" },
          { key: "coupons", label: "🏷️ Coupons & Discounts" },
          { key: "audit", label: "🔒 Immutable Audit Logs" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto">
        {/* Tab 1: Analytics */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Today's Revenue
                </div>
                <div className="text-2xl font-extrabold text-white mt-2">
                  {formatBDT(analytics.todayRevenueBdt)}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">✓ Live settled transactions</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  This Week
                </div>
                <div className="text-2xl font-extrabold text-sky-400 mt-2">
                  {formatBDT(analytics.weekRevenueBdt)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Last 7 calendar days</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pending Fulfillment
                </div>
                <div className="text-2xl font-extrabold text-amber-400 mt-2">
                  {analytics.pendingOrdersCount} Orders
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">Ready for packing & courier</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Low-Stock Alerts
                </div>
                <div className="text-2xl font-extrabold text-rose-400 mt-2">
                  {analytics.lowStockCount} Items
                </div>
                <div className="text-[11px] text-rose-400/80 mt-1">Stock below 3 units</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-sm font-bold text-white mb-4">Live Order Status Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-white">{String(count)}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products & Compatibility */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="text-sm font-bold text-slate-300">
                Total Products: {products.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5"
                >
                  <span>📥</span> Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Brand / Category</th>
                    <th className="p-4">Compatibility Specs</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-white max-w-xs">{p.title}</td>
                      <td className="p-4 text-slate-400">
                        <span className="font-semibold text-slate-200">{p.brand}</span>
                        <div className="text-[10px] text-slate-500">{p.category}</div>
                      </td>
                      <td className="p-4 text-slate-300 text-[11px] space-y-0.5">
                        {p.specs.socket && <div>Socket: {p.specs.socket}</div>}
                        {p.specs.ram && <div>RAM: {p.specs.ram}</div>}
                        {p.specs.storage && <div>SSD: {p.specs.storage}</div>}
                        {p.specs.gpu && <div>GPU: {p.specs.gpu}</div>}
                      </td>
                      <td className="p-4 text-right font-bold text-sky-400 font-mono">
                        {formatBDT(p.priceBdt)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            p.inventoryQuantity < 3
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {p.inventoryQuantity} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Inventory */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Low-Stock Threshold: Products with fewer than 3 available units are flagged automatically to alert the operations team.
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">Product Title</th>
                    <th className="p-4 text-center">Current Stock</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-white">{p.title}</td>
                      <td className="p-4 text-center font-bold text-base font-mono">{p.inventoryQuantity}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.inventoryQuantity === 0
                              ? "bg-rose-900 text-white"
                              : p.inventoryQuantity < 3
                              ? "bg-amber-900 text-amber-200"
                              : "bg-emerald-900 text-emerald-200"
                          }`}
                        >
                          {p.inventoryQuantity === 0 ? "OUT OF STOCK" : p.inventoryQuantity < 3 ? "LOW STOCK" : "OPTIMAL"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            const res = await adjustInventory(p.id, 5, "Manual Restock", "owner@maijrun.com")
                            if (res.success) {
                              setActionMessage(`Added +5 units to ${p.title}`)
                              loadDashboardData()
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition"
                        >
                          +5 Units
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Orders & Fulfillment */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-bold text-sky-400">{o.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{o.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.customerPhone}</div>
                        <div className="text-[10px] text-slate-500">{o.district}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {o.items.map((i, idx) => (
                          <div key={idx}>
                            {i.title} × {i.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-white">
                        {formatBDT(o.totalBdt)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "DELIVERED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : o.status === "SHIPPED"
                              ? "bg-sky-950 text-sky-300 border border-sky-800"
                              : o.status === "CANCELLED"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoiceOrder(o)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                          title="Print invoice"
                        >
                          🖨️ Invoice
                        </button>
                        {o.status !== "SHIPPED" && o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
                          <>
                            <button
                              onClick={() => handleFulfill(o.orderNumber, "steadfast")}
                              className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                            >
                              Dispatch Steadfast
                            </button>
                            <button
                              onClick={() => handleFulfill(o.orderNumber, "pathao")}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                            >
                              Dispatch Pathao
                            </button>
                          </>
                        )}
                        {o.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancel(o.orderNumber)}
                            className="px-2 py-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold rounded-lg transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Coupons */}
        {activeTab === "coupons" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-base font-extrabold text-cyan-400 font-mono tracking-wider">
                      {c.code}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Discount: {c.discountType === "percentage" ? `${c.discountValue}% Off` : `৳${c.discountValue} Flat Off`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Min Order: ৳{c.minOrderValueBdt.toLocaleString()} • Used: {c.usedCount}/{c.usageLimit}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Audit Logs */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              🔒 Immutable administrative audit trail recording every state-changing operational action.
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Admin</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-GB")}
                      </td>
                      <td className="p-3.5 text-slate-300">{log.adminEmail}</td>
                      <td className="p-3.5 text-sky-400 font-bold">{log.action}</td>
                      <td className="p-3.5 text-slate-400">{log.entityId || log.entityType}</td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <PrintableInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  )
}
