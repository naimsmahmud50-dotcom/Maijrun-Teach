import { NextResponse } from "next/server"
import { reconcileStalePayments } from "@/lib/payments/payment-store"

export async function POST() {
  try {
    const { cancelledCount } = reconcileStalePayments()
    return NextResponse.json({
      success: true,
      message: `Reconciliation complete. ${cancelledCount} stale pending payments cancelled and inventory released.`,
      cancelledCount,
    })
  } catch (error) {
    console.error("[API_RECONCILE_ERROR]", error)
    return NextResponse.json({ error: "Reconciliation worker error" }, { status: 500 })
  }
}
