"use client"

import React from "react"
import { Check } from "lucide-react"

interface ColorSwatchProps {
  colors: {
    name: string
    code?: string
    imageIndex?: number
  }[]
  selectedColor: string
  onSelectColor: (colorName: string) => void
  disabled?: boolean
}

// Fallback color hex mapping for common tech hardware shades
const COLOR_HEX_MAP: Record<string, string> = {
  black: "#111827",
  "space black": "#1A1A1A",
  "space gray": "#4A4D52",
  "onyx grey": "#383B40",
  "eclipse gray": "#4B5563",
  silver: "#D1D5DB",
  "platinum silver": "#E5E7EB",
  white: "#F9FAFB",
  gold: "#F59E0B",
  cyan: "#06B6D4",
  "neon cyan": "#22D3EE",
  blue: "#2563EB",
  "vivid orange": "#E5725B",
  teal: "#0D9488",
  purple: "#8B5CF6",
  midnight: "#0F172A",
  starlight: "#F1E5D1",
}

export default function ColorSwatchSelector({
  colors,
  selectedColor,
  onSelectColor,
  disabled = false,
}: ColorSwatchProps) {
  if (!colors || colors.length === 0) return null

  return (
    <div className="flex flex-col gap-y-2.5 my-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">Color Variant:</span>
        <span className="font-medium text-cyan-400 capitalize">{selectedColor || colors[0]?.name}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const colorNameLower = color.name.toLowerCase()
          const hexCode =
            color.code || COLOR_HEX_MAP[colorNameLower] || "#64748B"
          const isSelected =
            selectedColor?.toLowerCase() === colorNameLower ||
            (!selectedColor && color === colors[0])

          return (
            <button
              key={color.name}
              type="button"
              disabled={disabled}
              onClick={() => onSelectColor(color.name)}
              title={color.name}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all transform active:scale-95 ${
                isSelected
                  ? "border-cyan-400 ring-2 ring-cyan-500/30 scale-105"
                  : "border-slate-700 hover:border-slate-500"
              }`}
              style={{ backgroundColor: hexCode }}
            >
              {isSelected && (
                <Check
                  className={`w-3.5 h-3.5 ${
                    ["white", "silver", "starlight"].includes(colorNameLower)
                      ? "text-slate-900"
                      : "text-white"
                  }`}
                  strokeWidth={3}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
