"use client"

import React, { useState, useEffect } from "react"
import { Search } from "lucide-react"
import LiveSearchModal from "../live-search/LiveSearchModal"

export default function SearchTrigger({ countryCode = "bd" }: { countryCode?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      {/* Desktop Search Input Trigger */}
      <div className="hidden medium:block w-full max-w-md mx-4">
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-400 text-xs transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">Search laptops, phones, components...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-cyan-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Tablet & Mobile Search Icon Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label="Search"
        className="medium:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* The Search Modal */}
      <LiveSearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        countryCode={countryCode}
      />
    </>
  )
}
