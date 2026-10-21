"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCompare } from "@/lib/compare/context"
import { useParams } from "next/navigation"

export default function FloatingCompareTray() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "us"

  if (compareItems.length === 0) return null

  const compareUrl = `/${countryCode}/compare?ids=${compareItems.map((i) => i.handle || i.id).join(",")}`

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-up">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
        {/* Left: Thumbs & Count */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center -space-x-2 flex-shrink-0">
            {compareItems.map((item) => (
              <div
                key={item.id}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 overflow-hidden shadow-sm flex-shrink-0 group"
              >
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">💻</div>
                )}
                <button
                  type="button"
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                  title="Remove"
                  aria-label="Remove item from compare"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="min-w-0 hidden sm:block">
            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Compare Tray</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {compareItems.length} / 3
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              {compareItems.map((i) => i.title).join(", ")}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-500 transition"
          >
            Clear
          </button>

          <Link
            href={compareUrl}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition flex items-center gap-1.5 shadow-sm ${
              compareItems.length >= 2
                ? "bg-sky-600 hover:bg-sky-500 shadow-sky-600/20"
                : "bg-gray-400 cursor-not-allowed opacity-80"
            }`}
          >
            <span>⇄ Compare Now</span>
            <span>({compareItems.length})</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
