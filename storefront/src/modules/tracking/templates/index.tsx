"use client"

import React, { useState } from "react"
import { OrderTrackingRecord, OrderStatus } from "@/lib/tracking/types"
import { formatBDT } from "@/lib/bangladesh"

const TIMELINE_STEPS: Array<{ status: OrderStatus; label: string; icon: string }> = [
  { status: "ORDER_PLACED", label: "Order Placed", icon: "📝" },
  { status: "PROCESSING", label: "Processing & QA", icon: "⚙️" },
  { status: "SHIPPED", label: "Courier Dispatch", icon: "🚚" },
  { status: "DELIVERED", label: "Delivered", icon: "📦" },
]

export default function OrderTrackingTemplate() {
  const [orderId, setOrderId] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [trackingRecord, setTrackingRecord] = useState<OrderTrackingRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setTrackingRecord(null)

    if (!orderId.trim() || !phone.trim()) {
      setErrorMessage("Please enter both your Order ID and contact phone number.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Order not found. Please double-check your Order ID and phone number.")
        return
      }

      setTrackingRecord(data.record)
    } catch {
      setErrorMessage("Could not connect to tracking service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Determine active step index
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "ORDER_PLACED":
        return 0
      case "PROCESSING":
        return 1
      case "SHIPPED":
        return 2
      case "DELIVERED":
        return 3
      default:
        return 1
    }
  }

  const currentStep = trackingRecord ? getStepIndex(trackingRecord.status) : 0
  const isTerminated = trackingRecord?.status === "CANCELLED" || trackingRecord?.status === "RETURNED"

  return (
    <div className="py-10 content-container max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 mb-2">
          <span>📦</span> Real-Time Logistics Tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Live Order Tracking
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your laptop, PC components, and courier delivery status across Bangladesh with Steadfast & Pathao.
        </p>
      </div>

      {/* Tracking Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm mb-8">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. MJR-2026-X8K9"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712345678"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50 h-[42px] flex items-center justify-center gap-1.5"
            >
              {loading ? "Searching..." : "Track Order →"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {trackingRecord && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order #{trackingRecord.orderId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    trackingRecord.status === "DELIVERED"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : trackingRecord.status === "SHIPPED"
                      ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                      : isTerminated
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {trackingRecord.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                Destination: {trackingRecord.district}, Bangladesh
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Recipient Contact: {trackingRecord.phone} (Protected)
              </p>
            </div>

            {/* Courier Consignment Info */}
            <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs space-y-1">
              <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <span>🚚</span>
                <span>Courier: {trackingRecord.courier.toUpperCase()}</span>
              </div>
              {trackingRecord.consignmentId && (
                <div className="text-gray-500 font-mono">
                  Consignment: {trackingRecord.consignmentId}
                </div>
              )}
              {trackingRecord.trackingCode && (
                <div className="text-sky-600 dark:text-sky-400 font-mono font-bold">
                  Code: {trackingRecord.trackingCode}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {!isTerminated && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
              <div className="grid grid-cols-4 gap-2 relative">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep
                  const isCurrent = idx === currentStep
                  return (
                    <div key={step.status} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition shadow-sm mb-2 ${
                          isDone
                            ? "bg-emerald-600 text-white shadow-emerald-600/20"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                        } ${isCurrent ? "ring-4 ring-emerald-500/20" : ""}`}
                      >
                        {isDone ? "✓" : step.icon}
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white">
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Event History Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Detailed Delivery Events
            </h3>
            <div className="space-y-4 border-l-2 border-sky-500/30 ml-3 pl-4">
              {trackingRecord.events
                .slice()
                .reverse()
                .map((ev, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white dark:ring-gray-900" />
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(ev.timestamp).toLocaleString("en-GB")} {ev.location ? `• ${ev.location}` : ""}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
