import { NextRequest, NextResponse } from "next/server"
import { validateSession, getCustomerSessions, revokeAllSessionsForCustomer } from "@/lib/auth/session"
import { getCustomerById, updateCustomerProfile, deleteCustomerAccount } from "@/lib/account/account-store"
import { maskPhoneNumber } from "@/lib/auth/otp-service-helper"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 }
    )
  }

  const customer = await getCustomerById(sessionInfo.customerId)
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Customer profile not found." },
      { status: 404 }
    )
  }

  const sessions = await getCustomerSessions(customer.id)

  return NextResponse.json({
    success: true,
    customer: {
      ...customer,
      phoneMasked: maskPhoneNumber(customer.phone),
    },
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      userAgent: s.userAgent,
      isCurrent: s.sessionId === sessionInfo.session?.sessionId,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { name, email } = body || {}

    const updated = await updateCustomerProfile(sessionInfo.customerId, {
      name: typeof name === "string" ? name : undefined,
      email: typeof email === "string" ? email : undefined,
    })

    if (!updated) {
      return NextResponse.json({ success: false, message: "Profile update failed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      customer: {
        ...updated,
        phoneMasked: maskPhoneNumber(updated.phone),
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  await revokeAllSessionsForCustomer(sessionInfo.customerId)
  await deleteCustomerAccount(sessionInfo.customerId)

  const response = NextResponse.json({
    success: true,
    message: "Your account and personal data have been permanently deleted.",
  })

  response.cookies.delete("maijrun_access_token")
  response.cookies.delete("maijrun_refresh_token")

  return response
}
