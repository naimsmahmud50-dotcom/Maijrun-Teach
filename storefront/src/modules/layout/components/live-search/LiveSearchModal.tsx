"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Laptop, Smartphone, Cpu, Headphones, ArrowRight, Sparkles } from "lucide-react"

interface SearchProduct {
  id: string
  title: string
  handle: string
  thumbnail: string
  price: number
  brand?: string
  category?: string
  inStock?: boolean
}

const POPULAR_TAGS = [
  "MacBook M3 Pro",
  "ROG Zephyrus G16",
  "RTX 4080",
  "Galaxy S25 Ultra",
  "ThinkPad X1 Carbon",
  "Sony WH-1000XM5",
  "Custom Gaming PC",
  "DDR5 32GB RAM",
]

export default function LiveSearchModal({
  isOpen,
  onClose,
  countryCode = "bd",
}: {
  isOpen: boolean
  onClose: () => void
  countryCode?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch products catalog for client-side instant search
    fetch(`/${countryCode}/api/search-products?limit=100`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products) {
          setAllProducts(data.products)
        }
      })
      .catch(() => {
        // Fallback default sample search items
        setAllProducts([
          {
            id: "prod_1",
            title: "Apple MacBook Pro 14 M3 Pro",
            handle: "apple-macbook-pro-14-m3",
            thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
            price: 245000,
            brand: "Apple",
            category: "Laptops",
            inStock: true,
          },
          {
            id: "prod_2",
            title: "Asus ROG Zephyrus G16 (2025)",
            handle: "asus-rog-zephyrus-g16",
            thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
            price: 320000,
            brand: "Asus",
            category: "Laptops",
            inStock: true,
          },
          {
            id: "prod_3",
            title: "Lenovo Legion Pro 5 AMD Ryzen 7",
            handle: "lenovo-legion-pro-5",
            thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
            price: 195000,
            brand: "Lenovo",
            category: "Laptops",
            inStock: true,
          },
          {
            id: "prod_4",
            title: "MAIJRUN Horizon Creator Workstation Desktop",
            handle: "maijrun-horizon-creator-workstation",
            thumbnail: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80",
            price: 285000,
            brand: "MAIJRUN",
            category: "Desktops",
            inStock: true,
          },
        ])
      })
  }, [countryCode])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Filter products based on search input
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const filtered = allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
      setResults(filtered.slice(0, 6))
      setLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [query, allProducts])

  if (!isOpen) return null

  const handleSelect = (handle: string) => {
    onClose()
    router.push(`/${countryCode}/products/${handle}`)
  }

  const handleTagClick = (tag: string) => {
    setQuery(tag)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search laptops, smartphones, PC components, audio..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose()
              if (e.key === "Enter" && results.length > 0) {
                handleSelect(results[0].handle)
              }
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Trending Tags */}
          {!query && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-400 hover:border-cyan-500/50 border border-slate-700/60 text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {loading ? "Searching..." : `Products (${results.length})`}
              </div>

              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product.handle)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-950 flex-shrink-0"
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {product.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.brand && (
                              <span className="text-[11px] text-slate-400">
                                {product.brand}
                              </span>
                            )}
                            {product.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-3 flex-shrink-0">
                        <div className="text-sm font-semibold text-cyan-400">
                          ৳{product.price.toLocaleString("en-BD")}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {product.inStock ? "In Stock" : "Pre-Order"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">No hardware found matching &quot;{query}&quot;</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try searching with broader terms like &quot;Laptop&quot;, &quot;RTX&quot;, or &quot;Asus&quot;.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↵ Enter</kbd> to open
          </span>
          <span className="text-cyan-500 flex items-center gap-1 font-medium">
            MAIJRUN Tech Instant Search
          </span>
        </div>
      </div>
    </div>
  )
}
