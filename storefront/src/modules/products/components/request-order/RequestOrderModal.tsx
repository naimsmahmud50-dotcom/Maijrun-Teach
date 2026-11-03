"use client"

import React, { useState } from "react"
import { Send, X, CheckCircle, Clock } from "lucide-react"

export default function RequestOrderModal({
  productTitle,
  thumbnail,
}: {
  productTitle: string
  thumbnail?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setName("")
      setPhone("")
      setNote("")
    }, 200)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-10 px-4 rounded-xl border border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-semibold text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2"
      >
        <Clock className="w-4 h-4 text-cyan-400" />
        <span>Request Order / Pre-Order</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Pre-Order & Custom Request</span>
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-100">
                  Request Logged Successfully!
                </h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Our priority hardware desk will review current shipment allocations and call your phone (<span className="text-cyan-400 font-medium">{phone}</span>) within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
                {/* Product Preview Card */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={productTitle}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                    />
                  )}
                  <div className="text-xs font-medium text-slate-200 line-clamp-2">
                    {productTitle}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Number (Required)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    pattern="^(\+?880|0)1[3-9]\d{8}$"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    We will call you on this number to confirm stock & delivery.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Specific Variant / Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Space Black color with 32GB RAM preferred..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? "Submitting..." : "Submit Pre-Order Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
