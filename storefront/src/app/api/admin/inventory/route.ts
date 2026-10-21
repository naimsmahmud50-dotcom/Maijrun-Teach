import { NextRequest, NextResponse } from "next/server"
import { getInventoryLogs, adjustInventory, getAdminProducts } from "@/lib/admin/store"
import { validateAdminSession, canPerformAdminAction } from "@/lib/admin/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const products = await getAdminProducts()
    const lowStock = products.filter((p) => p.inventoryQuantity < 3)
    const logs = getInventoryLogs()

    return NextResponse.json({
      success: true,
      lowStockCount: lowStock.length,
      lowStock,
      logs,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load inventory data." },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cookieToken = req.cookies.get("maijrun_admin_token")?.value
    const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null)

    const { valid, session } = await validateAdminSession(token)
    if (!valid || !session) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 })
    }

    if (!canPerformAdminAction(session.role, "update", "inventory")) {
      return NextResponse.json({ success: false, message: "Forbidden: insufficient permissions." }, { status: 403 })
    }

    const body = await req.json()
    const { productId, delta, reason, note } = body || {}

    if (!productId || typeof delta !== "number" || !reason) {
      return NextResponse.json(
        { success: false, message: "productId, delta number, and reason are required." },
        { status: 400 }
      )
    }

    const result = await adjustInventory(productId, delta, `${reason}${note ? ` (${note})` : ""}`, session.email)
    if (!result.success) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Inventory adjusted. New stock: ${result.newQuantity}`,
      newQuantity: result.newQuantity,
      isLowStock: result.isLowStock,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to adjust inventory." },
      { status: 500 }
    )
  }
}
