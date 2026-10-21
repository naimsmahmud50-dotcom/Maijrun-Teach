import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { findComponentById } from "@/lib/pc-builder/catalog"
import { validatePCBuild } from "@/lib/pc-builder/compatibility"
import { PCBuildSelection } from "@/lib/pc-builder/types"

const AddBuildToCartSchema = z.object({
  cpuId: z.string().optional().nullable(),
  motherboardId: z.string().optional().nullable(),
  ramId: z.string().optional().nullable(),
  gpuId: z.string().optional().nullable(),
  psuId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  storageId: z.string().optional().nullable(),
  coolerId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = AddBuildToCartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid build payload", details: parsed.error.format() },
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

    // 1. Server-side validation of compatibility
    const validation = validatePCBuild(selection)
    if (!validation.isValid) {
      const errorMsg = validation.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; ")
      return NextResponse.json(
        {
          error: "Build contains incompatible components. Please resolve issues before adding to cart.",
          details: errorMsg,
          issues: validation.issues,
        },
        { status: 422 }
      )
    }

    // 2. Server-side inventory / stock verification
    const itemsToAdd: { id: string; title: string; price: number; quantity: number }[] = []
    const outOfStockItems: string[] = []

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
      if (item) {
        if (!item.inStock || item.inventoryQuantity <= 0) {
          outOfStockItems.push(item.title)
        } else {
          // Re-price on server
          itemsToAdd.push({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: 1,
          })
        }
      }
    }

    if (outOfStockItems.length > 0) {
      return NextResponse.json(
        {
          error: `The following components are currently out of stock: ${outOfStockItems.join(", ")}`,
        },
        { status: 409 }
      )
    }

    if (itemsToAdd.length === 0) {
      return NextResponse.json(
        { error: "No components selected to add to cart" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${itemsToAdd.length} custom PC components to cart`,
      data: {
        itemsCount: itemsToAdd.length,
        items: itemsToAdd,
        totalBdt: validation.totalPriceBdt,
        estimatedWatts: validation.estimatedTdpWatts,
      },
    })
  } catch (error) {
    console.error("[API_ADD_BUILD_TO_CART_ERROR]", error)
    return NextResponse.json(
      { error: "Server error adding build to cart" },
      { status: 500 }
    )
  }
}
