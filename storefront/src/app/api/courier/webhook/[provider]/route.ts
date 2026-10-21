import { NextRequest, NextResponse } from "next/server"
import { handleCourierWebhook } from "@/lib/tracking/tracking-store"

type Params = {
  params: Promise<{
    provider: string
  }>
}

export async function POST(req: NextRequest, props: Params) {
  const params = await props.params
  const provider = params.provider.toLowerCase()

  try {
    const signature =
      req.headers.get("x-courier-signature") ||
      req.headers.get("x-signature") ||
      req.headers.get("signature") ||
      ""

    const payload = await req.json()

    const result = await handleCourierWebhook(provider, payload, signature)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Webhook processing error" },
      { status: 500 }
    )
  }
}
