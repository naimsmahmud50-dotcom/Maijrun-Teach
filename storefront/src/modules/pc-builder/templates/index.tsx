"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import StepCard from "../components/step-card"
import PartSelectorModal from "../components/part-selector-modal"
import BuildSummarySidebar from "../components/build-summary-sidebar"
import {
  ComponentCategory,
  PCBuildSelection,
  PCComponentItem,
} from "@/lib/pc-builder/types"
import { validatePCBuild } from "@/lib/pc-builder/compatibility"
import { findComponentById } from "@/lib/pc-builder/catalog"

interface StepConfig {
  category: ComponentCategory
  label: string
  isRequired: boolean
}

const PC_BUILDER_STEPS: StepConfig[] = [
  { category: "cpu", label: "Processor (CPU)", isRequired: true },
  { category: "motherboard", label: "Motherboard", isRequired: true },
  { category: "ram", label: "RAM (Memory)", isRequired: true },
  { category: "gpu", label: "Graphics Card (GPU)", isRequired: true },
  { category: "psu", label: "Power Supply (PSU)", isRequired: true },
  { category: "case", label: "Casing", isRequired: true },
  { category: "storage", label: "Storage (SSD/HDD)", isRequired: false },
  { category: "cooler", label: "CPU Cooler", isRequired: false },
]

export default function PCBuilderTemplate() {
  const searchParams = useSearchParams()
  const [selection, setSelection] = useState<PCBuildSelection>({})
  const [buildName, setBuildName] = useState<string>("My MAIJRUN Custom PC")
  const [activeCategoryModal, setActiveCategoryModal] = useState<ComponentCategory | null>(null)
  const [isLoadedFromShare, setIsLoadedFromShare] = useState(false)

  // Load build from share ID if present in query params
  useEffect(() => {
    const shareId = searchParams.get("build")
    if (shareId) {
      fetch(`/api/pc-builder/share/${shareId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.selection) {
            setSelection(data.data.selection)
            if (data.data.name) setBuildName(data.data.name)
            setIsLoadedFromShare(true)
          }
        })
        .catch((err) => console.error("Error loading shared build", err))
    } else {
      // Or load from localStorage
      try {
        const savedLocal = localStorage.getItem("maijrun_pc_build")
        if (savedLocal) {
          const parsed = JSON.parse(savedLocal)
          const restored: PCBuildSelection = {}
          for (const key of Object.keys(parsed) as ComponentCategory[]) {
            const item = findComponentById(parsed[key])
            if (item) restored[key] = item
          }
          setSelection(restored)
        }
      } catch {}
    }
  }, [searchParams])

  // Persist current build to localStorage
  useEffect(() => {
    try {
      const serializable: Record<string, string> = {}
      for (const [key, item] of Object.entries(selection)) {
        if (item?.id) serializable[key] = item.id
      }
      localStorage.setItem("maijrun_pc_build", JSON.stringify(serializable))
    } catch {}
  }, [selection])

  // Revalidate compatibility on selection change
  const validation = useMemo(() => {
    return validatePCBuild(selection)
  }, [selection])

  const handleSelectItem = (item: PCComponentItem) => {
    setSelection((prev) => ({
      ...prev,
      [item.category]: item,
    }))
  }

  const handleRemoveItem = (category: ComponentCategory) => {
    setSelection((prev) => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const handleResetBuild = () => {
    if (window.confirm("Are you sure you want to reset all selected components?")) {
      setSelection({})
      try {
        localStorage.removeItem("maijrun_pc_build")
      } catch {}
    }
  }

  const activeCategoryLabel = PC_BUILDER_STEPS.find(
    (s) => s.category === activeCategoryModal
  )?.label || ""

  return (
    <div className="py-8 sm:py-12 content-container max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 mb-2">
            <span>⚙️</span> Professional Hardware Compatibility Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Custom PC Builder
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Configure your custom desktop with real-time socket matching, power headroom calculation, and official brand warranties.
          </p>
        </div>

        {isLoadedFromShare && (
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
            <span>🔗</span>
            <span>Viewing shared build: <strong>{buildName}</strong></span>
          </div>
        )}
      </div>

      {/* Main Grid: Steps on Left, Sticky Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Component Slots (7 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Component Selection Steps
            </h2>
            <span className="text-xs text-gray-500">
              CPU ➔ Motherboard ➔ RAM ➔ GPU ➔ PSU ➔ Case
            </span>
          </div>

          {PC_BUILDER_STEPS.map((step, index) => (
            <StepCard
              key={step.category}
              stepNumber={index + 1}
              category={step.category}
              categoryLabel={step.label}
              isRequired={step.isRequired}
              selectedItem={selection[step.category]}
              onOpenSelector={(cat) => setActiveCategoryModal(cat)}
              onRemoveItem={(cat) => handleRemoveItem(cat)}
            />
          ))}
        </div>

        {/* Right Column: Sticky Summary & Validation Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <BuildSummarySidebar
            selection={selection}
            validation={validation}
            buildName={buildName}
            onResetBuild={handleResetBuild}
          />
        </div>
      </div>

      {/* Part Selector Modal / Drawer */}
      {activeCategoryModal && (
        <PartSelectorModal
          category={activeCategoryModal}
          categoryLabel={activeCategoryLabel}
          isOpen={Boolean(activeCategoryModal)}
          currentSelection={selection}
          onSelect={handleSelectItem}
          onClose={() => setActiveCategoryModal(null)}
        />
      )}
    </div>
  )
}
