import { NextRequest, NextResponse } from "next/server"
import { authenticateAdminStep2 } from "@/lib/admin/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { challengeToken, totpCode } = body || {}

    if (!challengeToken || !totpCode) {
      return NextResponse.json(
        { success: false, message: "Challenge token and 6-digit TOTP code are required." },
        { status: 400 }
      )
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || "Admin Browser"

    const result = await authenticateAdminStep2({
      challengeToken,
      totpCode,
      userAgent,
      ip: clientIp,
    })

    if (!result.success || !result.token) {
      return NextResponse.json(result, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      session: {
        sessionId: result.session?.sessionId,
        email: result.session?.email,
        role: result.session?.role,
        expiresAt: result.session?.expiresAt,
      },
    })

    // Set hardened admin session cookie
    response.cookies.set("maijrun_admin_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60, // 30 minutes short-lived session
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error." },
      { status: 500 }
    )
  }
}
