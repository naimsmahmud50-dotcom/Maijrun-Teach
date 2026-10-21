import { NextRequest, NextResponse } from "next/server"
import { validateSession, revokeSession } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (sessionInfo.session) {
    await revokeSession(sessionInfo.session.sessionId)
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  })

  response.cookies.delete("maijrun_access_token")
  response.cookies.delete("maijrun_refresh_token")

  return response
}
