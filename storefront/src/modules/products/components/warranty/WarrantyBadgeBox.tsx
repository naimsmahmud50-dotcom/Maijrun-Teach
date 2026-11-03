"use client"

import React from "react"
import { ShieldCheck, PackageCheck, Truck, RefreshCw } from "lucide-react"

export default function WarrantyBadgeBox({
  warrantyText = "2 Years Official Brand Warranty",
}: {
  warrantyText?: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3.5 my-4">
      {/* Official Warranty Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <span>{warrantyText}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Full official warranty honored directly via authorized service points across Bangladesh.
          </p>
        </div>
      </div>

      {/* Box Retention Notice */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300 text-xs">
        <PackageCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
        <span>
          <strong>Important:</strong> Please preserve the original box & serial tag to claim official warranty.
        </span>
      </div>

      {/* Guarantee & Delivery Badges */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>7-Day Replacement</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-cyan-400" />
          <span>64 Districts Fast Courier</span>
        </div>
      </div>
    </div>
  )
}
