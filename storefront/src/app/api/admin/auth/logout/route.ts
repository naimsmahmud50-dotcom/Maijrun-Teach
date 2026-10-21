import { NextRequest, NextResponse } from "next/server"
import { validateAdminSession, invalidateAdminSession } from "@/lib/admin/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("maijrun_admin_token")?.value
    if (token) {
      const { session } = await validateAdminSession(token)
      if (session) {
        invalidateAdminSession(session.sessionId)
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    })

    response.cookies.delete("maijrun_admin_token")
    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error." },
      { status: 500 }
    )
  }
}
