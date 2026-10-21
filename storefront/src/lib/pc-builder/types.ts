import { z } from "zod"

export type ComponentCategory =
  | "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "psu"
  | "case"
  | "storage"
  | "cooler"

export type SocketType = "LGA1700" | "LGA1851" | "AM5" | "AM4"
export type RamType = "DDR4" | "DDR5"
export type FormFactor = "E-ATX" | "ATX" | "Micro-ATX" | "Mini-ITX"
export type CoolerType = "Air" | "AIO 240mm" | "AIO 360mm"

/**
 * Technical compatibility specs for PC components
 */
export interface ComponentSpecs {
  // Common
  brand: string
  model: string
  warrantyYears?: number

  // CPU
  socket?: SocketType | string
  tdpWatts?: number
  coreCount?: number
  threadsCount?: number
  baseClockGhz?: number
  boostClockGhz?: number
  integratedGpu?: boolean

  // Motherboard
  motherboardSocket?: SocketType | string
  supportedRamType?: RamType | string
  ramSlots?: number
  maxRamCapacityGb?: number
  maxRamSpeedMhz?: number
  formFactor?: FormFactor | string
  m2Slots?: number
  pcieSlots?: number

  // RAM
  ramType?: RamType | string
  capacityGb?: number // Total capacity e.g. 16 or 32
  stickCount?: number // e.g. 2 for 2x16GB
  speedMhz?: number // e.g. 6000

  // GPU
  gpuChipset?: string
  vramGb?: number
  lengthMm?: number
  gpuTdpWatts?: number
  recommendedPsuWatts?: number
  powerConnectors?: string // e.g. "1x 16-pin 12VHPWR" or "2x 8-pin"

  // Power Supply (PSU)
  wattage?: number
  efficiencyRating?: string // "80+ Bronze", "80+ Gold", "80+ Platinum"
  modular?: "Full" | "Semi" | "Non"
  pcieConnectorsCount?: number
  has12Vhpwr?: boolean

  // Case
  supportedFormFactors?: (FormFactor | string)[]
  maxGpuLengthMm?: number
  maxCoolerHeightMm?: number
  maxPsuLengthMm?: number
  supportedRadiatorSizesMm?: number[] // e.g. [240, 360]

  // Cooler
  supportedSockets?: (SocketType | string)[]
  coolerHeightMm?: number
  coolerType?: CoolerType | string
  maxCoolingTdpWatts?: number

  // Storage
  storageType?: "M.2 NVMe SSD" | "SATA 2.5 SSD" | "3.5 HDD"
  storageCapacityGb?: number
  readSpeedMbps?: number
}

export interface PCComponentItem {
  id: string
  title: string
  handle: string
  category: ComponentCategory
  brand: string
  thumbnail: string
  price: number // in BDT
  originalPrice?: number
  inventoryQuantity: number
  inStock: boolean
  specs: ComponentSpecs
}

export interface PCBuildSelection {
  cpu?: PCComponentItem | null
  motherboard?: PCComponentItem | null
  ram?: PCComponentItem | null
  gpu?: PCComponentItem | null
  psu?: PCComponentItem | null
  case?: PCComponentItem | null
  storage?: PCComponentItem | null
  cooler?: PCComponentItem | null
}

export type CompatibilitySeverity = "error" | "warning" | "info"

export interface CompatibilityIssue {
  id: string
  severity: CompatibilitySeverity
  category: ComponentCategory
  relatedCategory?: ComponentCategory
  title: string
  message: string
}

export interface BuildValidationResult {
  isValid: boolean
  hasWarnings: boolean
  issues: CompatibilityIssue[]
  estimatedTdpWatts: number
  recommendedMinPsuWatts: number
  totalPriceBdt: number
  completedCoreSlotsCount: number
  totalCoreSlotsCount: number
}

export interface SavedPCBuild {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  selection: {
    cpuId?: string
    motherboardId?: string
    ramId?: string
    gpuId?: string
    psuId?: string
    caseId?: string
    storageId?: string
    coolerId?: string
  }
  totalPriceBdt: number
  estimatedWatts: number
}
