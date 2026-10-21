"use client"

import React from "react"
import Image from "next/image"
import { ComponentCategory, PCComponentItem } from "@/lib/pc-builder/types"
import { formatBDT } from "@/lib/bangladesh"

interface StepCardProps {
  stepNumber: number
  category: ComponentCategory
  categoryLabel: string
  isRequired: boolean
  selectedItem?: PCComponentItem | null
  onOpenSelector: (category: ComponentCategory) => void
  onRemoveItem: (category: ComponentCategory) => void
}

const CATEGORY_ICONS: Record<ComponentCategory, string> = {
  cpu: "⚡",
  motherboard: "🖲️",
  ram: "💾",
  gpu: "🎮",
  psu: "🔌",
  case: "🖥️",
  storage: "💿",
  cooler: "❄️",
}

export default function StepCard({
  stepNumber,
  category,
  categoryLabel,
  isRequired,
  selectedItem,
  onOpenSelector,
  onRemoveItem,
}: StepCardProps) {
  const icon = CATEGORY_ICONS[category] || "⚙️"

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        selectedItem
          ? "border-sky-500/40 bg-sky-50/20 dark:bg-sky-950/10 shadow-sm"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Step Info & Item Display */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {selectedItem ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={selectedItem.thumbnail}
                alt={selectedItem.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center text-2xl flex-shrink-0 border border-dashed border-gray-300 dark:border-gray-700">
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                Step {stepNumber}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {categoryLabel}
              </span>
              {isRequired ? (
                <span className="text-[10px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                  Required
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  Optional
                </span>
              )}
            </div>

            {selectedItem ? (
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {selectedItem.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedItem.brand}
                  </span>
                  <span>•</span>
                  {selectedItem.specs.socket && <span>Socket {selectedItem.specs.socket}</span>}
                  {selectedItem.specs.motherboardSocket && <span>Socket {selectedItem.specs.motherboardSocket}</span>}
                  {selectedItem.specs.ramType && <span>{selectedItem.specs.ramType}</span>}
                  {selectedItem.specs.speedMhz && <span>{selectedItem.specs.speedMhz}MHz</span>}
                  {selectedItem.specs.tdpWatts && <span>{selectedItem.specs.tdpWatts}W</span>}
                  {selectedItem.specs.wattage && <span>{selectedItem.specs.wattage}W</span>}
                  {selectedItem.specs.lengthMm && <span>{selectedItem.specs.lengthMm}mm</span>}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                No {categoryLabel.toLowerCase()} selected yet
              </p>
            )}
          </div>
        </div>

        {/* Right: Price & Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
          {selectedItem ? (
            <div className="text-left sm:text-right mr-2">
              <div className="text-sm sm:text-base font-bold text-sky-600 dark:text-sky-400">
                {formatBDT(selectedItem.price)}
              </div>
              {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.price && (
                <div className="text-xs text-gray-400 line-through">
                  {formatBDT(selectedItem.originalPrice)}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {selectedItem ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenSelector(category)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(category)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition"
                  title="Remove part"
                  aria-label="Remove part"
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenSelector(category)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>+</span> Choose {categoryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
