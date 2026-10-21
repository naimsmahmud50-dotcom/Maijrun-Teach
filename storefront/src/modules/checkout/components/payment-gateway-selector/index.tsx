"use client"

import React, { useState } from "react"
import { PaymentGatewayId } from "@/lib/payments/types"
import { getAllSupportedGateways } from "@/lib/payments/factory"
import { formatBDT } from "@/lib/bangladesh"

interface PaymentGatewaySelectorProps {
  selectedGateway: PaymentGatewayId
  onSelectGateway: (gateway: PaymentGatewayId) => void
  subtotalBdt: number
  shippingBdt: number
  totalBdt: number
  isProcessing?: boolean
  onProceedToPay: () => void
}

export default function PaymentGatewaySelector({
  selectedGateway,
  onSelectGateway,
  subtotalBdt,
  shippingBdt,
  totalBdt,
  isProcessing = false,
  onProceedToPay,
}: PaymentGatewaySelectorProps) {
  const gateways = getAllSupportedGateways()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>💳</span> Select Payment Method (পেমেন্ট পদ্ধতি)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose between instant digital wallet, cards, or pay on delivery. All transactions are 100% secure.
        </p>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {gateways.map((gw) => {
          const isSelected = selectedGateway === gw.id
          return (
            <div
              key={gw.id}
              onClick={() => onSelectGateway(gw.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? "border-sky-500 bg-sky-50/30 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm flex-shrink-0"
                    style={{ backgroundColor: gw.color }}
                  >
                    {gw.id === "bkash" && "bK"}
                    {gw.id === "nagad" && "NG"}
                    {gw.id === "sslcommerz" && "💳"}
                    {gw.id === "cod" && "COD"}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{gw.name}</span>
                      <span className="text-xs font-normal text-gray-500">({gw.nameBn})</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {gw.tagline}
                    </div>
                  </div>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white text-xs"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && "✓"}
                </div>
              </div>

              {/* Gateway Surcharge Tag */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  0% Surcharge (ফ্রি)
                </span>
                <span className="text-gray-400 text-[10px]">Instant confirmation</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Amount Recap */}
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Subtotal (সাবটোটাল):</span>
          <span>{formatBDT(subtotalBdt)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>Delivery Charge (ডেলিভারি চার্জ):</span>
          <span>{formatBDT(shippingBdt)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-baseline font-bold text-sm sm:text-base text-gray-900 dark:text-white">
          <span>Total Payable (সর্বমোট পরিশোধযোগ্য):</span>
          <span className="text-xl text-sky-600 dark:text-sky-400">
            {formatBDT(totalBdt)}
          </span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-1">
        <span className="flex items-center gap-1">🔒 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span className="flex items-center gap-1">🛡️ PCI DSS Certified</span>
        <span>•</span>
        <span className="flex items-center gap-1">🇧🇩 Bangladesh Bank Compliant</span>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onProceedToPay}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-md ${
          selectedGateway === "cod"
            ? "bg-emerald-600 hover:bg-emerald-500"
            : selectedGateway === "bkash"
            ? "bg-[#E2136E] hover:bg-[#c90f61]"
            : selectedGateway === "nagad"
            ? "bg-[#F7941D] hover:bg-[#de8115]"
            : "bg-[#0B63CE] hover:bg-[#0952aa]"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin text-base">⏳</span> Connecting to Secure Gateway...
          </span>
        ) : (
          <span>
            {selectedGateway === "cod"
              ? "Confirm Order with Cash on Delivery (অর্ডার কনফার্ম করুন)"
              : `Proceed to Pay with ${selectedGateway.toUpperCase()} (${formatBDT(totalBdt)})`}
          </span>
        )}
      </button>
    </div>
  )
}
