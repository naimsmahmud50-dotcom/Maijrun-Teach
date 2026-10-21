import { NextRequest, NextResponse } from "next/server"
import {
  getAdminProducts,
  upsertAdminProduct,
  exportProductsCsv,
  importProductsCsv,
} from "@/lib/admin/store"
import { validateAdminSession, canPerformAdminAction } from "@/lib/admin/admin-auth"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const isExport = searchParams.get("export") === "csv"

    if (isExport) {
      const csv = exportProductsCsv()
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="maijrun-products.csv"',
        },
      })
    }

    const products = await getAdminProducts()
    return NextResponse.json({ success: true, count: products.length, products })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load products." },
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

    if (!canPerformAdminAction(session.role, "update", "products")) {
      return NextResponse.json({ success: false, message: "Forbidden: insufficient permissions." }, { status: 403 })
    }

    const isImport = req.nextUrl.searchParams.get("import") === "csv"
    if (isImport) {
      const csvContent = await req.text()
      const importedCount = importProductsCsv(csvContent)
      return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} products.` })
    }

    const body = await req.json()
    const product = upsertAdminProduct(body, session.email)

    return NextResponse.json({
      success: true,
      message: "Product saved successfully.",
      product,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save product." },
      { status: 500 }
    )
  }
}
