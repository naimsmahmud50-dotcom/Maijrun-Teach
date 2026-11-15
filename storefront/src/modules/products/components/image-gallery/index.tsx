"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
} from "lucide-react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-center">
        <PlaceholderImage size={48} />
      </div>
    )
  }

  const activeImage = images[currentIndex] || images[0]

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale((prev) => Math.max(prev - 0.5, 1))
  }

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomScale(1)
  }

  // Keyboard navigation when Lightbox is active
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false)
        setZoomScale(1)
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isLightboxOpen, images.length])

  return (
    <div className="flex flex-col w-full small:mx-auto small:max-w-3xl gap-y-4">
      {/* Main Studio Viewport */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black p-4 sm:p-6 shadow-2xl backdrop-blur-xl group select-none cursor-zoom-in"
        id={activeImage?.id}
        data-testid="interactive-gallery-main"
        onClick={() => setIsLightboxOpen(true)}
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

        {/* Click to Zoom Hover Indicator Pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/50 text-xs font-semibold shadow-lg">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click for Fullscreen Studio Zoom</span>
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

      {/* Ultra-Luxury Fullscreen Lightbox / Zoom Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-2xl p-4 sm:p-8 animate-in fade-in duration-200 select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Studio Master Lightbox"
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between z-30 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                Studio Angle {currentIndex + 1} of {images.length}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Use Left / Right arrows to switch angles • Esc to close
              </span>
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  title="Reset Zoom"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-cyan-400 px-2 min-w-[45px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false)
                  setZoomScale(1)
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md ml-2"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Stage */}
          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-4">
            {activeImage?.url ? (
              <div
                className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <Image
                  src={activeImage.url}
                  alt={`Fullscreen studio view angle ${currentIndex + 1}`}
                  fill
                  className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                  sizes="100vw"
                  priority
                />
              </div>
            ) : (
              <div className="text-slate-500">Image not available</div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center transition-all shadow-2xl backdrop-blur-md active:scale-95 z-30"
                  aria-label="Previous angle"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center transition-all shadow-2xl backdrop-blur-md active:scale-95 z-30"
                  aria-label="Next angle"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-30">
              {images.map((img, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx)
                      setZoomScale(1)
                    }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-slate-950 p-1 transition-all ${
                      isActive
                        ? "border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Select angle ${idx + 1}`}
                  >
                    {img.url && (
                      <Image
                        src={img.url}
                        alt={`Thumbnail angle ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
