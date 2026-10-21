import { NextRequest, NextResponse } from "next/server"
import { getTrackingByOrderId, getGuestTracking } from "@/lib/tracking/tracking-store"
import { validateSession } from "@/lib/auth/session"
import { maskPhoneNumber } from "@/lib/auth/otp-service-helper"

type Params = {
  params: Promise<{
    orderId: string
  }>
}

export async function GET(req: NextRequest, props: Params) {
  const params = await props.params
  const orderId = params.orderId

  if (!orderId) {
    return NextResponse.json({ success: false, message: "Order ID is required." }, { status: 400 })
  }

  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  // 1. If authenticated, attempt to retrieve by order ID and verify ownership
  if (sessionInfo.valid && sessionInfo.customerId) {
    const record = await getTrackingByOrderId(orderId, sessionInfo.customerId)
    if (record) {
      return NextResponse.json({
        success: true,
        record: {
          ...record,
          phone: maskPhoneNumber(record.phone),
        },
      })
    }
  }

  // 2. Otherwise handle as guest lookup: require phone number
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")

  if (!phone) {
    return NextResponse.json(
      {
        success: false,
        message: "Please provide the phone number used during checkout to track this parcel.",
      },
      { status: 401 }
    )
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"

  const result = await getGuestTracking({
    orderId,
    phone,
    ip: clientIp,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 404 })
  }

  return NextResponse.json(result)
}
