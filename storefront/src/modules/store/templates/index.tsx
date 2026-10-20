import React from "react"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { sortProducts } from "@lib/util/sort-products"
import {
  parseFilterParams,
  deriveFilterFacets,
  filterProducts,
} from "@lib/filters"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import TechFilters from "@modules/store/components/tech-filters"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PRODUCT_LIMIT = 12

export interface StoreTemplateProps {
  searchParams: Record<string, string | string[] | undefined>
  countryCode: string
}

export default async function StoreTemplate({
  searchParams,
  countryCode,
}: StoreTemplateProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // 1. Fetch catalog products for this region (up to 100 items cached)
  const {
    response: { products: allProducts },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      limit: 100,
    },
    countryCode,
  })

  // 2. Dynamically derive real facets from live product catalog
  const facets = deriveFilterFacets(allProducts)

  // 3. Parse and sanitize query parameters
  const filters = parseFilterParams(searchParams)
  const sortBy = (filters.sortBy as SortOptions) || "created_at"

  // 4. Filter products using AND between groups and OR within groups
  const filteredProducts = filterProducts(allProducts, filters)

  // 5. Sort products
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  // 6. Paginate products
  const totalFiltered = sortedProducts.length
  const totalPages = Math.ceil(totalFiltered / PRODUCT_LIMIT)
  const page = Math.min(Math.max(1, filters.page), Math.max(1, totalPages))
  const offset = (page - 1) * PRODUCT_LIMIT
  const paginatedProducts = sortedProducts.slice(offset, offset + PRODUCT_LIMIT)

  // Check if any filter is active
  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.processors.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStockOnly

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-8 content-container"
      data-testid="category-container"
    >
      {/* Tech Filter Sidebar & Mobile Drawer */}
      <TechFilters
        facets={facets}
        filters={filters}
        totalResults={totalFiltered}
        sortBy={sortBy}
      />

      {/* Main Product Listing Area */}
      <div className="w-full flex-1">
        {/* Title and Result Count Header */}
        <div className="mb-6 flex flex-col small:flex-row small:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h1
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
              data-testid="store-page-title"
            >
              Laptops &amp; Desktops
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Official MAIJRUN Tech devices with manufacturer warranty &amp; express nationwide delivery
            </p>
          </div>

          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {totalFiltered === 0 ? (
              <span>0 products</span>
            ) : hasActiveFilters ? (
              <span>
                Showing <strong className="text-zinc-900 dark:text-zinc-100">{paginatedProducts.length}</strong> of{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">{totalFiltered}</strong> matching products
                {" "}<span className="text-zinc-400">({allProducts.length} total)</span>
              </span>
            ) : (
              <span>
                Showing <strong className="text-zinc-900 dark:text-zinc-100">{paginatedProducts.length}</strong> of{" "}
                <strong className="text-zinc-900 dark:text-zinc-100">{allProducts.length}</strong> products
              </span>
            )}
          </div>
        </div>

        {/* Empty State when 0 products match filters */}
        {totalFiltered === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 my-4">
            <div className="w-14 h-14 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No products match your filters
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-6">
              We couldn&apos;t find any devices matching your exact brand, processor,
              price range, or stock criteria. Try relaxing your filters.
            </p>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear all filters
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            {/* Responsive Product Grid */}
            <ul
              className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-3 large:grid-cols-4 gap-x-6 gap-y-8"
              data-testid="products-list"
            >
              {paginatedProducts.map((p) => (
                <li key={p.id}>
                  <ProductPreview product={p} region={region} />
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                data-testid="product-pagination"
                page={page}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
