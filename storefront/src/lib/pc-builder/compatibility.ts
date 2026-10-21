import {
  ComponentCategory,
  PCBuildSelection,
  PCComponentItem,
  CompatibilityIssue,
  BuildValidationResult,
} from "./types"

/**
 * Base motherboard, fans, storage and memory draw in Watts
 */
const BASE_SYSTEM_DRAW_WATTS = 65

/**
 * Calculates estimated wattage of current build selection
 */
export function calculateEstimatedWattage(selection: PCBuildSelection): number {
  let watts = BASE_SYSTEM_DRAW_WATTS

  if (selection.cpu?.specs.tdpWatts) {
    watts += selection.cpu.specs.tdpWatts
  }

  if (selection.gpu?.specs.gpuTdpWatts) {
    watts += selection.gpu.specs.gpuTdpWatts
  }

  if (selection.cooler) {
    const isAio = selection.cooler.specs.coolerType?.toLowerCase().includes("aio")
    watts += isAio ? 25 : 10
  }

  if (selection.ram?.specs.capacityGb) {
    watts += (selection.ram.specs.stickCount || 2) * 5
  }

  return watts
}

/**
 * Calculates recommended minimum PSU wattage with 20% safety headroom
 */
export function calculateRecommendedPsuWattage(estimatedWatts: number): number {
  const withHeadroom = estimatedWatts * 1.2
  // Round up to nearest 50W (e.g. 520W -> 550W)
  return Math.ceil(withHeadroom / 50) * 50
}

/**
 * Calculates total BDT price of selected components
 */
export function calculateBuildPrice(selection: PCBuildSelection): number {
  let total = 0
  const slots: (keyof PCBuildSelection)[] = [
    "cpu",
    "motherboard",
    "ram",
    "gpu",
    "psu",
    "case",
    "storage",
    "cooler",
  ]

  for (const slot of slots) {
    const item = selection[slot]
    if (item && typeof item.price === "number") {
      total += item.price
    }
  }

  return total
}

/**
 * Comprehensive compatibility validator for PC Build selection
 */
export function validatePCBuild(selection: PCBuildSelection): BuildValidationResult {
  const issues: CompatibilityIssue[] = []
  const { cpu, motherboard, ram, gpu, psu, case: pcCase, cooler } = selection

  // 1. CPU <-> Motherboard Socket Check
  if (cpu && motherboard) {
    const cpuSocket = cpu.specs.socket?.trim().toUpperCase()
    const moboSocket = motherboard.specs.motherboardSocket?.trim().toUpperCase()

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        id: "cpu-mobo-socket-mismatch",
        severity: "error",
        category: "motherboard",
        relatedCategory: "cpu",
        title: "Incompatible Socket",
        message: `CPU requires ${cpuSocket} socket, but ${motherboard.title} has a ${moboSocket} socket.`,
      })
    }
  }

  // 2. Motherboard <-> RAM Type & Speed Check
  if (motherboard && ram) {
    const moboRamType = motherboard.specs.supportedRamType?.trim().toUpperCase()
    const ramType = ram.specs.ramType?.trim().toUpperCase()

    if (moboRamType && ramType && moboRamType !== ramType) {
      issues.push({
        id: "mobo-ram-type-mismatch",
        severity: "error",
        category: "ram",
        relatedCategory: "motherboard",
        title: "Incompatible RAM Generation",
        message: `Motherboard supports ${moboRamType} memory, but selected RAM is ${ramType}.`,
      })
    } else if (
      motherboard.specs.maxRamSpeedMhz &&
      ram.specs.speedMhz &&
      ram.specs.speedMhz > motherboard.specs.maxRamSpeedMhz
    ) {
      issues.push({
        id: "ram-speed-downclock-warning",
        severity: "warning",
        category: "ram",
        relatedCategory: "motherboard",
        title: "RAM Speed Downclocking",
        message: `RAM rated at ${ram.specs.speedMhz}MHz will downclock to motherboard maximum of ${motherboard.specs.maxRamSpeedMhz}MHz.`,
      })
    }
  }

  // 3. Motherboard <-> Case Form Factor Check
  if (motherboard && pcCase) {
    const moboForm = motherboard.specs.formFactor
    const supportedForms = pcCase.specs.supportedFormFactors || []

    if (moboForm && supportedForms.length > 0) {
      const isSupported = supportedForms.some(
        (sf) => sf.trim().toUpperCase() === moboForm.trim().toUpperCase()
      )

      if (!isSupported) {
        issues.push({
          id: "mobo-case-formfactor-mismatch",
          severity: "error",
          category: "case",
          relatedCategory: "motherboard",
          title: "Form Factor Incompatible",
          message: `${motherboard.title} is a ${moboForm} board, which is too large for ${pcCase.title}.`,
        })
      }
    }
  }

  // 4. GPU <-> Case Physical Length Check
  if (gpu && pcCase) {
    const gpuLength = gpu.specs.lengthMm
    const maxCaseLength = pcCase.specs.maxGpuLengthMm

    if (gpuLength && maxCaseLength) {
      if (gpuLength > maxCaseLength) {
        issues.push({
          id: "gpu-case-length-exceeded",
          severity: "error",
          category: "gpu",
          relatedCategory: "case",
          title: "GPU Too Long for Case",
          message: `GPU length (${gpuLength}mm) exceeds case maximum clearance (${maxCaseLength}mm).`,
        })
      } else if (maxCaseLength - gpuLength < 15) {
        issues.push({
          id: "gpu-case-tight-clearance",
          severity: "warning",
          category: "gpu",
          relatedCategory: "case",
          title: "Tight GPU Clearance",
          message: `Only ${maxCaseLength - gpuLength}mm clearance remaining between GPU and front intake/radiator.`,
        })
      }
    }
  }

  // 5. Total Estimated Power Draw <-> PSU Wattage & Connectors
  const estimatedTdpWatts = calculateEstimatedWattage(selection)
  const recommendedMinPsuWatts = calculateRecommendedPsuWattage(estimatedTdpWatts)

  if (psu) {
    const psuWattage = psu.specs.wattage || 0

    if (psuWattage < estimatedTdpWatts) {
      issues.push({
        id: "psu-wattage-insufficient",
        severity: "error",
        category: "psu",
        title: "Insufficient Power Supply",
        message: `Estimated draw is ${estimatedTdpWatts}W, but PSU is rated for only ${psuWattage}W. System will shut down under load.`,
      })
    } else if (psuWattage < recommendedMinPsuWatts) {
      issues.push({
        id: "psu-wattage-low-headroom",
        severity: "warning",
        category: "psu",
        title: "Low Power Headroom",
        message: `Selected PSU (${psuWattage}W) provides less than the recommended ${recommendedMinPsuWatts}W (+20% transient spike headroom).`,
      })
    }

    // High-end GPU 12VHPWR check
    if (
      gpu?.specs.powerConnectors?.includes("12VHPWR") &&
      !psu.specs.has12Vhpwr &&
      psuWattage < 850
    ) {
      issues.push({
        id: "gpu-psu-12vhpwr-notice",
        severity: "warning",
        category: "psu",
        relatedCategory: "gpu",
        title: "PCIe 5.0 12VHPWR Adapter Required",
        message: `${gpu.title} uses high-power 12VHPWR connector. Ensure adapter cable is connected securely.`,
      })
    }
  }

  // 6. CPU Cooler <-> Socket & Case Clearance Check
  if (cooler) {
    // Socket check with CPU
    if (cpu) {
      const cpuSocket = cpu.specs.socket?.trim().toUpperCase()
      const supportedSockets = (cooler.specs.supportedSockets || []).map((s) =>
        s.trim().toUpperCase()
      )

      if (cpuSocket && supportedSockets.length > 0 && !supportedSockets.includes(cpuSocket)) {
        issues.push({
          id: "cooler-cpu-socket-mismatch",
          severity: "error",
          category: "cooler",
          relatedCategory: "cpu",
          title: "Incompatible Cooler Bracket",
          message: `${cooler.title} does not include brackets for ${cpuSocket} socket.`,
        })
      }
    }

    // Height check with Case (Air cooler)
    if (pcCase && cooler.specs.coolerType === "Air") {
      const coolerHeight = cooler.specs.coolerHeightMm
      const maxCoolerHeight = pcCase.specs.maxCoolerHeightMm

      if (coolerHeight && maxCoolerHeight && coolerHeight > maxCoolerHeight) {
        issues.push({
          id: "cooler-height-exceeded",
          severity: "error",
          category: "cooler",
          relatedCategory: "case",
          title: "Cooler Exceeds Case Width",
          message: `Air cooler height (${coolerHeight}mm) exceeds case clearance (${maxCoolerHeight}mm). Side panel cannot close.`,
        })
      }
    }

    // Radiator size check with Case (AIO liquid cooler)
    if (pcCase && cooler.specs.coolerType?.includes("AIO")) {
      const radiatorMatch = cooler.specs.coolerType.match(/(\d+)mm/)
      const radiatorSize = radiatorMatch ? parseInt(radiatorMatch[1], 10) : 0
      const supportedRadiators = pcCase.specs.supportedRadiatorSizesMm || []

      if (radiatorSize > 0 && supportedRadiators.length > 0 && !supportedRadiators.includes(radiatorSize)) {
        issues.push({
          id: "cooler-radiator-unsupported",
          severity: "error",
          category: "cooler",
          relatedCategory: "case",
          title: "Unsupported Liquid Cooler Size",
          message: `${pcCase.title} does not have mounting space for a ${radiatorSize}mm radiator.`,
        })
      }
    }
  }

  const coreSlots: (keyof PCBuildSelection)[] = ["cpu", "motherboard", "ram", "gpu", "psu", "case"]
  const completedCoreCount = coreSlots.filter((slot) => Boolean(selection[slot])).length

  const hasErrors = issues.some((i) => i.severity === "error")
  const hasWarnings = issues.some((i) => i.severity === "warning")

  return {
    isValid: !hasErrors,
    hasWarnings,
    issues,
    estimatedTdpWatts,
    recommendedMinPsuWatts,
    totalPriceBdt: calculateBuildPrice(selection),
    completedCoreSlotsCount: completedCoreCount,
    totalCoreSlotsCount: coreSlots.length,
  }
}

/**
 * Checks whether a candidate item is compatible with currently selected parts
 * Used for instant filter/badge tagging in the selector modal
 */
export function checkItemCompatibilityWithSelection(
  candidate: PCComponentItem,
  currentSelection: PCBuildSelection
): { isCompatible: boolean; reason?: string } {
  // Test by tentatively injecting candidate into selection
  const tempSelection: PCBuildSelection = {
    ...currentSelection,
    [candidate.category]: candidate,
  }

  const result = validatePCBuild(tempSelection)
  const candidateError = result.issues.find(
    (i) => i.severity === "error" && (i.category === candidate.category || i.relatedCategory === candidate.category)
  )

  if (candidateError) {
    return {
      isCompatible: false,
      reason: candidateError.message,
    }
  }

  return { isCompatible: true }
}
