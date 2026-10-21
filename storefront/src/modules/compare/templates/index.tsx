"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ComparisonMatrix, ComparableProduct } from "@/lib/compare/types"
import { formatBDT } from "@/lib/bangladesh"
import { useCompare } from "@/lib/compare/context"

interface CompareTemplateProps {
  matrix: ComparisonMatrix
  countryCode: string
}

export default function CompareTemplate({ matrix, countryCode }: CompareTemplateProps) {
  const [hideIdentical, setHideIdentical] = useState(false)
  const [copied, setCopied] = useState(false)
  const { removeFromCompare } = useCompare()

  const { products, rows, differingCount, identicalCount } = matrix

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {}
  }

  const displayedRows = hideIdentical ? rows.filter((r) => !r.isIdentical) : rows

  if (products.length < 2) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center text-3xl mx-auto mb-4">
          ⇄
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Compare Laptops & Desktops
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Select at least 2 products to compare their technical specifications, benchmark specs, and BDT pricing side-by-side.
        </p>

        <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl text-left space-y-3">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Quick Comparison Presets:
          </div>
          <div className="space-y-2">
            <Link
              href={`/${countryCode}/compare?ids=asus-rog-zephyrus-g16,lenovo-legion-pro-5,apple-macbook-pro-14-m3`}
              className="block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-sky-500 text-xs font-semibold text-gray-900 dark:text-white transition flex items-center justify-between"
            >
              <span>🔥 Asus Zephyrus G16 vs Lenovo Legion Pro 5 vs MacBook Pro 14</span>
              <span className="text-sky-600">Compare →</span>
            </Link>
            <Link
              href={`/${countryCode}/compare?ids=hp-pavilion-15,dell-xps-15`}
              className="block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-sky-500 text-xs font-semibold text-gray-900 dark:text-white transition flex items-center justify-between"
            >
              <span>💻 HP Pavilion 15 vs Dell XPS 15</span>
              <span className="text-sky-600">Compare →</span>
            </Link>
          </div>
        </div>

        <Link
          href={`/${countryCode}/store`}
          className="inline-block mt-6 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition shadow-sm"
        >
          Browse Store Products
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 content-container max-w-7xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 mb-2">
            <span>⇄</span> Side-by-Side Product Comparison Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Comparing {products.length} Products
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyzing hardware specifications with automatic difference highlighting and best value indicators.
          </p>
        </div>

        {/* Controls: Hide Identical & Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl select-none">
            <input
              type="checkbox"
              checked={hideIdentical}
              onChange={(e) => setHideIdentical(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded"
            />
            <span>Hide Identical Specs ({identicalCount})</span>
          </label>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <span>🔗</span> {copied ? "Copied Link!" : "Share Comparison"}
          </button>
        </div>
      </div>

      {/* Comparison Table with Sticky First Column */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <table className="w-full text-left border-collapse">
          {/* Header Row: Products Overview */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30">
              <th className="sticky left-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur z-20 p-4 sm:p-5 w-44 sm:w-60 min-w-[176px] font-bold text-xs uppercase text-gray-400 tracking-wider">
                Products
              </th>
              {products.map((product) => (
                <th
                  key={product.id}
                  className="p-4 sm:p-5 min-w-[240px] sm:min-w-[280px] align-top border-l border-gray-100 dark:border-gray-800"
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          💻
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-black/60 hover:bg-red-500 hover:text-white backdrop-blur flex items-center justify-center text-xs font-bold text-gray-500 transition"
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {product.normalizedSpecs.brand}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="text-base sm:text-lg font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                        {formatBDT(product.priceBdt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/${countryCode}/products/${product.handle}`}
                        className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition shadow-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body: Spec Rows */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayedRows.map((row) => (
              <tr
                key={row.key}
                className={`transition ${
                  !row.isIdentical
                    ? "bg-sky-50/20 dark:bg-sky-950/10 hover:bg-sky-50/40"
                    : "hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                }`}
              >
                {/* Sticky Left Column: Spec Label */}
                <td className="sticky left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10 p-3.5 sm:p-4 text-xs font-bold text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div>{row.label}</div>
                  <div className="text-[10px] text-gray-400 font-normal mt-0.5">{row.labelBn}</div>
                  {!row.isIdentical && (
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Different
                    </span>
                  )}
                </td>

                {/* Values for each product */}
                {row.values.map((val, idx) => {
                  const isBest = row.bestIndex === idx
                  return (
                    <td
                      key={idx}
                      className={`p-3.5 sm:p-4 text-xs sm:text-sm border-l border-gray-100 dark:border-gray-800 align-middle ${
                        isBest
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold text-emerald-900 dark:text-emerald-200"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="break-words">{val}</span>
                        {isBest && (
                          <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                            <span>🏆</span> Best
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
