import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/session"
import { getAddresses, addAddress, deleteAddress } from "@/lib/account/account-store"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("maijrun_access_token")?.value
  const sessionInfo = await validateSession(token)

  if (!sessionInfo.valid || !sessionInfo.customerId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  const addresses = await getAddresses(sessionInfo.customerId)
  return NextResponse.json({ success: true, addresses })
}

export async function POST(req: NextRequest) {
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
    const { title, division, district, upazila, streetAddress, postalCode, phone, isDefault } =
      body || {}

    if (!division || !district || !streetAddress || !phone) {
      return NextResponse.json(
        { success: false, message: "Division, District, Street Address, and Phone are required." },
        { status: 400 }
      )
    }

    const newAddress = await addAddress(sessionInfo.customerId, {
      title: title || "Home",
      division,
      district,
      upazila: upazila || "",
      streetAddress,
      postalCode,
      phone,
      isDefault: Boolean(isDefault),
    })

    return NextResponse.json({
      success: true,
      message: "Address saved successfully.",
      address: newAddress,
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

  const { searchParams } = new URL(req.url)
  const addressId = searchParams.get("id")

  if (!addressId) {
    return NextResponse.json(
      { success: false, message: "Address ID is required." },
      { status: 400 }
    )
  }

  const success = await deleteAddress(sessionInfo.customerId, addressId)
  if (!success) {
    return NextResponse.json(
      { success: false, message: "Address not found or access denied." },
      { status: 403 }
    )
  }

  return NextResponse.json({ success: true, message: "Address deleted." })
}
