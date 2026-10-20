import React from "react"
import { StockInfo } from "@lib/specs"

export interface WarrantyBadgeProps {
  warranty?: string | null
  size?: "sm" | "md"
  className?: string
}

export function WarrantyBadge({
  warranty,
  size = "md",
  className = "",
}: WarrantyBadgeProps) {
  if (!warranty || warranty.trim().length === 0) {
    return null
  }

  const isSmall = size === "sm"

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm"
      } ${className}`}
      data-testid="warranty-badge"
      title={`Official Warranty: ${warranty}`}
    >
      <svg
        className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span>{warranty}</span>
    </span>
  )
}

export interface StockBadgeProps {
  stock: StockInfo
  size?: "sm" | "md"
  className?: string
}

export function StockBadge({
  stock,
  size = "md",
  className = "",
}: StockBadgeProps) {
  const isSmall = size === "sm"

  let dotColor = "bg-emerald-500"
  if (stock.status === "low_stock") {
    dotColor = "bg-amber-500"
  } else if (stock.status === "out_of_stock") {
    dotColor = "bg-rose-500"
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        stock.badgeClass
      } ${isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm"} ${className}`}
      data-testid={`stock-badge-${stock.status}`}
      aria-label={`Availability: ${stock.label}`}
    >
      <span
        className={`rounded-full shrink-0 ${dotColor} ${
          isSmall ? "w-1.5 h-1.5" : "w-2 h-2"
        } ${stock.status === "in_stock" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span>{stock.label}</span>
    </span>
  )
}
