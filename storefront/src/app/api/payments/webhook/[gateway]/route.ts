import { NextRequest, NextResponse } from "next/server"
import { getPaymentProvider } from "@/lib/payments/factory"
import {
  markPaymentAsPaid,
  getPaymentByOrderId,
  markPaymentAsFailed,
} from "@/lib/payments/payment-store"
import { PaymentGatewayId } from "@/lib/payments/types"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await params
    const provider = getPaymentProvider(gateway as PaymentGatewayId)

    const contentType = req.headers.get("content-type") || ""
    let body: any

    if (contentType.includes("application/json")) {
      body = await req.json()
    } else {
      const formData = await req.formData()
      body = Object.fromEntries(formData.entries())
    }

    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("x-bkash-signature") ||
      body.verify_sign ||
      body.signature

    // 1. Webhook Signature Verification (Anti-forgery defense)
    const isSignatureValid = provider.verifyWebhookSignature(body, signature)
    if (!isSignatureValid) {
      console.warn(`[SECURITY_ALERT] Invalid webhook signature received for ${gateway}`)
      return NextResponse.json(
        { error: "Invalid signature / unauthorized IPN request" },
        { status: 403 }
      )
    }

    const orderId = body.orderId || body.tran_id || body.merchantOrderId
    const transactionId = body.trxID || body.bank_tran_id || body.issuerPaymentRefNo || body.transactionId
    const receivedAmount = parseFloat(body.amount || body.total_amount || "0")
    const currency = body.currency || "BDT"

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in IPN payload" }, { status: 400 })
    }

    // 2. Anti-Tampering Check: Verify Amount & Currency against database record
    const existingRecord = getPaymentByOrderId(orderId)
    if (!existingRecord) {
      return NextResponse.json({ error: "Order not found in payment records" }, { status: 404 })
    }

    if (currency !== "BDT") {
      console.warn(`[SECURITY_ALERT] Invalid currency ${currency} in IPN for order ${orderId}`)
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 })
    }

    // Amount match verification (within 1 BDT floating point rounding)
    if (receivedAmount > 0 && Math.abs(receivedAmount - existingRecord.amountBdt) > 1.0) {
      console.warn(
        `[SECURITY_ALERT] Price tampering detected for order ${orderId}! Expected: ৳${existingRecord.amountBdt}, Received: ৳${receivedAmount}`
      )
      markPaymentAsFailed(orderId, "Price tampering detected in IPN callback")
      return NextResponse.json({ error: "Amount tampering detected" }, { status: 400 })
    }

    // 3. Idempotent Confirmation
    const { isDuplicate } = markPaymentAsPaid({
      orderId,
      transactionId: transactionId || "TRX_IPN_" + orderId,
      amountBdt: existingRecord.amountBdt,
      gatewayPaymentId: body.paymentID || body.val_id,
    })

    return NextResponse.json({
      success: true,
      message: isDuplicate
        ? "IPN already acknowledged (idempotent duplicate skipped)"
        : "Payment confirmed successfully via IPN",
      orderId,
      status: "PAID",
    })
  } catch (error) {
    console.error("[API_WEBHOOK_ERROR]", error)
    return NextResponse.json({ error: "Webhook processing failure" }, { status: 500 })
  }
}
