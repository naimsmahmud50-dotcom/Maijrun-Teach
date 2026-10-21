import { NextRequest, NextResponse } from "next/server"
import { getPaymentByOrderId } from "@/lib/payments/payment-store"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const payment = getPaymentByOrderId(orderId)

    if (!payment) {
      return NextResponse.json({ error: "No payment found for this order" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: payment.orderId,
        gateway: payment.gateway,
        status: payment.status,
        amountBdt: payment.amountBdt,
        currency: payment.currency,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
      },
    })
  } catch (error) {
    console.error("[API_PAYMENT_STATUS_ERROR]", error)
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 })
  }
}
