import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { parseProductSpecs, getProductStockInfo } from "@lib/specs"
import { WarrantyBadge, StockBadge } from "@modules/products/components/badges"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const specs = parseProductSpecs(product.metadata)
  const stock = getProductStockInfo(product)

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between items-start gap-2">
          <Text className="text-ui-fg-subtle line-clamp-2" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 shrink-0">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>

        {/* Tech Badges: Stock Status & Warranty */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <StockBadge stock={stock} size="sm" />
          {specs?.warranty && (
            <WarrantyBadge warranty={specs.warranty} size="sm" />
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
