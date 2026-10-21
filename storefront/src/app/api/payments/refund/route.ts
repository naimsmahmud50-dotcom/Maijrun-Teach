import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPaymentByOrderId, processRefund } from "@/lib/payments/payment-store"
import { getPaymentProvider } from "@/lib/payments/factory"

const RefundSchema = z.object({
  orderId: z.string().min(3),
  amountBdt: z.number().positive(),
  reason: z.string().min(3).max(200),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RefundSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid refund payload", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { orderId, amountBdt, reason } = parsed.data
    const payment = getPaymentByOrderId(orderId)

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    if (payment.status !== "PAID") {
      return NextResponse.json(
        { error: `Cannot refund order with payment status: ${payment.status}` },
        { status: 400 }
      )
    }

    // Call provider refund API if applicable
    const provider = getPaymentProvider(payment.gateway)
    await provider.refund({
      orderId,
      paymentId: payment.id,
      amountBdt,
      reason,
    })

    // Update internal store
    const refundResult = processRefund(orderId, amountBdt, reason)

    return NextResponse.json({
      success: true,
      data: refundResult,
    })
  } catch (error) {
    console.error("[API_REFUND_ERROR]", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
}
