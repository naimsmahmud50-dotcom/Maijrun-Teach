"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Eye, Sparkles } from "lucide-react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-center">
        <PlaceholderImage size={48} />
      </div>
    )
  }

  const activeImage = images[currentIndex] || images[0]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col w-full small:mx-auto small:max-w-3xl gap-y-4">
      {/* Main Studio Viewport */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black p-4 sm:p-6 shadow-2xl backdrop-blur-xl group select-none"
        id={activeImage?.id}
        data-testid="interactive-gallery-main"
      >
        {/* Subtle Ambient Radial Light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-800/60 text-[10px] font-bold tracking-wider uppercase shadow-md">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Angle {currentIndex + 1} of {images.length}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 text-[10px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Studio Master</span>
          </span>
        </div>

        {/* Active Product Image */}
        {activeImage?.url ? (
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6">
            <Image
              src={activeImage.url}
              priority
              className="object-contain duration-300 transition-all filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:scale-105"
              alt={`Studio angle view ${currentIndex + 1}`}
              fill
              sizes="(max-width: 576px) 380px, (max-width: 992px) 640px, 900px"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderImage size={40} />
          </div>
        )}

        {/* Previous / Next Arrows (if > 1 image) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center transition-all shadow-xl backdrop-blur-md opacity-80 group-hover:opacity-100 active:scale-95 z-20"
              aria-label="Previous image angle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center transition-all shadow-xl backdrop-blur-md opacity-80 group-hover:opacity-100 active:scale-95 z-20"
              aria-label="Next image angle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Multi-angle Thumbnail Preview Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none">
          {images.map((image, index) => {
            const isActive = index === currentIndex
            return (
              <button
                key={image.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-slate-950 p-1.5 transition-all transform active:scale-95 ${
                  isActive
                    ? "border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105"
                    : "border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100"
                }`}
                aria-label={`View angle ${index + 1}`}
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={`Angle preview ${index + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                ) : (
                  <PlaceholderImage size={16} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
