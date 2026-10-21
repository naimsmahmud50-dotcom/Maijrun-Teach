import { NextRequest, NextResponse } from "next/server"
import { getBuildById } from "@/lib/pc-builder/build-store"
import { findComponentById } from "@/lib/pc-builder/catalog"
import { validatePCBuild } from "@/lib/pc-builder/compatibility"
import { PCBuildSelection } from "@/lib/pc-builder/types"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const build = getBuildById(id)

    if (!build) {
      return NextResponse.json(
        { error: "Shared PC build not found or expired" },
        { status: 404 }
      )
    }

    const selection: PCBuildSelection = {
      cpu: findComponentById(build.selection.cpuId) || null,
      motherboard: findComponentById(build.selection.motherboardId) || null,
      ram: findComponentById(build.selection.ramId) || null,
      gpu: findComponentById(build.selection.gpuId) || null,
      psu: findComponentById(build.selection.psuId) || null,
      case: findComponentById(build.selection.caseId) || null,
      storage: findComponentById(build.selection.storageId) || null,
      cooler: findComponentById(build.selection.coolerId) || null,
    }

    const validation = validatePCBuild(selection)

    // Security: Read-only response exposing ONLY public product catalog data, no customer identity
    return NextResponse.json({
      success: true,
      data: {
        id: build.id,
        name: build.name,
        createdAt: build.createdAt,
        selection,
        validation,
      },
    })
  } catch (error) {
    console.error("[API_GET_SHARED_BUILD_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to retrieve shared build" },
      { status: 500 }
    )
  }
}
