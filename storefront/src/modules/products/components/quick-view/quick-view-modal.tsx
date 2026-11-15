"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import {
  X,
  Eye,
  Check,
  ShoppingCart,
  Zap,
  ShieldCheck,
  ArrowRight,
  Package,
  Layers,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { parseProductSpecs, getProductStockInfo } from "@lib/specs"
import {
  StockBadge,
  WarrantyBadge,
  FlagshipBadge,
  OfficialGlobalBadge,
} from "@modules/products/components/badges"
import ColorSwatchSelector from "@modules/products/components/color-swatch/ColorSwatchSelector"
import EmiCalculatorModal from "@modules/products/components/emi/EmiCalculatorModal"

interface QuickViewModalProps {
  product: HttpTypes.StoreProduct
  isOpen: boolean
  onClose: () => void
  onAddToCart?: () => void
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isAdded, setIsAdded] = useState(false)

  const specs = parseProductSpecs(product.metadata)
  const stock = getProductStockInfo(product)
  const images = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [{ id: "thumb", url: product.thumbnail }]
    : []

  const activeImage = images[currentImageIndex]?.url || product.thumbnail || ""

  const cheapestVariant = product.variants?.[0]
  const calculatedPrice = cheapestVariant?.calculated_price?.calculated_amount ?? 0
  const originalPrice = cheapestVariant?.calculated_price?.original_amount ?? 0

  const colorOption = product.options?.find(
    (o) => o.title?.toLowerCase() === "color"
  )
  const colorValues = (colorOption?.values || []).map((val: any) => ({
    name: typeof val === "string" ? val : val.value,
  }))

  useEffect(() => {
    if (colorValues.length > 0 && !selectedColor) {
      setSelectedColor(colorValues[0]?.name || "")
    }
  }, [colorValues, selectedColor])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleQuickAdd = () => {
    setIsAdded(true)
    if (onAddToCart) {
      onAddToCart()
    }
    setTimeout(() => {
      setIsAdded(false)
    }, 2200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      {/* Background click to dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_0_50px_rgba(6,182,212,0.18)] p-5 sm:p-8 text-slate-100 flex flex-col gap-6 scrollbar-thin">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 text-slate-300 hover:text-white flex items-center justify-center transition-all z-20 shadow-md"
          aria-label="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left Column: Interactive Multi-angle Studio Viewer */}
          <div className="flex flex-col gap-3">
            {/* Main Stage */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 flex items-center justify-center shadow-inner group">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-800/50 text-[10px] font-bold uppercase tracking-wider">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Angle {currentImageIndex + 1} of {images.length || 1}</span>
              </div>

              {activeImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-contain p-2 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-all duration-300"
                    sizes="(max-width: 768px) 340px, 480px"
                    priority
                  />
                </div>
              ) : (
                <div className="text-slate-500 text-xs">No image available</div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none">
                {images.map((img: any, idx: number) => {
                  const isActive = idx === currentImageIndex
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setCurrentIndexSafe(idx)}
                      className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 bg-slate-950 p-1 transition-all ${
                        isActive
                          ? "border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      {img.url && (
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-contain p-0.5"
                          sizes="64px"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Official Warranty & Guarantee Badges Box */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  {specs?.warranty || "1 Year Official Brand Warranty"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                ✓ 100% Genuine
              </span>
            </div>
          </div>

          {/* Right Column: Product Overview, Specs & Instant Actions */}
          <div className="flex flex-col gap-4">
            {/* Badges Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <OfficialGlobalBadge size="sm" />
              <FlagshipBadge tier="FLAGSHIP TIER" size="sm" />
              <StockBadge stock={stock} size="sm" />
              {specs?.warranty && (
                <WarrantyBadge warranty={specs.warranty} size="sm" />
              )}
            </div>

            {/* Brand & Title */}
            <div>
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
                {specs?.brand || "MAIJRUN"}
              </span>
              <h2
                id="quick-view-title"
                className="text-lg sm:text-2xl font-bold text-slate-100 leading-snug mt-1"
              >
                {product.title}
              </h2>
            </div>

            {/* Pricing Section with 0% EMI calculation */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-cyan-400">
                  ৳{calculatedPrice.toLocaleString("en-BD")}
                </span>
                {originalPrice > calculatedPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    ৳{originalPrice.toLocaleString("en-BD")}
                  </span>
                )}
              </div>
              {calculatedPrice >= 10000 && (
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    0% EMI available from ৳{Math.round(calculatedPrice / 24).toLocaleString("en-BD")}/mo (up to 24 mos)
                  </span>
                </div>
              )}
            </div>

            {/* Color Swatches (if available) */}
            {colorOption && colorValues.length > 0 && (
              <ColorSwatchSelector
                colors={colorValues}
                selectedColor={selectedColor}
                onSelectColor={(col) => setSelectedColor(col)}
              />
            )}

            {/* Key Hardware Specs Highlights */}
            {specs && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {specs.processor && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processor</span>
                    <span className="font-bold text-slate-200 line-clamp-1">{specs.processor}</span>
                  </div>
                )}
                {specs.ram && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Memory</span>
                    <span className="font-bold text-slate-200 line-clamp-1">{specs.ram}</span>
                  </div>
                )}
                {specs.storage && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Storage</span>
                    <span className="font-bold text-slate-200 line-clamp-1">{specs.storage}</span>
                  </div>
                )}
                {specs.display && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Display</span>
                    <span className="font-bold text-slate-200 line-clamp-1">{specs.display}</span>
                  </div>
                )}
              </div>
            )}

            {/* Instant Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  isAdded
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <LocalizedClientLink
                href={`/products/${product.handle}`}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-cyan-400 transition-all hover:scale-[1.02]"
              >
                <span>Full Experience</span>
                <ArrowRight className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  function setCurrentIndexSafe(idx: number) {
    if (idx >= 0 && idx < images.length) {
      setCurrentImageIndex(idx)
    }
  }
}
