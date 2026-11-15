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
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-cyan-500/40 bg-cyan-950/70 text-cyan-300 ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm"
      } ${className}`}
      data-testid="warranty-badge"
      title={`Official Warranty: ${warranty}`}
    >
      <svg
        className={isSmall ? "w-3 h-3 text-cyan-400" : "w-3.5 h-3.5 text-cyan-400"}
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

  let dotColor = "bg-emerald-400 shadow-[0_0_6px_#10b981]"
  if (stock.status === "low_stock") {
    dotColor = "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
  } else if (stock.status === "out_of_stock") {
    dotColor = "bg-rose-400 shadow-[0_0_6px_#f43f5e]"
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

export function FlagshipBadge({
  tier = "FLAGSHIP TIER",
  size = "sm",
  className = "",
}: {
  tier?: string
  size?: "sm" | "md"
  className?: string
}) {
  const isSmall = size === "sm"
  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-widest rounded-full border border-cyan-400/40 bg-cyan-950/90 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      } ${className}`}
      data-testid="flagship-badge"
    >
      <span className="text-cyan-400">⚡</span>
      <span>{tier}</span>
    </span>
  )
}

export function OfficialGlobalBadge({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "md"
  className?: string
}) {
  const isSmall = size === "sm"
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)] ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
      data-testid="official-global-badge"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>OFFICIAL GLOBAL</span>
    </span>
  )
}
