"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ComparableProduct } from "./types"

interface CompareContextType {
  compareItems: ComparableProduct[]
  addToCompare: (product: ComparableProduct) => { success: boolean; message?: string }
  removeFromCompare: (id: string) => void
  toggleCompare: (product: ComparableProduct) => void
  isInCompare: (id: string) => boolean
  clearCompare: () => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

const MAX_COMPARE_LIMIT = 3
const STORAGE_KEY = "maijrun_compare_items"

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<ComparableProduct[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.slice(0, MAX_COMPARE_LIMIT))
        }
      }
    } catch {}
    setIsInitialized(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems))
    } catch {}
  }, [compareItems, isInitialized])

  const isInCompare = (id: string) => {
    return compareItems.some((item) => item.id === id || item.handle === id)
  }

  const addToCompare = (product: ComparableProduct): { success: boolean; message?: string } => {
    if (isInCompare(product.id) || isInCompare(product.handle)) {
      return { success: false, message: "Item is already in your comparison list." }
    }

    if (compareItems.length >= MAX_COMPARE_LIMIT) {
      return {
        success: false,
        message: `You can compare up to ${MAX_COMPARE_LIMIT} products at a time. Please remove one first.`,
      }
    }

    // Category matching enforcement
    if (compareItems.length > 0) {
      const existingCategory = compareItems[0].category.toLowerCase()
      const newCategory = product.category.toLowerCase()
      if (existingCategory !== newCategory) {
        return {
          success: false,
          message: `Cannot compare a ${product.category} with a ${compareItems[0].category}. Please compare items within the same category.`,
        }
      }
    }

    setCompareItems((prev) => [...prev, product])
    return { success: true }
  }

  const removeFromCompare = (id: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id && item.handle !== id))
  }

  const toggleCompare = (product: ComparableProduct) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id)
    } else {
      const res = addToCompare(product)
      if (!res.success && res.message) {
        alert(res.message)
      }
    }
  }

  const clearCompare = () => {
    setCompareItems([])
  }

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      compareItems: [],
      addToCompare: () => ({ success: false }),
      removeFromCompare: () => {},
      toggleCompare: () => {},
      isInCompare: () => false,
      clearCompare: () => {},
    }
  }
  return context
}
