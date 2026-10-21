import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { validatePCBuild } from "@/lib/pc-builder/compatibility"
import { findComponentById } from "@/lib/pc-builder/catalog"
import { PCBuildSelection } from "@/lib/pc-builder/types"

const ValidateBuildSchema = z.object({
  cpuId: z.string().optional().nullable(),
  motherboardId: z.string().optional().nullable(),
  ramId: z.string().optional().nullable(),
  gpuId: z.string().optional().nullable(),
  psuId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  storageId: z.string().optional().nullable(),
  coolerId: z.string().optional().nullable(),
})

/**
 * Server-side source of truth for build validation
 * Recalculates prices and re-validates compatibility
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ValidateBuildSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload format", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const {
      cpuId,
      motherboardId,
      ramId,
      gpuId,
      psuId,
      caseId,
      storageId,
      coolerId,
    } = parsed.data

    const selection: PCBuildSelection = {
      cpu: findComponentById(cpuId) || null,
      motherboard: findComponentById(motherboardId) || null,
      ram: findComponentById(ramId) || null,
      gpu: findComponentById(gpuId) || null,
      psu: findComponentById(psuId) || null,
      case: findComponentById(caseId) || null,
      storage: findComponentById(storageId) || null,
      cooler: findComponentById(coolerId) || null,
    }

    const result = validatePCBuild(selection)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[API_VALIDATE_BUILD_ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error validating build" },
      { status: 500 }
    )
  }
}
