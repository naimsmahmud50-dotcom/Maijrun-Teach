"use client"

import React from "react"
import { AdminOrderRecord } from "@/lib/admin/store"
import { formatBDT } from "@/lib/bangladesh"

interface PrintableInvoiceProps {
  order: AdminOrderRecord
  onClose?: () => void
}

export default function PrintableInvoice({ order, onClose }: PrintableInvoiceProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-gray-900 w-full max-w-3xl rounded-2xl p-8 shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0">
        {/* Action bar (hidden when printing) */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
          <div className="text-sm font-bold text-gray-600">
            Printable Invoice & Packing Slip
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              🖨️ Print Document
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-sky-600 tracking-tight">
              MAIJRUN Tech
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Next-Gen Tech Destination • Laptops & Workstations
            </p>
            <p className="text-xs text-gray-500">
              Dhaka, Bangladesh • Email: support@maijrun.com
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
              Official Tax Invoice
            </span>
            <div className="text-sm font-bold mt-2 font-mono">
              #{order.orderNumber}
            </div>
            <div className="text-xs text-gray-500">
              Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        {/* Bill To & Dispatch */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1">
              Bill & Ship To
            </div>
            <div className="font-bold text-sm text-gray-900">{order.customerName}</div>
            <div className="text-gray-600">{order.customerAddress}</div>
            <div className="text-gray-600 font-semibold">{order.district}, Bangladesh</div>
            <div className="text-gray-600 mt-1 font-mono">Phone: {order.customerPhone}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1">
              Logistics & Courier
            </div>
            <div>
              <span className="font-semibold">Courier Partner:</span>{" "}
              <span className="font-bold uppercase text-sky-700">
                {order.courier || "Steadfast Courier"}
              </span>
            </div>
            {order.consignmentId && (
              <div className="font-mono mt-0.5">
                Consignment: {order.consignmentId}
              </div>
            )}
            {order.trackingCode && (
              <div className="font-mono text-sky-600 font-bold">
                Tracking: {order.trackingCode}
              </div>
            )}
            <div className="mt-2 text-gray-500">
              Payment Method: <span className="font-bold text-gray-800">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left border-collapse text-xs my-6">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-600 font-bold">
              <th className="py-2.5 px-3">SL</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 px-3 font-mono text-gray-400">{idx + 1}</td>
                <td className="py-3 px-3 font-bold text-gray-900">{item.title}</td>
                <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatBDT(item.unitPriceBdt)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {formatBDT(item.unitPriceBdt * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Footer */}
        <div className="flex justify-between items-start border-t pt-4">
          <div className="text-[11px] text-gray-500 max-w-sm">
            <p className="font-bold text-gray-700 mb-0.5">Terms & Official Warranty:</p>
            <p>
              Hardware components and laptops include official brand warranty. For service or warranty claims, contact support@maijrun.com with this invoice.
            </p>
          </div>
          <div className="text-right text-xs space-y-1">
            <div className="text-gray-500">Subtotal: {formatBDT(order.totalBdt - 80)}</div>
            <div className="text-gray-500">Shipping Delivery: ৳80</div>
            <div className="text-base font-extrabold text-sky-600 pt-1 border-t">
              Total Amount: {formatBDT(order.totalBdt)}
            </div>
          </div>
        </div>

        {/* Barcode Mock */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400 font-mono">
          ||| | ||||| |||| || |||||| | |||| ||||| |||| |
          <div className="text-[10px] mt-1">{order.orderNumber} • AUTHENTIC MAIJRUN SHIPMENT</div>
        </div>
      </div>
    </div>
  )
}
