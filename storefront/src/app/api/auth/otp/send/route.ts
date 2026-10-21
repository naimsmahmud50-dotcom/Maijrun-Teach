import { NextRequest, NextResponse } from "next/server"
import { requestOtp } from "@/lib/auth/otp-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, turnstileToken } = body || {}

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid mobile number is required." },
        { status: 400 }
      )
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    const result = await requestOtp({
      phone,
      ip: clientIp,
      turnstileToken,
    })

    if (!result.success) {
      return NextResponse.json(result, { status: 429 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Could not send verification code. Please try again." },
      { status: 500 }
    )
  }
}
