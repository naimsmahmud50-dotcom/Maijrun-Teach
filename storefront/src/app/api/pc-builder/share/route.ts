import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { saveBuild } from "@/lib/pc-builder/build-store"

const ShareBuildSchema = z.object({
  name: z.string().max(100).default("MAIJRUN Custom Build"),
  cpuId: z.string().optional().nullable(),
  motherboardId: z.string().optional().nullable(),
  ramId: z.string().optional().nullable(),
  gpuId: z.string().optional().nullable(),
  psuId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  storageId: z.string().optional().nullable(),
  coolerId: z.string().optional().nullable(),
})

// Simple in-memory rate-limiter for sharing
const ipCallCounts = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const rateData = ipCallCounts.get(ip)

    if (rateData && rateData.resetAt > now) {
      if (rateData.count >= 30) {
        return NextResponse.json(
          { error: "Too many share requests. Please wait a minute." },
          { status: 429 }
        )
      }
      rateData.count++
    } else {
      ipCallCounts.set(ip, { count: 1, resetAt: now + 60_000 })
    }

    const body = await req.json()
    const parsed = ShareBuildSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid build parameters", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const saved = saveBuild(parsed.data.name, parsed.data)

    return NextResponse.json({
      success: true,
      data: {
        shareId: saved.id,
        name: saved.name,
        totalPriceBdt: saved.totalPriceBdt,
        estimatedWatts: saved.estimatedWatts,
      },
    })
  } catch (error) {
    console.error("[API_SHARE_BUILD_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    )
  }
}
