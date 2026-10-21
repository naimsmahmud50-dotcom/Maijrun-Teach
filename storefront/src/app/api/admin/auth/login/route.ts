import { NextRequest, NextResponse } from "next/server"
import { authenticateAdminStep1 } from "@/lib/admin/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      )
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    const result = await authenticateAdminStep1({
      email,
      password,
      ip: clientIp,
    })

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error." },
      { status: 500 }
    )
  }
}
