import { NextRequest, NextResponse } from "next/server"
import { getSalesAnalytics } from "@/lib/admin/store"
import { validateAdminSession } from "@/lib/admin/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cookieToken = req.cookies.get("maijrun_admin_token")?.value
    const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null)

    const { valid, session } = await validateAdminSession(token)
    if (!valid || !session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 })
    }

    const analytics = await getSalesAnalytics()
    return NextResponse.json({ success: true, analytics })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load analytics." },
      { status: 500 }
    )
  }
}
