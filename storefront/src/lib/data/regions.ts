"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const FALLBACK_REGION: HttpTypes.StoreRegion = {
  id: "reg_01JM_MAIJRUN_BD",
  name: "Bangladesh",
  currency_code: "bdt",
  countries: [
    {
      id: "c_bd",
      iso_2: "bd",
      iso_3: "bgd",
      num_code: "050",
      name: "Bangladesh",
    },
    {
      id: "c_us",
      iso_2: "us",
      iso_3: "usa",
      num_code: "840",
      name: "United States",
    },
  ],
} as unknown as HttpTypes.StoreRegion

export const listRegions = async () => {
  try {
    const next = {
      ...(await getCacheOptions("regions")),
    }

    return await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ regions }) => regions)
  } catch (e) {
    return [FALLBACK_REGION]
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    const next = {
      ...(await getCacheOptions(["regions", id].join("-"))),
    }

    return await sdk.client
      .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ region }) => region)
  } catch (e) {
    return FALLBACK_REGION
  }
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (regions && regions.length > 0) {
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          regionMap.set(c?.iso_2 ?? "", region)
        })
      })
    }

    const region = countryCode
      ? regionMap.get(countryCode) || regionMap.get("bd") || regionMap.get("us")
      : regionMap.get("bd") || regionMap.get("us")

    return region || FALLBACK_REGION
  } catch (e: any) {
    return FALLBACK_REGION
  }
}
