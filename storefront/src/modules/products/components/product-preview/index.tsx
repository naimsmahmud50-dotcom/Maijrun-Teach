import React from "react"
import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { parseProductSpecs, getProductStockInfo } from "@lib/specs"
import { StockBadge } from "@modules/products/components/badges"
import CompareButton from "@/modules/compare/components/compare-button"
import Image from "next/image"
import PreviewPrice from "./price"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

function getSpecTags(specs: any, categoryName = "", title = "") {
  const tags: string[] = []
  if (!specs) return tags

  const titleLower = title.toLowerCase()

  if (specs.processor) {
    const p = specs.processor
    if (p.includes("M4 Max")) tags.push("M4 Max")
    else if (p.includes("M4 Pro")) tags.push("M4 Pro")
    else if (p.includes("M3 Pro")) tags.push("M3 Pro")
    else if (p.includes("M3")) tags.push("Apple M3")
    else if (p.includes("M2 Ultra")) tags.push("M2 Ultra")
    else if (p.includes("A18 Pro")) tags.push("A18 Pro")
    else if (p.includes("Tensor G4")) tags.push("Tensor G4")
    else if (p.includes("Snapdragon 8 Elite")) tags.push("SD 8 Elite")
    else if (p.includes("Snapdragon 8 Gen 3")) tags.push("SD 8 Gen 3")
    else if (p.includes("Ultra 9")) tags.push("Core Ultra 9")
    else if (p.includes("i9-14900")) tags.push("Core i9")
    else if (p.includes("Ryzen 9")) tags.push("Ryzen 9")
    else if (p.includes("Ryzen 7")) tags.push("Ryzen 7")
    else if (specs.processorFamily && specs.processorFamily !== "Other") {
      tags.push(specs.processorFamily)
    }
  }

  if (specs.ram) {
    const match = specs.ram.match(/(\d+GB|\d+TB)/i)
    if (match) tags.push(match[1] + " RAM")
  }

  if (specs.storage) {
    const match = specs.storage.match(/(\d+TB|\d+GB)/i)
    if (match) tags.push(match[1] + " SSD")
  }

  // Fallback hardware tags for audio, monitors, wearables
  if (tags.length === 0) {
    if (titleLower.includes("headphone") || titleLower.includes("airpods") || titleLower.includes("sony") || titleLower.includes("bose")) {
      tags.push("Active ANC", "Hi-Res Audio", "Spatial Sound")
    } else if (titleLower.includes("watch")) {
      tags.push("Titanium 49mm", "3000 nits", "GPS + Cellular")
    } else if (titleLower.includes("monitor") || titleLower.includes("oled")) {
      tags.push("4K UHD", "240Hz OLED", "0.03ms GtG")
    } else if (titleLower.includes("keyboard")) {
      tags.push("QMK/VIA", "Hot-Swap", "Wireless")
    }
  }

  return tags.slice(0, 3)
}

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
  const brandName = specs?.brand || "MAIJRUN"
  const categoryName = product.categories?.[0]?.name || "Flagship"
  const specTags = getSpecTags(specs, categoryName, product.title)
  const initialImage = product.thumbnail || product.images?.[0]?.url

  return (
    <div
      data-testid="product-wrapper"
      className="group relative flex flex-col justify-between h-full rounded-2xl p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/50 shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all duration-300 select-none"
    >
      {/* Top Header Bar: Badges & Compare Button */}
      <div className="flex items-center justify-between gap-1.5 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <span className="text-cyan-400">★</span> OFFICIAL GLOBAL
          </span>
          <StockBadge stock={stock} size="sm" />
        </div>
        <CompareButton product={product} variant="icon" />
      </div>

      {/* Product Image Stage */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-slate-800/70 group-hover:border-cyan-500/30 transition-all p-3"
      >
        {initialImage ? (
          <Image
            src={initialImage}
            alt={product.title}
            fill
            className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderImage size={24} />
          </div>
        )}
      </LocalizedClientLink>

      {/* Brand & Category Label */}
      <div className="flex items-center justify-between text-[11px] mt-3 mb-1">
        <span className="font-extrabold text-cyan-400 uppercase tracking-widest">
          {brandName}
        </span>
        <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">
          {categoryName}
        </span>
      </div>

      {/* Product Title */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <Text
          className="text-slate-100 group-hover:text-cyan-400 font-bold text-sm leading-snug line-clamp-2 transition-colors duration-200"
          data-testid="product-title"
        >
          {product.title}
        </Text>
      </LocalizedClientLink>

      {/* Micro Hardware Specs Tags */}
      {specTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 my-2.5">
          {specTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center gap-1 shadow-sm"
            >
              {idx === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />
              )}
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Price & Official Warranty Row */}
      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-800/70">
        <div>
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
        {specs?.warranty ? (
          <div
            className="text-[10px] text-slate-400 flex items-center gap-1 text-right max-w-[130px] font-medium"
            title={specs.warranty}
          >
            <span className="text-cyan-400 shrink-0">🛡️</span>
            <span className="truncate">{specs.warranty}</span>
          </div>
        ) : (
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <span>✓ Genuine Global</span>
          </div>
        )}
      </div>

      {/* Instant Interactive CTA Link */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/90 group-hover:bg-cyan-500 text-slate-200 group-hover:text-slate-950 font-bold text-xs border border-slate-700/80 group-hover:border-cyan-400 transition-all duration-200 shadow-sm"
      >
        <span>Explore Flagship</span>
        <span className="transition-transform group-hover:translate-x-1 duration-200">
          →
        </span>
      </LocalizedClientLink>
    </div>
  )
}
