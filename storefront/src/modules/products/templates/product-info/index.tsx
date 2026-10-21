import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { parseProductSpecs, getProductStockInfo } from "@lib/specs"
import { WarrantyBadge, StockBadge } from "@modules/products/components/badges"
import CompareButton from "@/modules/compare/components/compare-button"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const specs = parseProductSpecs(product.metadata)
  const stock = getProductStockInfo(product)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          {product.collection && (
            <LocalizedClientLink
              href={`/collections/${product.collection.handle}`}
              className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
            >
              {product.collection.title}
            </LocalizedClientLink>
          )}
          {specs?.brand && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-semibold uppercase tracking-wider border border-slate-700">
              {specs.brand}
            </span>
          )}
        </div>

        <Heading
          level="h2"
          className="text-2xl sm:text-3xl leading-snug sm:leading-10 text-ui-fg-base font-bold"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {/* Badges Row: Stock, Warranty, and Compare */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 pb-1">
          <StockBadge stock={stock} size="md" />
          {specs?.warranty && (
            <WarrantyBadge warranty={specs.warranty} size="md" />
          )}
          <CompareButton product={product} variant="pill" />
        </div>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
