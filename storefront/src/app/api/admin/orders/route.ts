import { NextRequest, NextResponse } from "next/server"
import {
  getAdminOrders,
  fulfillOrder,
  cancelOrRefundOrder,
} from "@/lib/admin/store"
import { validateAdminSession, canPerformAdminAction } from "@/lib/admin/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status")
    const orders = await getAdminOrders()

    const filtered = status
      ? orders.filter((o) => o.status.toLowerCase() === status.toLowerCase())
      : orders

    return NextResponse.json({ success: true, count: filtered.length, orders: filtered })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load orders." },
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

    const body = await req.json()
    const { action, orderId, courier, restock = true } = body || {}

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, message: "orderId and action are required." },
        { status: 400 }
      )
    }

    if (action === "fulfill") {
      if (!canPerformAdminAction(session.role, "fulfill", "orders")) {
        return NextResponse.json({ success: false, message: "Forbidden: cannot fulfill orders." }, { status: 403 })
      }
      const result = await fulfillOrder(orderId, courier || "steadfast", session.email)
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message || "Order not found." }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        message: `Order fulfilled with ${courier || "steadfast"} dispatch.`,
        order: result.order,
      })
    }

    if (action === "cancel" || action === "refund") {
      if (!canPerformAdminAction(session.role, "update", "orders")) {
        return NextResponse.json({ success: false, message: "Forbidden: cannot cancel or refund orders." }, { status: 403 })
      }
      const result = await cancelOrRefundOrder(orderId, restock, session.email)
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        message: `Order ${action === "cancel" ? "cancelled" : "refunded"} successfully. Restocked: ${restock}`,
      })
    }

    return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process order." },
      { status: 500 }
    )
  }
}
