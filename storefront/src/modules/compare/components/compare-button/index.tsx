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
            ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
            : "bg-slate-800 text-slate-200 hover:text-cyan-400 hover:bg-slate-700 border border-slate-700"
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
          ? "bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
          : "bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700"
      } ${className}`}
    >
      <span className={isSelected ? "text-slate-950" : "text-cyan-400"}>{isSelected ? "✓" : "⇄"}</span>
      <span>{isSelected ? "In Compare" : "Compare"}</span>
    </button>
  )
}
