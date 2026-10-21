import { NextRequest, NextResponse } from "next/server"
import { verifyOtp, normalizeBangladeshMobile } from "@/lib/auth/otp-service"
import { findOrCreateCustomerByPhone } from "@/lib/account/account-store"
import { createCustomerSession } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, otp } = body || {}

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP code are required." },
        { status: 400 }
      )
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    const userAgent = req.headers.get("user-agent") || "Web Browser"

    // 1. Verify OTP with constant-time comparison
    const verification = await verifyOtp({
      phone,
      otp,
      ip: clientIp,
    })

    if (!verification.success) {
      return NextResponse.json(verification, { status: 401 })
    }

    const normalized = normalizeBangladeshMobile(phone)!

    // 2. Find or register customer
    const { customer, isNew } = await findOrCreateCustomerByPhone(normalized)

    // 3. Issue secure session and tokens
    const { session, tokens } = await createCustomerSession({
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      userAgent,
      ip: clientIp,
    })

    // 4. Set httpOnly, Secure, SameSite=strict session cookies
    const response = NextResponse.json({
      success: true,
      message: isNew ? "Account created and logged in successfully." : "Welcome back!",
      isNewUser: isNew,
      user: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
      },
      sessionId: session.sessionId,
    })

    const isProd = process.env.NODE_ENV === "production"

    response.cookies.set("maijrun_access_token", tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set("maijrun_refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    )
  }
}
