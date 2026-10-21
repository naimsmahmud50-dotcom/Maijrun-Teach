import crypto from "crypto"
import { PCBuildSelection, SavedPCBuild } from "./types"
import { findComponentById } from "./catalog"
import { calculateBuildPrice, calculateEstimatedWattage } from "./compatibility"

/**
 * In-memory store for shared builds with unguessable UUIDs
 * In production, this connects to Redis or Postgres table.
 */
const buildsMap = new Map<string, SavedPCBuild>()

// Pre-seed a few showcase builds
const showcaseBuildId = "showcase-rtx4080-gaming"
buildsMap.set(showcaseBuildId, {
  id: showcaseBuildId,
  name: "MAIJRUN Elite Gaming & Creator PC (RTX 4080 Super)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  selection: {
    cpuId: "part-cpu-2", // i7-14700K
    motherboardId: "part-mobo-2", // ASUS Z790
    ramId: "part-ram-1", // Corsair 32GB DDR5
    gpuId: "part-gpu-3", // RTX 4080 Super
    psuId: "part-psu-4", // MSI 850W
    caseId: "part-case-3", // Montech 903
    coolerId: "part-cooler-2", // Deepcool LT720 360mm
    storageId: "part-storage-1", // Samsung 990 Pro 1TB
  },
  totalPriceBdt: 317500,
  estimatedWatts: 540,
})

export function saveBuild(
  name: string,
  selection: {
    cpuId?: string | null
    motherboardId?: string | null
    ramId?: string | null
    gpuId?: string | null
    psuId?: string | null
    caseId?: string | null
    storageId?: string | null
    coolerId?: string | null
  }
): SavedPCBuild {
  // Generate unguessable 16-character secure random ID
  const id = "mjb_" + crypto.randomBytes(8).toString("hex")

  const sanitizedName =
    name.trim().slice(0, 80).replace(/[<>"/\\&]/g, "") || "MAIJRUN Custom Build"

  // Recalculate true server price and watts
  const resolvedSelection: PCBuildSelection = {
    cpu: findComponentById(selection.cpuId) || null,
    motherboard: findComponentById(selection.motherboardId) || null,
    ram: findComponentById(selection.ramId) || null,
    gpu: findComponentById(selection.gpuId) || null,
    psu: findComponentById(selection.psuId) || null,
    case: findComponentById(selection.caseId) || null,
    storage: findComponentById(selection.storageId) || null,
    cooler: findComponentById(selection.coolerId) || null,
  }

  const totalPriceBdt = calculateBuildPrice(resolvedSelection)
  const estimatedWatts = calculateEstimatedWattage(resolvedSelection)

  const saved: SavedPCBuild = {
    id,
    name: sanitizedName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selection: {
      cpuId: selection.cpuId || undefined,
      motherboardId: selection.motherboardId || undefined,
      ramId: selection.ramId || undefined,
      gpuId: selection.gpuId || undefined,
      psuId: selection.psuId || undefined,
      caseId: selection.caseId || undefined,
      storageId: selection.storageId || undefined,
      coolerId: selection.coolerId || undefined,
    },
    totalPriceBdt,
    estimatedWatts,
  }

  buildsMap.set(id, saved)
  return saved
}

export function getBuildById(id: string): SavedPCBuild | undefined {
  return buildsMap.get(id)
}
