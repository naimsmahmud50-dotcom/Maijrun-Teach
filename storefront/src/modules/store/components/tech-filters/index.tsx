"use client"

import React, { useState, useEffect, useTransition, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FilterFacets, ParsedFilters, buildFilterQuery } from "@lib/filters"
import SortProducts, { SortOptions } from "../refinement-list/sort-products"

interface TechFiltersProps {
  facets: FilterFacets
  filters: ParsedFilters
  totalResults: number
  sortBy: SortOptions
}

export default function TechFilters({
  facets,
  filters,
  totalResults,
  sortBy,
}: TechFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Local state for debounced price inputs
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : ""
  )
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ""
  )

  // Keep local price inputs synchronized if URL changes externally
  useEffect(() => {
    setLocalMinPrice(
      filters.minPrice !== undefined ? String(filters.minPrice) : ""
    )
    setLocalMaxPrice(
      filters.maxPrice !== undefined ? String(filters.maxPrice) : ""
    )
  }, [filters.minPrice, filters.maxPrice])

  // Count active filters (excluding default sort and page)
  const activeFilterCount =
    filters.brands.length +
    filters.processors.length +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)

  // Navigate helper with transition
  const applyUpdates = useCallback(
    (
      updates: Record<
        string,
        string | string[] | number | boolean | null | undefined
      >
    ) => {
      const current = new URLSearchParams(searchParams.toString())
      const query = buildFilterQuery(current, updates)
      startTransition(() => {
        router.push(`${pathname}?${query}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  // Brand toggle
  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    applyUpdates({ brand: next })
  }

  // Processor toggle
  const toggleProcessor = (processor: string) => {
    const next = filters.processors.includes(processor)
      ? filters.processors.filter((p) => p !== processor)
      : [...filters.processors, processor]
    applyUpdates({ processor: next })
  }

  // In stock toggle
  const toggleInStock = () => {
    applyUpdates({ inStock: !filters.inStockOnly })
  }

  // Debounced price commit
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsedMin =
        localMinPrice.trim() !== "" ? Number(localMinPrice) : null
      const parsedMax =
        localMaxPrice.trim() !== "" ? Number(localMaxPrice) : null

      const currentMin = filters.minPrice ?? null
      const currentMax = filters.maxPrice ?? null

      if (parsedMin !== currentMin || parsedMax !== currentMax) {
        applyUpdates({
          minPrice: parsedMin && parsedMin > 0 ? parsedMin : null,
          maxPrice: parsedMax && parsedMax > 0 ? parsedMax : null,
        })
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [localMinPrice, localMaxPrice, filters.minPrice, filters.maxPrice, applyUpdates])

  // Clear all filters
  const clearAllFilters = () => {
    setLocalMinPrice("")
    setLocalMaxPrice("")
    applyUpdates({
      brand: null,
      processor: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
    })
  }

  // Sort handler
  const handleSortChange = (newSort: string) => {
    applyUpdates({ sortBy: newSort })
  }

  return (
    <>
      {/* Mobile sticky filter bar */}
      <div className="small:hidden w-full flex items-center justify-between gap-3 mb-6 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex-1 min-h-[44px] px-4 py-2 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm rounded-md shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={isMobileOpen}
          aria-label="Open filter options"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="shrink-0">
          <SortProducts
            sortBy={sortBy}
            setQueryParams={(_k, v) => handleSortChange(v)}
          />
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileOpen && (
        <div
          className="small:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in-top"
          role="dialog"
          aria-modal="true"
          aria-label="Product Filters"
        >
          <div
            className="w-full max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close filters"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {renderFilterContent({
                facets,
                filters,
                localMinPrice,
                localMaxPrice,
                setLocalMinPrice,
                setLocalMaxPrice,
                toggleBrand,
                toggleProcessor,
                toggleInStock,
                isPending,
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="min-h-[44px] flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="min-h-[44px] flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View {totalResults} {totalResults === 1 ? "Product" : "Products"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden small:block w-[260px] shrink-0 mr-8 sticky top-24 self-start">
        <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Filter Tech</span>
            {isPending && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            )}
          </h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium min-h-[44px] flex items-center"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Sort selector for desktop */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Sort by
          </label>
          <SortProducts
            sortBy={sortBy}
            setQueryParams={(_k, v) => handleSortChange(v)}
          />
        </div>

        {/* Active Filter Chips */}
        {renderActiveChips({
          filters,
          toggleBrand,
          toggleProcessor,
          toggleInStock,
          clearPrice: () => {
            setLocalMinPrice("")
            setLocalMaxPrice("")
            applyUpdates({ minPrice: null, maxPrice: null })
          },
          clearAll: clearAllFilters,
        })}

        {/* Filter Controls Body */}
        <div className="space-y-6">
          {renderFilterContent({
            facets,
            filters,
            localMinPrice,
            localMaxPrice,
            setLocalMinPrice,
            setLocalMaxPrice,
            toggleBrand,
            toggleProcessor,
            toggleInStock,
            isPending,
          })}
        </div>
      </aside>
    </>
  )
}

function renderActiveChips({
  filters,
  toggleBrand,
  toggleProcessor,
  toggleInStock,
  clearPrice,
  clearAll,
}: {
  filters: ParsedFilters
  toggleBrand: (b: string) => void
  toggleProcessor: (p: string) => void
  toggleInStock: () => void
  clearPrice: () => void
  clearAll: () => void
}) {
  const hasChips =
    filters.brands.length > 0 ||
    filters.processors.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStockOnly

  if (!hasChips) return null

  return (
    <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Active filters:
        </span>
        <button
          onClick={clearAll}
          className="text-xs text-zinc-500 hover:text-red-600 transition-colors"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filters.brands.map((b) => (
          <span
            key={`chip-brand-${b}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {b}
            <button
              type="button"
              onClick={() => toggleBrand(b)}
              className="hover:text-red-600 ml-0.5 focus:outline-none"
              aria-label={`Remove brand ${b}`}
            >
              ×
            </button>
          </span>
        ))}

        {filters.processors.map((p) => (
          <span
            key={`chip-proc-${p}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          >
            {p}
            <button
              type="button"
              onClick={() => toggleProcessor(p)}
              className="hover:text-red-600 ml-0.5 focus:outline-none"
              aria-label={`Remove processor ${p}`}
            >
              ×
            </button>
          </span>
        ))}

        {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {filters.minPrice !== undefined && filters.maxPrice !== undefined
              ? `৳${filters.minPrice.toLocaleString()} - ৳${filters.maxPrice.toLocaleString()}`
              : filters.minPrice !== undefined
              ? `≥ ৳${filters.minPrice.toLocaleString()}`
              : `≤ ৳${filters.maxPrice?.toLocaleString()}`}
            <button
              type="button"
              onClick={clearPrice}
              className="hover:text-red-600 ml-0.5 focus:outline-none"
              aria-label="Remove price filter"
            >
              ×
            </button>
          </span>
        )}

        {filters.inStockOnly && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            In Stock Only
            <button
              type="button"
              onClick={toggleInStock}
              className="hover:text-red-600 ml-0.5 focus:outline-none"
              aria-label="Remove in stock filter"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

function renderFilterContent({
  facets,
  filters,
  localMinPrice,
  localMaxPrice,
  setLocalMinPrice,
  setLocalMaxPrice,
  toggleBrand,
  toggleProcessor,
  toggleInStock,
  isPending,
}: {
  facets: FilterFacets
  filters: ParsedFilters
  localMinPrice: string
  localMaxPrice: string
  setLocalMinPrice: (v: string) => void
  setLocalMaxPrice: (v: string) => void
  toggleBrand: (b: string) => void
  toggleProcessor: (p: string) => void
  toggleInStock: () => void
  isPending: boolean
}) {
  return (
    <>
      {/* 1. In-Stock Only Toggle */}
      <div className="pt-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <label
          htmlFor="filter-in-stock"
          className="flex items-center justify-between min-h-[44px] cursor-pointer group"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
              In Stock Only
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {facets.inStockCount} available now
            </span>
          </div>
          <div className="relative inline-flex items-center">
            <input
              id="filter-in-stock"
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={toggleInStock}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {/* 2. Brand Multi-Select */}
      {facets.brands.length > 0 && (
        <fieldset className="pt-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Brand
          </legend>
          <div className="space-y-1">
            {facets.brands.map((brand) => {
              const checked = filters.brands.includes(brand.value)
              return (
                <label
                  key={brand.value}
                  className="flex items-center justify-between min-h-[44px] px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand.value)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                    <span
                      className={`text-sm ${
                        checked
                          ? "font-semibold text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {brand.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    ({brand.count})
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      {/* 3. Processor Family */}
      {facets.processors.length > 0 && (
        <fieldset className="pt-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Processor Family
          </legend>
          <div className="space-y-1">
            {facets.processors.map((proc) => {
              const checked = filters.processors.includes(proc.value)
              return (
                <label
                  key={proc.value}
                  className="flex items-center justify-between min-h-[44px] px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProcessor(proc.value)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                    <span
                      className={`text-sm ${
                        checked
                          ? "font-semibold text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {proc.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    ({proc.count})
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      {/* 4. Price Range (BDT) */}
      <fieldset className="pt-1 pb-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          Price Range (BDT ৳)
        </legend>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label
                htmlFor="price-min-input"
                className="block text-[11px] text-zinc-500 mb-1"
              >
                Min (৳)
              </label>
              <input
                id="price-min-input"
                type="number"
                min={0}
                placeholder={facets.priceRange.min > 0 ? String(facets.priceRange.min) : "0"}
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full min-h-[44px] px-3 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <span className="text-zinc-400 self-end mb-3">—</span>
            <div className="flex-1">
              <label
                htmlFor="price-max-input"
                className="block text-[11px] text-zinc-500 mb-1"
              >
                Max (৳)
              </label>
              <input
                id="price-max-input"
                type="number"
                min={0}
                placeholder={facets.priceRange.max > 0 ? String(facets.priceRange.max) : "500000"}
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full min-h-[44px] px-3 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Quick price presets */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setLocalMinPrice("")
                setLocalMaxPrice("100000")
              }}
              className="text-xs py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Under ৳1 Lakh
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalMinPrice("100000")
                setLocalMaxPrice("200000")
              }}
              className="text-xs py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              ৳1L – ৳2L
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalMinPrice("200000")
                setLocalMaxPrice("")
              }}
              className="col-span-2 text-xs py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Above ৳2 Lakh (Pro/Gaming)
            </button>
          </div>
        </div>
      </fieldset>
    </>
  )
}
