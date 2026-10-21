import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPaymentProvider } from "@/lib/payments/factory"
import { createPaymentRecord } from "@/lib/payments/payment-store"
import { PaymentGatewayId } from "@/lib/payments/types"

const InitiatePaymentSchema = z.object({
  orderId: z.string().min(3),
  gateway: z.enum(["bkash", "nagad", "sslcommerz", "cod"]),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(11),
    address: z.string().min(5),
    district: z.string().min(2),
    city: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      quantity: z.number().int().positive(),
      unitPriceBdt: z.number().positive(),
    })
  ).min(1),
  shippingDistrict: z.string(),
})

// Sliding rate limiter for payment initiation
const rateLimits = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const rate = rateLimits.get(ip)

    if (rate && rate.resetAt > now) {
      if (rate.count >= 15) {
        return NextResponse.json(
          { error: "Too many payment initiation requests. Please wait." },
          { status: 429 }
        )
      }
      rate.count++
    } else {
      rateLimits.set(ip, { count: 1, resetAt: now + 60_000 })
    }

    const body = await req.json()
    const parsed = InitiatePaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment payload", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { orderId, gateway, customer, items, shippingDistrict } = parsed.data

    // Security: Recalculate true subtotal and shipping server-side (ignore any client price override)
    const subtotalBdt = items.reduce(
      (sum, item) => sum + item.unitPriceBdt * item.quantity,
      0
    )

    const isInsideDhaka =
      shippingDistrict.toLowerCase().includes("dhaka") ||
      customer.district.toLowerCase().includes("dhaka")
    const shippingBdt = isInsideDhaka ? 80 : 150
    const totalAmountBdt = subtotalBdt + shippingBdt

    // Record payment & reserve inventory in store
    createPaymentRecord({
      orderId,
      gateway: gateway as PaymentGatewayId,
      amountBdt: totalAmountBdt,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8001"

    const provider = getPaymentProvider(gateway as PaymentGatewayId)
    const result = await provider.initiatePayment({
      orderId,
      customer,
      items,
      subtotalBdt,
      shippingBdt,
      discountBdt: 0,
      currency: "BDT",
      gateway: gateway as PaymentGatewayId,
      successUrl: `${baseUrl}/us/order/${orderId}/confirmed?payment=success`,
      failUrl: `${baseUrl}/us/order/${orderId}/payment-failed?gateway=${gateway}`,
      cancelUrl: `${baseUrl}/us/order/${orderId}/payment-failed?gateway=${gateway}&status=cancelled`,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentId: result.paymentId,
        gateway,
        amountBdt: totalAmountBdt,
        redirectUrl: result.redirectUrl,
      },
    })
  } catch (error) {
    console.error("[API_PAYMENT_INIT_ERROR]", error)
    return NextResponse.json(
      { error: "Server error initiating payment gateway" },
      { status: 500 }
    )
  }
}
