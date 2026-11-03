/**
 * Bangladesh Hyperlocal Geographic Hierarchy for MAIJRUN Tech
 * Provides 64 Districts with complete Thanas/Upazilas cascade and shipping tiers.
 */

export interface ThanaOption {
  id: string
  name: string
}

export interface DistrictGeo {
  name: string
  division: string
  zone: "inside_dhaka" | "dhaka_suburb" | "outside_dhaka"
  deliveryFee: number
  deliveryTime: string
  thanas: string[]
}

export const BD_DISTRICTS_DATA: Record<string, DistrictGeo> = {
  Dhaka: {
    name: "Dhaka",
    division: "Dhaka",
    zone: "inside_dhaka",
    deliveryFee: 80,
    deliveryTime: "24-48 Hours",
    thanas: [
      "Dhanmondi",
      "Gulshan",
      "Banani",
      "Uttara",
      "Mirpur",
      "Mohammadpur",
      "Motijheel",
      "New Market",
      "Tejgaon",
      "Badda",
      "Khilgaon",
      "Rampura",
      "Bashundhara R/A",
      "Baridhara",
      "Lalbagh",
      "Paltan",
      "Jatrabari",
      "Shyamoli",
      "Khilkhet",
      "Cantonment",
      "Shahbagh",
      "Wari",
      "Savar",
      "Dhamrai",
      "Keraniganj",
    ],
  },
  Gazipur: {
    name: "Gazipur",
    division: "Dhaka",
    zone: "dhaka_suburb",
    deliveryFee: 100,
    deliveryTime: "24-72 Hours",
    thanas: ["Gazipur Sadar", "Tongi", "Kaliakair", "Sreepur", "Kapasia", "Kaliganj"],
  },
  Narayanganj: {
    name: "Narayanganj",
    division: "Dhaka",
    zone: "dhaka_suburb",
    deliveryFee: 100,
    deliveryTime: "24-72 Hours",
    thanas: ["Narayanganj Sadar", "Fatullah", "Siddhirganj", "Bandar", "Rupganj", "Sonargaon", "Araihazar"],
  },
  Chattogram: {
    name: "Chattogram",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: [
      "Kotwali",
      "Panchlaish",
      "Pahartali",
      "Halishahar",
      "Double Mooring",
      "Khulshi",
      "Agrabad",
      "Bakolia",
      "Chandgaon",
      "Patenga",
      "Hathazari",
      "Sitakunda",
      "Patiya",
      "Boalkhali",
      "Raozan",
      "Anwara",
    ],
  },
  Sylhet: {
    name: "Sylhet",
    division: "Sylhet",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Sylhet Sadar", "Kotwali", "Beanibazar", "Golapganj", "Zakiganj", "Fenchuganj", "Bishwanath", "Osmani Nagar"],
  },
  Rajshahi: {
    name: "Rajshahi",
    division: "Rajshahi",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Boalia", "Rajpara", "Motihar", "Shah Makhdum", "Paba", "Godagari", "Tanore", "Bagmara", "Charghat"],
  },
  Khulna: {
    name: "Khulna",
    division: "Khulna",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Rupsha", "Dighalia", "Dumuria"],
  },
  Barishal: {
    name: "Barishal",
    division: "Barishal",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kotwali", "Airport", "Kawnia", "Bandar", "Babuganj", "Bakerganj", "Gournadi", "Mehendiganj"],
  },
  Rangpur: {
    name: "Rangpur",
    division: "Rangpur",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kotwali", "Tajhat", "Mahiganj", "Parshuram", "Badarganj", "Gangachara", "Mithapukur", "Pirganj"],
  },
  Mymensingh: {
    name: "Mymensingh",
    division: "Mymensingh",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kotwali", "Muktagachha", "Fulbaria", "Trishal", "Bhaluka", "Gafargaon", "Ishwarganj", "Haluaghat"],
  },
  Cumilla: {
    name: "Cumilla",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Cumilla Adarsha Sadar", "Sadar South", "Daudkandi", "Chandina", "Debidwar", "Muradnagar", "Homna", "Laksam", "Burichang"],
  },
  Bogra: {
    name: "Bogra",
    division: "Rajshahi",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Bogra Sadar", "Shajahanpur", "Sherpur", "Shibganj", "Gabtali", "Dhunat", "Kahaloo", "Nandigram"],
  },
  "Cox's Bazar": {
    name: "Cox's Bazar",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Cox's Bazar Sadar", "Chakaria", "Teknaf", "Ramu", "Ukhia", "Maheshkhali", "Pekua", "Kutubdia"],
  },
  Noakhali: {
    name: "Noakhali",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Sudharam", "Begumganj", "Senbagh", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Subarnachar"],
  },
  Feni: {
    name: "Feni",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Feni Sadar", "Daganbhuiyan", "Chhagalnaiya", "Sonagazi", "Parshuram", "Fulgazi"],
  },
  Brahmanbaria: {
    name: "Brahmanbaria",
    division: "Chattogram",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Brahmanbaria Sadar", "Kasba", "Nabinagar", "Bancharampur", "Sarail", "Ashuganj", "Akhaura"],
  },
  Tangail: {
    name: "Tangail",
    division: "Dhaka",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Tangail Sadar", "Mirzapur", "Kalihati", "Ghatail", "Madhupur", "Sakhipur", "Gopalpur", "Delduar"],
  },
  Narsingdi: {
    name: "Narsingdi",
    division: "Dhaka",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Narsingdi Sadar", "Palash", "Shibpur", "Raipura", "Belabo", "Monohardi"],
  },
  Kushtia: {
    name: "Kushtia",
    division: "Khulna",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Bheramara", "Daulatpur"],
  },
  Jessore: {
    name: "Jessore",
    division: "Khulna",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kotwali", "Jhikargachha", "Sharsha", "Monirampur", "Keshabpur", "Abhaynagar", "Bagherpara", "Chaugachha"],
  },
  Pabna: {
    name: "Pabna",
    division: "Rajshahi",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Pabna Sadar", "Ishwardi", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Santhia", "Sujanagar"],
  },
  Dinajpur: {
    name: "Dinajpur",
    division: "Rangpur",
    zone: "outside_dhaka",
    deliveryFee: 150,
    deliveryTime: "2-4 Days",
    thanas: ["Kotwali", "Birganj", "Kaharole", "Biral", "Bochaganj", "Phulbari", "Parbatipur", "Nawabganj", "Ghoraghat"],
  },
}

/**
 * Returns list of all available districts
 */
export function getAllDistricts(): string[] {
  return Object.keys(BD_DISTRICTS_DATA).sort()
}

/**
 * Returns thanas for a given district name
 */
export function getThanasByDistrict(districtName: string): string[] {
  const data = BD_DISTRICTS_DATA[districtName]
  if (!data) return ["Sadar / Main Area"]
  return data.thanas
}

/**
 * Returns shipping info based on selected district
 */
export function getShippingInfo(districtName: string) {
  const data = BD_DISTRICTS_DATA[districtName]
  if (!data) {
    return {
      zone: "outside_dhaka" as const,
      fee: 150,
      timeframe: "2-4 Days",
      label: "Outside Dhaka (Courier)",
    }
  }

  return {
    zone: data.zone,
    fee: data.deliveryFee,
    timeframe: data.deliveryTime,
    label:
      data.zone === "inside_dhaka"
        ? "Inside Dhaka Express (24-48 Hours)"
        : data.zone === "dhaka_suburb"
        ? "Dhaka Suburbs (24-72 Hours)"
        : "Outside Dhaka Courier (2-4 Days)",
  }
}
