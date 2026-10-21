"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { ComponentCategory, PCComponentItem, PCBuildSelection } from "@/lib/pc-builder/types"
import { getCatalogItemsByCategory } from "@/lib/pc-builder/catalog"
import { checkItemCompatibilityWithSelection } from "@/lib/pc-builder/compatibility"
import { formatBDT } from "@/lib/bangladesh"

interface PartSelectorModalProps {
  category: ComponentCategory
  categoryLabel: string
  isOpen: boolean
  currentSelection: PCBuildSelection
  onSelect: (item: PCComponentItem) => void
  onClose: () => void
}

export default function PartSelectorModal({
  category,
  categoryLabel,
  isOpen,
  currentSelection,
  onSelect,
  onClose,
}: PartSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">("price-asc")
  const [compatibleOnly, setCompatibleOnly] = useState<boolean>(true)

  const items = useMemo(() => {
    return getCatalogItemsByCategory(category)
  }, [category])

  // Extract unique brands for filter chips
  const brands = useMemo(() => {
    const set = new Set(items.map((i) => i.brand))
    return Array.from(set).sort()
  }, [items])

  // Process items with search, filter, sort and compatibility check
  const processedItems = useMemo(() => {
    return items
      .map((item) => {
        const compatibility = checkItemCompatibilityWithSelection(item, currentSelection)
        return { item, ...compatibility }
      })
      .filter(({ item, isCompatible }) => {
        if (compatibleOnly && !isCompatible) return false

        if (selectedBrand !== "all" && item.brand !== selectedBrand) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchTitle = item.title.toLowerCase().includes(q)
          const matchBrand = item.brand.toLowerCase().includes(q)
          const matchModel = item.specs.model?.toLowerCase().includes(q)
          if (!matchTitle && !matchBrand && !matchModel) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.item.price - b.item.price
        return b.item.price - a.item.price
      })
  }, [items, currentSelection, compatibleOnly, selectedBrand, searchQuery, sortBy])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Select {categoryLabel}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                {processedItems.length} Available
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Instant compatibility checks against your current build
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-gray-800 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-gray-900">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search ${categoryLabel.toLowerCase()} by name, brand, model...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Compatible Only Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg select-none">
              <input
                type="checkbox"
                checked={compatibleOnly}
                onChange={(e) => setCompatibleOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-sky-600 rounded"
              />
              <span>Compatible Only</span>
            </label>
          </div>
        </div>

        {/* Brand Filter Chips */}
        {brands.length > 1 && (
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto bg-gray-50/30 dark:bg-gray-900">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">
              Brand:
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrand("all")}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition ${
                selectedBrand === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition whitespace-nowrap ${
                  selectedBrand === brand
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Part List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800 space-y-3">
          {processedItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                No matching {categoryLabel.toLowerCase()} found
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Try clearing search terms or disable "Compatible Only" to see all items.
              </p>
            </div>
          ) : (
            processedItems.map(({ item, isCompatible, reason }) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
              >
                {/* Part Image & Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        {item.brand}
                      </span>
                      {isCompatible ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                          ✓ Compatible
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/50"
                          title={reason}
                        >
                          ⚠️ Incompatible
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                      {item.title}
                    </h4>

                    {/* Specs Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      {item.specs.socket && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          Socket: {item.specs.socket}
                        </span>
                      )}
                      {item.specs.motherboardSocket && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          Socket: {item.specs.motherboardSocket}
                        </span>
                      )}
                      {item.specs.ramType && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {item.specs.ramType}
                        </span>
                      )}
                      {item.specs.speedMhz && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {item.specs.speedMhz}MHz
                        </span>
                      )}
                      {item.specs.formFactor && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {item.specs.formFactor}
                        </span>
                      )}
                      {item.specs.lengthMm && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {item.specs.lengthMm}mm
                        </span>
                      )}
                      {item.specs.wattage && (
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {item.specs.wattage}W
                        </span>
                      )}
                      {item.specs.warrantyYears && (
                        <span className="text-sky-600 dark:text-sky-400 font-medium">
                          {item.specs.warrantyYears}Y Warranty
                        </span>
                      )}
                    </div>

                    {!isCompatible && reason && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                        {reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Select Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
                      {formatBDT(item.price)}
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="text-[11px] text-gray-400 line-through">
                        {formatBDT(item.originalPrice)}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!isCompatible}
                    onClick={() => {
                      onSelect(item)
                      onClose()
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                      isCompatible
                        ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
