import { NextRequest, NextResponse } from "next/server"
import { findComponentById } from "@/lib/pc-builder/catalog"
import { calculateBuildPrice, calculateEstimatedWattage } from "@/lib/pc-builder/compatibility"
import { PCBuildSelection } from "@/lib/pc-builder/types"
import { formatBDT } from "@/lib/bangladesh"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const cpuId = searchParams.get("cpuId")
    const motherboardId = searchParams.get("motherboardId")
    const ramId = searchParams.get("ramId")
    const gpuId = searchParams.get("gpuId")
    const psuId = searchParams.get("psuId")
    const caseId = searchParams.get("caseId")
    const storageId = searchParams.get("storageId")
    const coolerId = searchParams.get("coolerId")
    const buildName = searchParams.get("name") || "Custom Desktop PC"

    const selection: PCBuildSelection = {
      cpu: findComponentById(cpuId) || null,
      motherboard: findComponentById(motherboardId) || null,
      ram: findComponentById(ramId) || null,
      gpu: findComponentById(gpuId) || null,
      psu: findComponentById(psuId) || null,
      case: findComponentById(caseId) || null,
      storage: findComponentById(storageId) || null,
      cooler: findComponentById(coolerId) || null,
    }

    // Server-side recalculation
    const totalPrice = calculateBuildPrice(selection)
    const estimatedWatts = calculateEstimatedWattage(selection)

    const now = new Date()
    const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const quoteId = `MJ-Q-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const partsList = [
      { role: "Processor (CPU)", item: selection.cpu },
      { role: "Motherboard", item: selection.motherboard },
      { role: "RAM (Memory)", item: selection.ram },
      { role: "Graphics Card (GPU)", item: selection.gpu },
      { role: "Power Supply (PSU)", item: selection.psu },
      { role: "Casing", item: selection.case },
      { role: "Storage (SSD/HDD)", item: selection.storage },
      { role: "CPU Cooler", item: selection.cooler },
    ].filter((p) => Boolean(p.item))

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation - ${quoteId} | MAIJRUN Tech</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 40px 20px;
    }
    .quotation-card {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      padding: 48px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-title span { color: #0284c7; }
    .brand-tagline {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .shop-info {
      font-size: 13px;
      color: #475569;
      text-align: right;
      line-height: 1.5;
    }
    .quote-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: #f1f5f9;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 32px;
      font-size: 14px;
    }
    .meta-item strong { color: #334155; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .col-right { text-align: right; }
    .item-role {
      font-weight: 600;
      color: #0284c7;
      font-size: 12px;
      text-transform: uppercase;
    }
    .item-title {
      font-weight: 500;
      color: #0f172a;
      margin-top: 2px;
    }
    .item-specs {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .summary-box {
      margin-left: auto;
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      padding: 6px 0;
      color: #475569;
    }
    .summary-row.total {
      border-top: 2px solid #0284c7;
      padding-top: 12px;
      margin-top: 6px;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .terms-box {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .actions {
      text-align: center;
      margin-top: 30px;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
    }
    .btn-print:hover { background: #0369a1; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .quotation-card { border: none; box-shadow: none; padding: 0; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="quotation-card">
    <div class="header">
      <div>
        <div class="brand-title">MAIJRUN <span>Tech</span></div>
        <div class="brand-tagline">Official High-Performance Computers & Laptops</div>
      </div>
      <div class="shop-info">
        <div><strong>MAIJRUN Tech Bangladesh</strong></div>
        <div>Multiplan Centre, Level 5, Elephant Road, Dhaka</div>
        <div>Hotline: +880 1700-000000 | Email: sales@maijrun.com</div>
        <div>Web: https://maijrun.com</div>
      </div>
    </div>

    <div class="quote-meta-grid">
      <div>
        <div class="meta-item"><strong>Quotation ID:</strong> ${quoteId}</div>
        <div class="meta-item" style="margin-top: 6px;"><strong>Build Name:</strong> ${buildName}</div>
      </div>
      <div style="text-align: right;">
        <div class="meta-item"><strong>Date:</strong> ${now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
        <div class="meta-item" style="margin-top: 6px; color: #b45309;"><strong>Validity:</strong> 7 Days (Until ${validUntil.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 65%;">Component & Specifications</th>
          <th class="col-right" style="width: 15%;">Warranty</th>
          <th class="col-right" style="width: 15%;">Price (BDT)</th>
        </tr>
      </thead>
      <tbody>
        ${partsList
          .map((p, idx) => {
            const item = p.item!
            const warranty = item.specs.warrantyYears ? `${item.specs.warrantyYears} Years Official` : "1 Year Official"
            return `
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">${idx + 1}</td>
              <td>
                <div class="item-role">${p.role}</div>
                <div class="item-title">${item.title}</div>
                <div class="item-specs">${item.brand} | Model: ${item.specs.model}</div>
              </td>
              <td class="col-right" style="color: #64748b; font-size: 13px;">${warranty}</td>
              <td class="col-right" style="font-weight: 600; color: #0f172a;">${formatBDT(item.price)}</td>
            </tr>
          `
          })
          .join("")}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row">
        <span>Items Count:</span>
        <strong>${partsList.length} Components</strong>
      </div>
      <div class="summary-row">
        <span>Estimated Power:</span>
        <strong>~${estimatedWatts}W TDP</strong>
      </div>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${formatBDT(totalPrice)}</span>
      </div>
      <div class="summary-row">
        <span>VAT / Tax (Included):</span>
        <span>৳0 (Inclusive)</span>
      </div>
      <div class="summary-row total">
        <span>Grand Total:</span>
        <span style="color: #0284c7;">${formatBDT(totalPrice)}</span>
      </div>
    </div>

    <div class="terms-box">
      <strong>Terms & Conditions:</strong>
      <ol style="padding-left: 20px; margin-top: 6px;">
        <li>Price and stock are valid for 7 calendar days from quotation date.</li>
        <li>All components include official brand warranty serviced by MAIJRUN Tech Authorized Care.</li>
        <li>Free professional desktop assembly, thermal paste application, and cable management included.</li>
        <li>Delivery available across all 64 districts in Bangladesh with Cash on Delivery / bKash.</li>
      </ol>
    </div>

    <div class="actions">
      <button class="btn-print" onclick="window.print()">🖨️ Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[API_QUOTATION_ERROR]", error)
    return new NextResponse("Failed to generate quotation", { status: 500 })
  }
}
