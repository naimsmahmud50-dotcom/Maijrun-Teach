"use client"

import React, { useState } from "react"
import { PCBuildSelection, BuildValidationResult } from "@/lib/pc-builder/types"
import { formatBDT } from "@/lib/bangladesh"

interface BuildSummarySidebarProps {
  selection: PCBuildSelection
  validation: BuildValidationResult
  buildName: string
  onResetBuild: () => void
}

export default function BuildSummarySidebar({
  selection,
  validation,
  buildName,
  onResetBuild,
}: BuildSummarySidebarProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null)
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null)

  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const psuWattage = selection.psu?.specs.wattage || 0
  const powerPercentage = psuWattage
    ? Math.min(Math.round((validation.estimatedTdpWatts / psuWattage) * 100), 100)
    : 0

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      setCartErrorMessage(null)
      setCartSuccessMessage(null)

      const payload = {
        cpuId: selection.cpu?.id,
        motherboardId: selection.motherboard?.id,
        ramId: selection.ram?.id,
        gpuId: selection.gpu?.id,
        psuId: selection.psu?.id,
        caseId: selection.case?.id,
        storageId: selection.storage?.id,
        coolerId: selection.cooler?.id,
      }

      const res = await fetch("/api/pc-builder/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setCartErrorMessage(data.error || "Failed to add build to cart")
      } else {
        setCartSuccessMessage(data.message || "Build added to cart successfully!")
      }
    } catch {
      setCartErrorMessage("Network error adding build to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      const payload = {
        name: buildName,
        cpuId: selection.cpu?.id,
        motherboardId: selection.motherboard?.id,
        ramId: selection.ram?.id,
        gpuId: selection.gpu?.id,
        psuId: selection.psu?.id,
        caseId: selection.case?.id,
        storageId: selection.storage?.id,
        coolerId: selection.cooler?.id,
      }

      const res = await fetch("/api/pc-builder/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.data?.shareId) {
        const fullUrl = `${window.location.origin}/us/pc-builder?build=${data.data.shareId}`
        setShareUrl(fullUrl)
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownloadQuotation = () => {
    const params = new URLSearchParams()
    if (selection.cpu?.id) params.set("cpuId", selection.cpu.id)
    if (selection.motherboard?.id) params.set("motherboardId", selection.motherboard.id)
    if (selection.ram?.id) params.set("ramId", selection.ram.id)
    if (selection.gpu?.id) params.set("gpuId", selection.gpu.id)
    if (selection.psu?.id) params.set("psuId", selection.psu.id)
    if (selection.case?.id) params.set("caseId", selection.case.id)
    if (selection.storage?.id) params.set("storageId", selection.storage.id)
    if (selection.cooler?.id) params.set("coolerId", selection.cooler.id)
    params.set("name", buildName)

    window.open(`/api/pc-builder/quotation?${params.toString()}`, "_blank")
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-24 space-y-5">
      {/* Build Progress Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Build Progress
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            {validation.completedCoreSlotsCount} / {validation.totalCoreSlotsCount} Core Parts
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
          <div
            className="bg-sky-600 h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(validation.completedCoreSlotsCount / validation.totalCoreSlotsCount) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Estimated Wattage Gauge */}
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <span>⚡</span> Estimated Draw:
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            ~{validation.estimatedTdpWatts}W
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              powerPercentage > 90
                ? "bg-rose-500"
                : powerPercentage > 75
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${psuWattage ? powerPercentage : 50}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Min. PSU Recommended:</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {validation.recommendedMinPsuWatts}W (+20% Headroom)
          </span>
        </div>
      </div>

      {/* Compatibility Status Banner */}
      <div>
        {validation.isValid ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-emerald-600 text-sm mt-0.5">✓</span>
            <div>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                100% Compatible
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                All selected components match socket, form factor, and wattage specs.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl p-3 space-y-1.5">
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <span>⚠️</span> Compatibility Conflicts Found
            </div>
            <ul className="text-[11px] text-rose-700 dark:text-rose-400 space-y-1 list-disc pl-4">
              {validation.issues
                .filter((i) => i.severity === "error")
                .map((issue) => (
                  <li key={issue.id}>{issue.message}</li>
                ))}
            </ul>
          </div>
        )}

        {validation.hasWarnings && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 mt-2 space-y-1">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
              ⚡ Build Notices / Warnings
            </div>
            <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc pl-4">
              {validation.issues
                .filter((i) => i.severity === "warning")
                .map((w) => (
                  <li key={w.id}>{w.message}</li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Total Components:</span>
          <span>{validation.completedCoreSlotsCount} parts</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Grand Total (BDT):
          </span>
          <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
            {formatBDT(validation.totalPriceBdt)}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Includes all official brand warranties & free desktop assembly.
        </p>
      </div>

      {/* Feedback Messages */}
      {cartSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg border border-emerald-200">
          {cartSuccessMessage}
        </div>
      )}
      {cartErrorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-lg border border-rose-200">
          {cartErrorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          disabled={!validation.isValid || validation.completedCoreSlotsCount === 0 || isAddingToCart}
          onClick={handleAddToCart}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm ${
            validation.isValid && validation.completedCoreSlotsCount > 0
              ? "bg-sky-600 hover:bg-sky-500 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isAddingToCart ? "Adding to Cart..." : "🛒 Add Full Build to Cart"}
        </button>

        <button
          type="button"
          disabled={validation.completedCoreSlotsCount === 0}
          onClick={handleDownloadQuotation}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <span>📄</span> Download PDF Quotation
        </button>

        <button
          type="button"
          disabled={isSharing || validation.completedCoreSlotsCount === 0}
          onClick={handleShare}
          className="w-full py-2 px-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <span>🔗</span> {copied ? "Copied Link to Clipboard!" : "Share / Save Build"}
        </button>

        {shareUrl && (
          <div className="p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-[10px] text-gray-500 break-all select-all border border-gray-200 dark:border-gray-700">
            {shareUrl}
          </div>
        )}

        <button
          type="button"
          onClick={onResetBuild}
          className="w-full text-center text-xs text-gray-400 hover:text-red-500 pt-2 transition"
        >
          Reset All Selections
        </button>
      </div>
    </div>
  )
}
