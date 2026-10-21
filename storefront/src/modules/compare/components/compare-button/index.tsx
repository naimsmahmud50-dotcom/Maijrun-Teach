"use client"

import React from "react"
import { useCompare } from "@/lib/compare/context"
import { normalizeProductSpecs } from "@/lib/compare/normalizer"
import { ComparableProduct } from "@/lib/compare/types"

interface CompareButtonProps {
  product: any
  variant?: "pill" | "icon" | "full"
  className?: string
}

export default function CompareButton({
  product,
  variant = "pill",
  className = "",
}: CompareButtonProps) {
  const { isInCompare, toggleCompare } = useCompare()

  if (!product) return null

  const isSelected = isInCompare(product.id) || isInCompare(product.handle)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const normalized = normalizeProductSpecs(product)
    const comparable: ComparableProduct = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail || product.images?.[0]?.url || "",
      priceBdt: normalized.priceBdt,
      category: normalized.category,
      inStock: Boolean(product.variants?.[0]?.inventory_quantity > 0),
      inventoryQuantity: product.variants?.[0]?.inventory_quantity ?? 0,
      normalizedSpecs: normalized,
    }

    toggleCompare(comparable)
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
          isSelected
            ? "bg-sky-600 text-white"
            : "bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-600 dark:text-gray-300 hover:text-sky-600 border border-gray-200 dark:border-gray-700"
        } ${className}`}
        title={isSelected ? "Remove from Compare" : "Add to Compare"}
        aria-label="Toggle comparison"
      >
        <span className="text-xs">{isSelected ? "✓" : "⇄"}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
        isSelected
          ? "bg-sky-600 text-white hover:bg-sky-500 shadow-sm"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      } ${className}`}
    >
      <span>{isSelected ? "✓" : "⇄"}</span>
      <span>{isSelected ? "In Compare" : "Compare"}</span>
    </button>
  )
}
