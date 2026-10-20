/**
 * Bangladesh Local E-Commerce Logic for MAIJRUN Tech
 * Handles phone validation, shipping rate calculation, district resolution, and BDT formatting.
 */

export interface PhoneValidationResult {
  isValid: boolean
  formatted: string
  normalized: string
  operator?: string
  error?: string
}

export interface ShippingRateResult {
  code: "inside-dhaka" | "outside-dhaka"
  name: string
  amount: number
  currencyCode: "bdt"
  timeframe: string
  description: string
}

/**
 * All 64 Districts of Bangladesh across 8 Divisions
 */
export const BANGLADESH_DISTRICTS = [
  // Dhaka Division
  { name: "Dhaka", division: "Dhaka", isInsideDhaka: true },
  { name: "Gazipur", division: "Dhaka", isInsideDhaka: false },
  { name: "Narayanganj", division: "Dhaka", isInsideDhaka: false },
  { name: "Tangail", division: "Dhaka", isInsideDhaka: false },
  { name: "Kishoreganj", division: "Dhaka", isInsideDhaka: false },
  { name: "Manikganj", division: "Dhaka", isInsideDhaka: false },
  { name: "Munshiganj", division: "Dhaka", isInsideDhaka: false },
  { name: "Narsingdi", division: "Dhaka", isInsideDhaka: false },
  { name: "Faridpur", division: "Dhaka", isInsideDhaka: false },
  { name: "Gopalganj", division: "Dhaka", isInsideDhaka: false },
  { name: "Madaripur", division: "Dhaka", isInsideDhaka: false },
  { name: "Rajbari", division: "Dhaka", isInsideDhaka: false },
  { name: "Shariatpur", division: "Dhaka", isInsideDhaka: false },

  // Chattogram Division
  { name: "Chattogram", division: "Chattogram", isInsideDhaka: false },
  { name: "Cox's Bazar", division: "Chattogram", isInsideDhaka: false },
  { name: "Cumilla", division: "Chattogram", isInsideDhaka: false },
  { name: "Feni", division: "Chattogram", isInsideDhaka: false },
  { name: "Brahmanbaria", division: "Chattogram", isInsideDhaka: false },
  { name: "Chandpur", division: "Chattogram", isInsideDhaka: false },
  { name: "Noakhali", division: "Chattogram", isInsideDhaka: false },
  { name: "Lakshmipur", division: "Chattogram", isInsideDhaka: false },
  { name: "Khagrachhari", division: "Chattogram", isInsideDhaka: false },
  { name: "Rangamati", division: "Chattogram", isInsideDhaka: false },
  { name: "Bandarban", division: "Chattogram", isInsideDhaka: false },

  // Sylhet Division
  { name: "Sylhet", division: "Sylhet", isInsideDhaka: false },
  { name: "Moulvibazar", division: "Sylhet", isInsideDhaka: false },
  { name: "Habiganj", division: "Sylhet", isInsideDhaka: false },
  { name: "Sunamganj", division: "Sylhet", isInsideDhaka: false },

  // Rajshahi Division
  { name: "Rajshahi", division: "Rajshahi", isInsideDhaka: false },
  { name: "Bogura", division: "Rajshahi", isInsideDhaka: false },
  { name: "Pabna", division: "Rajshahi", isInsideDhaka: false },
  { name: "Sirajganj", division: "Rajshahi", isInsideDhaka: false },
  { name: "Naogaon", division: "Rajshahi", isInsideDhaka: false },
  { name: "Natore", division: "Rajshahi", isInsideDhaka: false },
  { name: "Chapai Nawabganj", division: "Rajshahi", isInsideDhaka: false },
  { name: "Joypurhat", division: "Rajshahi", isInsideDhaka: false },

  // Khulna Division
  { name: "Khulna", division: "Khulna", isInsideDhaka: false },
  { name: "Jashore", division: "Khulna", isInsideDhaka: false },
  { name: "Kushtia", division: "Khulna", isInsideDhaka: false },
  { name: "Jhenaidah", division: "Khulna", isInsideDhaka: false },
  { name: "Satkhira", division: "Khulna", isInsideDhaka: false },
  { name: "Bagerhat", division: "Khulna", isInsideDhaka: false },
  { name: "Chuadanga", division: "Khulna", isInsideDhaka: false },
  { name: "Meherpur", division: "Khulna", isInsideDhaka: false },
  { name: "Narail", division: "Khulna", isInsideDhaka: false },
  { name: "Magura", division: "Khulna", isInsideDhaka: false },

  // Barishal Division
  { name: "Barishal", division: "Barishal", isInsideDhaka: false },
  { name: "Patuakhali", division: "Barishal", isInsideDhaka: false },
  { name: "Bhola", division: "Barishal", isInsideDhaka: false },
  { name: "Pirojpur", division: "Barishal", isInsideDhaka: false },
  { name: "Barguna", division: "Barishal", isInsideDhaka: false },
  { name: "Jhalokati", division: "Barishal", isInsideDhaka: false },

  // Rangpur Division
  { name: "Rangpur", division: "Rangpur", isInsideDhaka: false },
  { name: "Dinajpur", division: "Rangpur", isInsideDhaka: false },
  { name: "Gaibandha", division: "Rangpur", isInsideDhaka: false },
  { name: "Kurigram", division: "Rangpur", isInsideDhaka: false },
  { name: "Lalmonirhat", division: "Rangpur", isInsideDhaka: false },
  { name: "Nilphamari", division: "Rangpur", isInsideDhaka: false },
  { name: "Panchagarh", division: "Rangpur", isInsideDhaka: false },
  { name: "Thakurgaon", division: "Rangpur", isInsideDhaka: false },

  // Mymensingh Division
  { name: "Mymensingh", division: "Mymensingh", isInsideDhaka: false },
  { name: "Jamalpur", division: "Mymensingh", isInsideDhaka: false },
  { name: "Netrokona", division: "Mymensingh", isInsideDhaka: false },
  { name: "Sherpur", division: "Mymensingh", isInsideDhaka: false },
]

/**
 * Mobile operator prefixes in Bangladesh
 */
const OPERATOR_PREFIX_MAP: Record<string, string> = {
  "017": "Grameenphone",
  "013": "Grameenphone (Skitto)",
  "018": "Robi",
  "016": "Airtel",
  "019": "Banglalink",
  "014": "Banglalink",
  "015": "Teletalk",
}

/**
 * Validates Bangladeshi mobile phone numbers:
 * Accepts: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX (with spaces, hyphens, parentheses).
 * Must be 11 digits starting with 013-019.
 */
export function validateBDPhoneNumber(phone: string | null | undefined): PhoneValidationResult {
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return {
      isValid: false,
      formatted: "",
      normalized: "",
      error: "Phone number is required for order delivery and COD confirmation.",
    }
  }

  // Strip all non-digit characters except leading plus
  let sanitized = phone.replace(/[^\d+]/g, "")

  // Remove leading +88 or 88
  if (sanitized.startsWith("+880")) {
    sanitized = sanitized.slice(3)
  } else if (sanitized.startsWith("880")) {
    sanitized = sanitized.slice(2)
  }

  // Ensure digits only now
  sanitized = sanitized.replace(/\D/g, "")

  // Must be exactly 11 digits starting with 01[3-9]
  const bdMobileRegex = /^01[3-9]\d{8}$/

  if (!bdMobileRegex.test(sanitized)) {
    return {
      isValid: false,
      formatted: phone.trim(),
      normalized: sanitized,
      error: "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678 or +8801712345678).",
    }
  }

  const prefix = sanitized.slice(0, 3)
  const operator = OPERATOR_PREFIX_MAP[prefix] || "Bangladesh Mobile"

  return {
    isValid: true,
    formatted: `+88${sanitized}`,
    normalized: sanitized,
    operator,
  }
}

/**
 * Determines whether an address or district is inside Dhaka delivery zone.
 */
export function isInsideDhaka(districtOrCity: string | null | undefined): boolean {
  if (!districtOrCity) return false
  const normalized = districtOrCity.trim().toLowerCase()

  // Specific check: if it says "dhaka", check if it refers to Dhaka metro / city
  if (normalized.includes("dhaka")) {
    return true
  }

  // Matches common Dhaka metropolitan areas
  const dhakaAreas = [
    "gulshan",
    "banani",
    "dhanmondi",
    "uttara",
    "mirpur",
    "motijheel",
    "mohammadpur",
    "bashundhara",
    "badda",
    "mohakhali",
    "khilgaon",
    "malibagh",
    "rampura",
    "baridhara",
    "shyamoli",
    "lalmatia",
  ]

  return dhakaAreas.some((area) => normalized.includes(area))
}

/**
 * Calculates shipping rate and timeframe based on district/city.
 * Inside Dhaka: ৳80 flat rate (24-48 hours)
 * Outside Dhaka: ৳150 flat rate (2-4 days)
 */
export function getBangladeshShippingRate(
  districtOrCity: string | null | undefined
): ShippingRateResult {
  const inside = isInsideDhaka(districtOrCity)

  if (inside) {
    return {
      code: "inside-dhaka",
      name: "Inside Dhaka Delivery",
      amount: 80,
      currencyCode: "bdt",
      timeframe: "24–48 Hours",
      description: "Express doorstep delivery within Dhaka city with cash on delivery",
    }
  }

  return {
    code: "outside-dhaka",
    name: "Outside Dhaka Courier",
    amount: 150,
    currencyCode: "bdt",
    timeframe: "2–4 Days",
    description: "Reliable courier delivery across all 64 districts with cash on delivery",
  }
}

/**
 * Formats amount into clean Bangladeshi Taka currency format (৳)
 */
export function formatBDT(amount: number, includeDecimals = false): string {
  const num = typeof amount === "number" && !isNaN(amount) ? amount : 0
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  })
  return `৳${formatted}`
}
