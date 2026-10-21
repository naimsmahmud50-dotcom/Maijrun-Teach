import { NextRequest, NextResponse } from "next/server"
import { validateSession, revokeAllSessionsForCustomer } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in first." },
      { status: 401 }
    )
  }

  const terminatedCount = await revokeAllSessionsForCustomer(sessionInfo.customerId)

  const response = NextResponse.json({
    success: true,
    message: `Logged out from all ${terminatedCount} active devices successfully.`,
    terminatedSessionsCount: terminatedCount,
  })

  response.cookies.delete("maijrun_access_token")
  response.cookies.delete("maijrun_refresh_token")

  return response
}
