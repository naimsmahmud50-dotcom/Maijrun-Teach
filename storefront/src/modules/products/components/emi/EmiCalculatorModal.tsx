"use client"

import React, { useState } from "react"
import { Calculator, X, CreditCard, CheckCircle2 } from "lucide-react"

const EMI_TENURES = [
  { months: 3, interest: 0, label: "3 Months (0% Interest)" },
  { months: 6, interest: 0, label: "6 Months (0% Interest)" },
  { months: 9, interest: 4.5, label: "9 Months" },
  { months: 12, interest: 6.0, label: "12 Months" },
  { months: 18, interest: 8.5, label: "18 Months" },
  { months: 24, interest: 10.5, label: "24 Months" },
  { months: 36, interest: 14.0, label: "36 Months" },
]

const PARTNER_BANKS = [
  "City Bank (American Express)",
  "BRAC Bank",
  "Eastern Bank (EBL)",
  "Standard Chartered",
  "Dutch-Bangla Bank (DBBL)",
  "Mutual Trust Bank (MTB)",
  "Prime Bank",
  "United Commercial Bank (UCB)",
]

export default function EmiCalculatorModal({ price = 0 }: { price: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState(6)

  if (!price || price < 10000) return null

  // Calculate lowest EMI for 36 months as teaser
  const minMonthly = Math.round(price / 36)

  const activeTenure =
    EMI_TENURES.find((t) => t.months === selectedMonths) || EMI_TENURES[1]
  const totalAmount = Math.round(price * (1 + activeTenure.interest / 100))
  const monthlyPayment = Math.round(totalAmount / activeTenure.months)

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 hover:border-cyan-500/40 text-left transition-all my-2 group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Bank EMI Available from ৳{minMonthly.toLocaleString("en-BD")}/mo
            </div>
            <div className="text-[11px] text-cyan-400 font-medium">
              Up to 36 months • 0% EMI available on select cards
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 group-hover:text-cyan-300 font-medium underline underline-offset-2">
          Plans
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Bank EMI Installment Calculator
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Product Price Banner */}
            <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Hardware Price:</span>
                <div className="text-lg font-bold text-cyan-400">
                  ৳{price.toLocaleString("en-BD")}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Monthly Installment:</span>
                <div className="text-lg font-bold text-emerald-400">
                  ৳{monthlyPayment.toLocaleString("en-BD")}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>
            </div>

            {/* Tenure Selector Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Select Installment Duration:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {EMI_TENURES.map((t) => (
                  <button
                    key={t.months}
                    type="button"
                    onClick={() => setSelectedMonths(t.months)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all ${
                      selectedMonths === t.months
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "bg-slate-800/60 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div>{t.months} Months</div>
                    <div className="text-[10px] mt-0.5 text-slate-400">
                      {t.interest === 0 ? "0% Fee" : `+${t.interest}%`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Banks Grid */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 mb-2 block">
                Supported Credit Cards in Bangladesh:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400 max-h-32 overflow-y-auto">
                {PARTNER_BANKS.map((bank) => (
                  <div key={bank} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{bank}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
