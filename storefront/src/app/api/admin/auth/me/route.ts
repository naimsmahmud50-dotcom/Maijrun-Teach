import { NextRequest, NextResponse } from "next/server"
import { validateAdminSession } from "@/lib/admin/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    let token = req.cookies.get("maijrun_admin_token")?.value

    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim()
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "No active admin session found." },
        { status: 401 }
      )
    }

    const { valid, session } = await validateAdminSession(token)
    if (!valid || !session) {
      return NextResponse.json(
        { authenticated: false, message: "Session expired or invalid." },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        adminId: session.adminId,
        email: session.email,
        role: session.role,
        expiresAt: session.expiresAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, message: error?.message || "Internal server error." },
      { status: 500 }
    )
  }
}
