import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/session"
import { exportCustomerData } from "@/lib/account/account-store"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    )
  }

  const exportData = await exportCustomerData(sessionInfo.customerId)
  if (!exportData) {
    return NextResponse.json(
      { success: false, message: "Could not export customer data." },
      { status: 404 }
    )
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="maijrun_data_export_${sessionInfo.customerId}.json"`,
    },
  })
}
