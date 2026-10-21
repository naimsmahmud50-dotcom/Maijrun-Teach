import { describe, it } from "node:test"
import assert from "node:assert"
import {
  calculateEstimatedWattage,
  calculateRecommendedPsuWattage,
  calculateBuildPrice,
  validatePCBuild,
  checkItemCompatibilityWithSelection,
} from "../pc-builder/compatibility"
import { PCComponentItem, PCBuildSelection } from "../pc-builder/types"

// Sample Mock Hardware
const intelCpu14700K: PCComponentItem = {
  id: "cpu-14700k",
  title: "Intel Core i7-14700K",
  handle: "intel-core-i7-14700k",
  category: "cpu",
  brand: "Intel",
  thumbnail: "/images/cpu.jpg",
  price: 49500,
  inventoryQuantity: 10,
  inStock: true,
  specs: {
    brand: "Intel",
    model: "i7-14700K",
    socket: "LGA1700",
    tdpWatts: 125,
    coreCount: 20,
  },
}

const amdCpu7800X3D: PCComponentItem = {
  id: "cpu-7800x3d",
  title: "AMD Ryzen 7 7800X3D",
  handle: "amd-ryzen-7-7800x3d",
  category: "cpu",
  brand: "AMD",
  thumbnail: "/images/cpu.jpg",
  price: 52000,
  inventoryQuantity: 6,
  inStock: true,
  specs: {
    brand: "AMD",
    model: "7800X3D",
    socket: "AM5",
    tdpWatts: 120,
    coreCount: 8,
  },
}

const intelZ790Mobo: PCComponentItem = {
  id: "mobo-z790",
  title: "ASUS TUF Gaming Z790-PLUS WiFi",
  handle: "asus-tuf-z790",
  category: "motherboard",
  brand: "ASUS",
  thumbnail: "/images/mobo.jpg",
  price: 33000,
  inventoryQuantity: 8,
  inStock: true,
  specs: {
    brand: "ASUS",
    model: "Z790-PLUS",
    motherboardSocket: "LGA1700",
    supportedRamType: "DDR5",
    maxRamSpeedMhz: 7200,
    formFactor: "ATX",
  },
}

const amdB650Mobo: PCComponentItem = {
  id: "mobo-b650",
  title: "MSI MAG B650 TOMAHAWK WIFI",
  handle: "msi-mag-b650",
  category: "motherboard",
  brand: "MSI",
  thumbnail: "/images/mobo.jpg",
  price: 28500,
  inventoryQuantity: 5,
  inStock: true,
  specs: {
    brand: "MSI",
    model: "B650 Tomahawk",
    motherboardSocket: "AM5",
    supportedRamType: "DDR5",
    maxRamSpeedMhz: 6600,
    formFactor: "ATX",
  },
}

const miniItxMobo: PCComponentItem = {
  id: "mobo-itx",
  title: "ASUS ROG STRIX B650E-I Gaming WiFi",
  handle: "asus-rog-b650e-i",
  category: "motherboard",
  brand: "ASUS",
  thumbnail: "/images/mobo.jpg",
  price: 36000,
  inventoryQuantity: 4,
  inStock: true,
  specs: {
    brand: "ASUS",
    model: "B650E-I",
    motherboardSocket: "AM5",
    supportedRamType: "DDR5",
    maxRamSpeedMhz: 6400,
    formFactor: "Mini-ITX",
  },
}

const ddr5RamKit: PCComponentItem = {
  id: "ram-ddr5-32gb",
  title: "Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz",
  handle: "corsair-ddr5-32gb",
  category: "ram",
  brand: "Corsair",
  thumbnail: "/images/ram.jpg",
  price: 13500,
  inventoryQuantity: 12,
  inStock: true,
  specs: {
    brand: "Corsair",
    model: "Vengeance",
    ramType: "DDR5",
    speedMhz: 6000,
    capacityGb: 32,
    stickCount: 2,
  },
}

const ddr4RamKit: PCComponentItem = {
  id: "ram-ddr4-16gb",
  title: "Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz",
  handle: "kingston-ddr4-16gb",
  category: "ram",
  brand: "Kingston",
  thumbnail: "/images/ram.jpg",
  price: 5200,
  inventoryQuantity: 15,
  inStock: true,
  specs: {
    brand: "Kingston",
    model: "FURY Beast",
    ramType: "DDR4",
    speedMhz: 3200,
    capacityGb: 16,
    stickCount: 2,
  },
}

const rtx4080Gpu: PCComponentItem = {
  id: "gpu-rtx4080",
  title: "MSI GeForce RTX 4080 SUPER 16GB Gaming X Slim",
  handle: "msi-rtx-4080-super",
  category: "gpu",
  brand: "MSI",
  thumbnail: "/images/gpu.jpg",
  price: 145000,
  inventoryQuantity: 3,
  inStock: true,
  specs: {
    brand: "MSI",
    model: "RTX 4080 SUPER",
    gpuChipset: "RTX 4080 Super",
    lengthMm: 322,
    gpuTdpWatts: 320,
    powerConnectors: "1x 16-pin 12VHPWR",
  },
}

const rtx4060Gpu: PCComponentItem = {
  id: "gpu-rtx4060",
  title: "ZOTAC GAMING GeForce RTX 4060 8GB Twin Edge",
  handle: "zotac-rtx-4060",
  category: "gpu",
  brand: "ZOTAC",
  thumbnail: "/images/gpu.jpg",
  price: 37500,
  inventoryQuantity: 10,
  inStock: true,
  specs: {
    brand: "ZOTAC",
    model: "RTX 4060 Twin Edge",
    gpuChipset: "RTX 4060",
    lengthMm: 221,
    gpuTdpWatts: 115,
    powerConnectors: "1x 8-pin",
  },
}

const psu850w: PCComponentItem = {
  id: "psu-850w",
  title: "Corsair RM850e 850W 80 Plus Gold Fully Modular",
  handle: "corsair-rm850e",
  category: "psu",
  brand: "Corsair",
  thumbnail: "/images/psu.jpg",
  price: 14000,
  inventoryQuantity: 7,
  inStock: true,
  specs: {
    brand: "Corsair",
    model: "RM850e",
    wattage: 850,
    efficiencyRating: "80+ Gold",
    has12Vhpwr: true,
  },
}

const psu450w: PCComponentItem = {
  id: "psu-450w",
  title: "Antec Atom V450 450W Power Supply",
  handle: "antec-atom-450w",
  category: "psu",
  brand: "Antec",
  thumbnail: "/images/psu.jpg",
  price: 3500,
  inventoryQuantity: 9,
  inStock: true,
  specs: {
    brand: "Antec",
    model: "V450",
    wattage: 450,
  },
}

const atxMidTowerCase: PCComponentItem = {
  id: "case-nzxt-h5",
  title: "NZXT H5 Flow Compact ATX Mid-Tower Case",
  handle: "nzxt-h5-flow",
  category: "case",
  brand: "NZXT",
  thumbnail: "/images/case.jpg",
  price: 9500,
  inventoryQuantity: 5,
  inStock: true,
  specs: {
    brand: "NZXT",
    model: "H5 Flow",
    supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
    maxGpuLengthMm: 365,
    maxCoolerHeightMm: 165,
    supportedRadiatorSizesMm: [240, 280],
  },
}

const miniItxCase: PCComponentItem = {
  id: "case-nr200p",
  title: "Cooler Master MasterBox NR200P Mini-ITX Case",
  handle: "cooler-master-nr200p",
  category: "case",
  brand: "Cooler Master",
  thumbnail: "/images/case.jpg",
  price: 10500,
  inventoryQuantity: 3,
  inStock: true,
  specs: {
    brand: "Cooler Master",
    model: "NR200P",
    supportedFormFactors: ["Mini-ITX"],
    maxGpuLengthMm: 330,
    maxCoolerHeightMm: 155,
    supportedRadiatorSizesMm: [240],
  },
}

const peerlessAssassinCooler: PCComponentItem = {
  id: "cooler-pa120",
  title: "Thermalright Peerless Assassin 120 SE Air Cooler",
  handle: "thermalright-peerless-assassin-120",
  category: "cooler",
  brand: "Thermalright",
  thumbnail: "/images/cooler.jpg",
  price: 4500,
  inventoryQuantity: 11,
  inStock: true,
  specs: {
    brand: "Thermalright",
    model: "PA 120 SE",
    coolerType: "Air",
    coolerHeightMm: 155,
    supportedSockets: ["LGA1700", "AM5", "AM4"],
  },
}

describe("PC Builder Compatibility Engine Tests", () => {
  it("passes validation for a fully compatible Intel high-end build", () => {
    const build: PCBuildSelection = {
      cpu: intelCpu14700K,
      motherboard: intelZ790Mobo,
      ram: ddr5RamKit,
      gpu: rtx4080Gpu,
      psu: psu850w,
      case: atxMidTowerCase,
      cooler: peerlessAssassinCooler,
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, true, "Build should be fully valid")
    assert.strictEqual(result.completedCoreSlotsCount, 6)
    assert.strictEqual(result.issues.filter((i) => i.severity === "error").length, 0)
    assert.ok(result.totalPriceBdt > 250000)
    assert.ok(result.estimatedTdpWatts > 450)
  })

  it("detects CPU vs Motherboard socket mismatch (Intel LGA1700 on AMD AM5)", () => {
    const build: PCBuildSelection = {
      cpu: intelCpu14700K, // LGA1700
      motherboard: amdB650Mobo, // AM5
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const socketError = result.issues.find((i) => i.id === "cpu-mobo-socket-mismatch")
    assert.ok(socketError, "Must flag socket mismatch error")
    assert.strictEqual(socketError.severity, "error")
    assert.match(socketError.message, /LGA1700/i)
    assert.match(socketError.message, /AM5/i)
  })

  it("detects RAM type mismatch (DDR4 on DDR5 Motherboard)", () => {
    const build: PCBuildSelection = {
      motherboard: intelZ790Mobo, // DDR5
      ram: ddr4RamKit, // DDR4
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const ramError = result.issues.find((i) => i.id === "mobo-ram-type-mismatch")
    assert.ok(ramError, "Must flag RAM generation error")
    assert.strictEqual(ramError.severity, "error")
  })

  it("detects Motherboard form factor mismatch with Case (ATX in Mini-ITX case)", () => {
    const build: PCBuildSelection = {
      motherboard: intelZ790Mobo, // ATX
      case: miniItxCase, // Only Mini-ITX
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const caseError = result.issues.find((i) => i.id === "mobo-case-formfactor-mismatch")
    assert.ok(caseError, "Must flag form factor incompatibility")
    assert.strictEqual(caseError.severity, "error")
  })

  it("permits Mini-ITX motherboard in ATX case and in Mini-ITX case", () => {
    const buildInAtx: PCBuildSelection = {
      motherboard: miniItxMobo,
      case: atxMidTowerCase, // supports ATX, Micro-ATX, Mini-ITX
    }
    assert.strictEqual(validatePCBuild(buildInAtx).isValid, true)

    const buildInItx: PCBuildSelection = {
      motherboard: miniItxMobo,
      case: miniItxCase,
    }
    assert.strictEqual(validatePCBuild(buildInItx).isValid, true)
  })

  it("detects GPU length exceeding case clearance", () => {
    const hugeGpu: PCComponentItem = {
      ...rtx4080Gpu,
      specs: { ...rtx4080Gpu.specs, lengthMm: 380 },
    }

    const build: PCBuildSelection = {
      gpu: hugeGpu, // 380mm
      case: atxMidTowerCase, // max 365mm
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const gpuError = result.issues.find((i) => i.id === "gpu-case-length-exceeded")
    assert.ok(gpuError)
    assert.match(gpuError.message, /380mm/i)
  })

  it("detects insufficient PSU wattage for high-power CPU and GPU", () => {
    const build: PCBuildSelection = {
      cpu: intelCpu14700K, // 125W
      gpu: rtx4080Gpu, // 320W
      psu: psu450w, // 450W total
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const psuError = result.issues.find((i) => i.id === "psu-wattage-insufficient")
    assert.ok(psuError, "Must flag insufficient wattage")
    assert.strictEqual(psuError.severity, "error")
  })

  it("warns about low PSU headroom (+20% safety target)", () => {
    const psu600w: PCComponentItem = {
      ...psu850w,
      id: "psu-600w",
      specs: { ...psu850w.specs, wattage: 600 },
    }

    const build: PCBuildSelection = {
      cpu: intelCpu14700K, // 125W
      gpu: rtx4080Gpu, // 320W
      psu: psu600w, // 600W (draw ~510W, +20% target ~650W)
    }

    const result = validatePCBuild(build)
    const warning = result.issues.find((i) => i.id === "psu-wattage-low-headroom")
    assert.ok(warning, "Should flag low power headroom warning")
    assert.strictEqual(warning.severity, "warning")
  })

  it("detects Cooler socket incompatibility", () => {
    const lga1200OnlyCooler: PCComponentItem = {
      ...peerlessAssassinCooler,
      specs: {
        ...peerlessAssassinCooler.specs,
        supportedSockets: ["LGA1200", "LGA1151"],
      },
    }

    const build: PCBuildSelection = {
      cpu: amdCpu7800X3D, // AM5
      cooler: lga1200OnlyCooler,
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const coolerError = result.issues.find((i) => i.id === "cooler-cpu-socket-mismatch")
    assert.ok(coolerError)
  })

  it("detects Air cooler height exceeding case clearance", () => {
    const tallCooler: PCComponentItem = {
      ...peerlessAssassinCooler,
      specs: {
        ...peerlessAssassinCooler.specs,
        coolerType: "Air",
        coolerHeightMm: 170, // 170mm
      },
    }

    const build: PCBuildSelection = {
      cooler: tallCooler,
      case: miniItxCase, // max 155mm
    }

    const result = validatePCBuild(build)
    assert.strictEqual(result.isValid, false)
    const heightError = result.issues.find((i) => i.id === "cooler-height-exceeded")
    assert.ok(heightError)
  })

  it("calculates accurate total BDT price", () => {
    const build: PCBuildSelection = {
      cpu: intelCpu14700K, // 49500
      motherboard: intelZ790Mobo, // 33000
      ram: ddr5RamKit, // 13500
      gpu: rtx4060Gpu, // 37500
      psu: psu850w, // 14000
      case: atxMidTowerCase, // 9500
    }

    const totalPrice = calculateBuildPrice(build)
    assert.strictEqual(totalPrice, 49500 + 33000 + 13500 + 37500 + 14000 + 9500)
    assert.strictEqual(totalPrice, 157000)
  })

  it("evaluates candidate item compatibility dynamically with current selection", () => {
    const currentSelection: PCBuildSelection = {
      cpu: amdCpu7800X3D, // AM5
    }

    // Checking Intel Motherboard
    const checkIntel = checkItemCompatibilityWithSelection(intelZ790Mobo, currentSelection)
    assert.strictEqual(checkIntel.isCompatible, false)
    assert.ok(checkIntel.reason?.includes("LGA1700") || checkIntel.reason?.includes("AM5"))

    // Checking AMD Motherboard
    const checkAmd = checkItemCompatibilityWithSelection(amdB650Mobo, currentSelection)
    assert.strictEqual(checkAmd.isCompatible, true)
  })
})
