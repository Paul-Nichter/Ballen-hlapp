"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, XCircle, Loader2, Download } from "lucide-react"
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf"
import useSWR from "swr"

type OrderItem = {
  product: string
  quantity: number
  price_per_unit: number
}

type HistoryItem = {
  id: string
  customer: string
  product: string
  quantity: number
  order_date: string
  delivery_date: string | null
  status: string
  completed_at: string
  invoice_number: string | null
  customer_address: string | null
  price_per_unit: number | null
  items: OrderItem[] | null
}

function getOrderItems(item: HistoryItem): OrderItem[] {
  if (item.items && Array.isArray(item.items) && item.items.length > 0) {
    return item.items
  }
  return [{ product: item.product, quantity: item.quantity, price_per_unit: item.price_per_unit ?? 2.5 }]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Historie() {
  const { data: history, isLoading } = useSWR<HistoryItem[]>("/api/history", fetcher, { refreshInterval: 5000 })

  const handleDownloadInvoice = async (item: HistoryItem) => {
    try {
      const orderDate = new Date(item.order_date)
      const invoiceDate = `${String(orderDate.getDate()).padStart(2, "0")}.${String(orderDate.getMonth() + 1).padStart(2, "0")}.${orderDate.getFullYear()}`
      const items = getOrderItems(item)

      const pdfBlob = await generateInvoicePDF({
        invoiceNumber: item.invoice_number || "---",
        invoiceDate,
        customer: item.customer,
        customerAddress: item.customer_address || "",
        items,
      })

      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Rechnung_${item.invoice_number?.replace("/", "_") || item.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Bestellhistorie</h2>
        <p className="text-sm text-muted-foreground">Abgeschlossene und stornierte Bestellungen</p>
      </div>

      {(!history || history.length === 0) ? (
        <p className="text-sm text-muted-foreground">Keine Historie vorhanden</p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const completedDate = new Date(item.completed_at)
            const dateStr = `${completedDate.getDate()}.${completedDate.getMonth() + 1}.${completedDate.getFullYear()}`
            const items = getOrderItems(item)

            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      {item.status === "abgeschlossen" ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{item.customer}</p>
                        <Badge
                          variant={item.status === "abgeschlossen" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {item.status === "abgeschlossen" ? "Abgeschlossen" : "Storniert"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {items.map((orderItem, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-lg">{orderItem.product === "Heu" || orderItem.product === "Großballen Heu" ? "\uD83C\uDF3F" : "\uD83C\uDF3E"}</span>
                          <span className="text-sm text-muted-foreground">
                            {orderItem.quantity}x {orderItem.product}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {item.delivery_date || item.order_date}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{dateStr}</div>
                  {item.invoice_number && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => handleDownloadInvoice(item)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Rechnung
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
