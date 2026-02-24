import jsPDF from "jspdf"

type InvoiceItem = {
  product: string
  quantity: number
  price_per_unit: number
}

type InvoiceData = {
  invoiceNumber: string
  invoiceDate: string
  customer: string
  customerAddress: string
  items: InvoiceItem[]
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = 210

  // Load straw bale image
  let strohballenImg: string | null = null
  try {
    const response = await fetch("/images/strohballen.jpg")
    const blob = await response.blob()
    strohballenImg = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    // Continue without image
  }

  const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0)

  // ============ HEADER ============
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.setTextColor(0, 0, 0)
  const title = "RECHNUNG"
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, 25)

  // Underline
  const underlineY = 27
  doc.setLineWidth(0.8)
  doc.line((pageWidth - titleWidth) / 2, underlineY, (pageWidth + titleWidth) / 2, underlineY)

  // ============ INVOICE DETAILS (right side, left-aligned) ============
  const detailsLabelX = 130
  const detailsValueX = 165

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Rechnungsdatum:", detailsLabelX, 34)
  doc.setFont("helvetica", "normal")
  doc.text(data.invoiceDate, detailsValueX, 34)

  doc.setFont("helvetica", "bold")
  doc.text("Rechnungsnr.:", detailsLabelX, 39)
  doc.setFont("helvetica", "normal")
  doc.text(data.invoiceNumber, detailsValueX, 39)

  doc.setFont("helvetica", "bold")
  doc.text("Steuernummer:", detailsLabelX, 44)
  doc.setFont("helvetica", "normal")
  doc.text("86337/48858", detailsValueX, 44)

  // ============ SENDER LINE ============
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  const senderLine = "Kleinballenmafia, St.-Vitus-Weg 8, 72108 Rottenburg"
  doc.text(senderLine, 25, 62)
  doc.setLineWidth(0.3)
  doc.setDrawColor(100, 100, 100)
  doc.line(25, 63, 25 + doc.getTextWidth(senderLine), 63)

  // ============ RECIPIENT ============
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)

  // Parse customer address - split by commas or newlines
  const addressLines = data.customerAddress
    ? data.customerAddress.split(/[,\n]/).map((l) => l.trim()).filter(Boolean)
    : []

  doc.text(data.customer, 25, 72)
  let addrY = 78
  for (const line of addressLines) {
    doc.text(line, 25, addrY)
    addrY += 5
  }

  // ============ STRAW BALE IMAGE ============
  if (strohballenImg) {
    doc.addImage(strohballenImg, "JPEG", 135, 56, 50, 35)
  }

  // ============ ITEMS TABLE ============
  const tableTop = 105
  const tableLeft = 25
  const tableRight = 185
  const colPos = { beschreibung: 40, anzahl: 95, bezug: 113, satz: 127, betrag: 147, mwst: 172 }

  // Table header
  doc.setFillColor(240, 240, 240)
  doc.rect(tableLeft, tableTop - 6, tableRight - tableLeft, 8, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("Pos.", tableLeft + 2, tableTop)
  doc.text("Beschreibung", colPos.beschreibung, tableTop)
  doc.text("Anzahl", colPos.anzahl, tableTop)
  doc.text("Bezug", colPos.bezug, tableTop)
  doc.text("Satz", colPos.satz, tableTop)
  doc.text("Betrag in \u20AC", colPos.betrag, tableTop)
  doc.text("MwSt.", colPos.mwst, tableTop)

  // Table header border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(tableLeft, tableTop - 6, tableRight, tableTop - 6)
  doc.line(tableLeft, tableTop + 2, tableRight, tableTop + 2)

  // Vertical lines for header
  doc.line(tableLeft, tableTop - 6, tableLeft, tableTop + 2)
  doc.line(colPos.beschreibung - 2, tableTop - 6, colPos.beschreibung - 2, tableTop + 2)
  doc.line(colPos.anzahl - 2, tableTop - 6, colPos.anzahl - 2, tableTop + 2)
  doc.line(colPos.bezug - 2, tableTop - 6, colPos.bezug - 2, tableTop + 2)
  doc.line(colPos.satz - 4, tableTop - 6, colPos.satz - 4, tableTop + 2)
  doc.line(colPos.betrag - 4, tableTop - 6, colPos.betrag - 4, tableTop + 2)
  doc.line(colPos.mwst - 2, tableTop - 6, colPos.mwst - 2, tableTop + 2)
  doc.line(tableRight, tableTop - 6, tableRight, tableTop + 2)

  // Map product names
  const productNames: Record<string, string> = {
    Gerstenstroh: "HD Ballen Gerstenstroh",
    Weizenstroh: "HD Ballen Weizenstroh",
    Heu: "HD Ballen Heu",
    "Gro\u00dfballen Heu": "Gro\u00dfballen Heu",
  }

  // Table rows - one per item
  const rowSpacing = 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    const rowY = tableTop + 10 + i * rowSpacing
    const lineAmount = item.quantity * item.price_per_unit

    doc.text(String(i + 1), tableLeft + 4, rowY)
    doc.text(productNames[item.product] || `HD Ballen ${item.product}`, colPos.beschreibung, rowY)
    doc.text(String(item.quantity), colPos.anzahl + 4, rowY)
    doc.text("stk", colPos.bezug + 2, rowY)
    doc.text(`\u20AC     ${item.price_per_unit.toFixed(2).replace(".", ",")}`, colPos.satz - 4, rowY)
    doc.text(lineAmount.toFixed(2).replace(".", ","), colPos.betrag + 18, rowY, { align: "right" })
    doc.text("0%", colPos.mwst + 5, rowY)
  }

  // Table body lines - extend based on number of items
  const minTableHeight = 70
  const itemsHeight = data.items.length * rowSpacing + 16
  const tableHeight = Math.max(minTableHeight, itemsHeight)
  const tableBottom = tableTop + tableHeight

  doc.setLineWidth(0.3)
  doc.line(tableLeft, tableTop + 2, tableLeft, tableBottom)
  doc.line(colPos.beschreibung - 2, tableTop + 2, colPos.beschreibung - 2, tableBottom)
  doc.line(colPos.anzahl - 2, tableTop + 2, colPos.anzahl - 2, tableBottom)
  doc.line(colPos.bezug - 2, tableTop + 2, colPos.bezug - 2, tableBottom)
  doc.line(colPos.satz - 4, tableTop + 2, colPos.satz - 4, tableBottom)
  doc.line(colPos.betrag - 4, tableTop + 2, colPos.betrag - 4, tableBottom)
  doc.line(colPos.mwst - 2, tableTop + 2, colPos.mwst - 2, tableBottom)
  doc.line(tableRight, tableTop + 2, tableRight, tableBottom)
  doc.line(tableLeft, tableBottom, tableRight, tableBottom)

  // ============ TOTALS ============
  const totalsY = tableBottom + 14
  const totalsLabelX = colPos.betrag - 6
  const totalsValueX = tableRight

  // Zwischensumme
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Zwischensumme", totalsLabelX, totalsY, { align: "right" })

  doc.setFillColor(220, 220, 200)
  doc.rect(colPos.betrag - 4, totalsY - 5, 10, 7, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("\u20AC", colPos.betrag, totalsY)

  doc.setFillColor(245, 245, 235)
  doc.rect(colPos.betrag + 6, totalsY - 5, tableRight - colPos.betrag - 6, 7, "F")
  doc.text(totalAmount.toFixed(2).replace(".", ","), totalsValueX - 3, totalsY, { align: "right" })

  // Empty rows
  const row2Y = totalsY + 9
  doc.setDrawColor(180, 180, 180)
  doc.rect(colPos.betrag - 4, row2Y - 5, tableRight - colPos.betrag + 4, 7)
  const row3Y = row2Y + 9
  doc.rect(colPos.betrag - 4, row3Y - 5, tableRight - colPos.betrag + 4, 7)

  // Rechnungsbetrag
  const totalY = row3Y + 12
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Rechnungsbetrag", totalsLabelX, totalY, { align: "right" })

  doc.setFillColor(220, 220, 200)
  doc.rect(colPos.betrag - 4, totalY - 5, 10, 7, "F")
  doc.text("\u20AC", colPos.betrag, totalY)

  doc.setFillColor(245, 245, 235)
  doc.rect(colPos.betrag + 6, totalY - 5, tableRight - colPos.betrag - 6, 7, "F")
  doc.setFontSize(11)
  doc.text(totalAmount.toFixed(2).replace(".", ","), totalsValueX - 3, totalY, { align: "right" })

  // ============ KLEINUNTERNEHMER DISCLAIMER ============
  const disclaimerY = totalY + 16
  doc.setFont("helvetica", "italic")
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  const disclaimerText = "* Da ich Kleinunternehmer bin, wird gem\u00E4\u00DF \u00A7 19 UStG keine Umsatzsteuer berechnet."
  const disclaimerWidth = doc.getTextWidth(disclaimerText)
  doc.text(disclaimerText, (pageWidth - disclaimerWidth) / 2, disclaimerY)

  // ============ FOOTER ============
  const footerY = 265
  doc.setLineWidth(0.5)
  doc.setDrawColor(0, 0, 0)
  doc.setTextColor(0, 0, 0)
  doc.line(25, footerY - 5, 185, footerY - 5)

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("Paul Nichter", 25, footerY)
  doc.setFont("helvetica", "normal")
  doc.text("Kirchstra\u00DFe 22", 25, footerY + 4)
  doc.text("72145 Hirrlingen", 25, footerY + 8)

  doc.setFont("helvetica", "bold")
  doc.text("Kontaktinformationen", 75, footerY)
  doc.setFont("helvetica", "normal")
  doc.text("Tel.:   07478/3380867", 75, footerY + 4)
  doc.text("Mobil: 01573/7948061", 75, footerY + 8)
  doc.text("Email: info@kleinballenmafia-frommenhausen.de", 75, footerY + 12)

  return doc.output("blob")
}
