import { NextRequest, NextResponse } from "next/server"
import { getPaymentProvider } from "@/lib/payments/factory"
import { markPaymentAsPaid, markPaymentAsFailed, getPaymentByOrderId } from "@/lib/payments/payment-store"
import { PaymentGatewayId } from "@/lib/payments/types"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await params
    const searchParams = req.nextUrl.searchParams

    const orderId = searchParams.get("orderId") || searchParams.get("tran_id")
    const paymentId = searchParams.get("paymentID") || searchParams.get("payment_ref_id") || searchParams.get("val_id")
    const statusParam = searchParams.get("status")

    if (!orderId) {
      return NextResponse.redirect(new URL("/us", req.url))
    }

    if (statusParam === "cancel" || statusParam === "cancelled") {
      markPaymentAsFailed(orderId, "Customer cancelled payment on gateway")
      return NextResponse.redirect(
        new URL(`/us/order/${orderId}/payment-failed?gateway=${gateway}&status=cancelled`, req.url)
      )
    }

    const provider = getPaymentProvider(gateway as PaymentGatewayId)
    const verification = await provider.verifyPayment({
      orderId,
      paymentId: paymentId || undefined,
      valId: paymentId || undefined,
      paymentRefId: paymentId || undefined,
    })

    const existingRecord = getPaymentByOrderId(orderId)
    const amount = existingRecord ? existingRecord.amountBdt : 0

    if (verification.success && verification.status === "PAID") {
      markPaymentAsPaid({
        orderId,
        transactionId: verification.transactionId || "TRX_VERIFIED",
        amountBdt: amount,
        gatewayPaymentId: paymentId || undefined,
      })

      return NextResponse.redirect(
        new URL(
          `/us/order/${orderId}/confirmed?payment=success&gateway=${gateway}&trx=${verification.transactionId}`,
          req.url
        )
      )
    } else {
      markPaymentAsFailed(orderId, verification.errorMessage || "Gateway verification failed")
      return NextResponse.redirect(
        new URL(
          `/us/order/${orderId}/payment-failed?gateway=${gateway}&error=${encodeURIComponent(
            verification.errorMessage || "Payment declined"
          )}`,
          req.url
        )
      )
    }
  } catch (error) {
    console.error("[API_PAYMENT_CALLBACK_ERROR]", error)
    return NextResponse.redirect(new URL("/us", req.url))
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  // Support POST-based redirects (e.g. SSLCommerz standard form post redirect)
  return GET(req, { params })
}
