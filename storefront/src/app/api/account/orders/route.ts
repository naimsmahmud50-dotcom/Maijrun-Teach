import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/session"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    )
  }

  // Sample order history for customer
  const orders = [
    {
      id: "ord_mjr_2026_01",
      customerId: sessionInfo.customerId,
      status: "SHIPPED",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
      totalBdt: 245080,
      itemCount: 1,
      items: [
        {
          title: "Asus ROG Zephyrus G16 (2025)",
          quantity: 1,
          priceBdt: 245000,
        },
      ],
      trackingUrl: `/us/track?orderId=ord_mjr_2026_01`,
    },
  ]

  return NextResponse.json({
    success: true,
    orders,
  })
}
