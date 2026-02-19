"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Order } from "@/lib/types"

interface HistorySectionProps {
  completedOrders: Order[]
}

export function HistorySection({ completedOrders }: HistorySectionProps) {
  const getTypeName = (type: string) => {
    switch (type) {
      case "barley":
        return "Gerstenstroh"
      case "wheat":
        return "Weizenstroh"
      case "hay":
        return "Heu"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="default">Abgeschlossen</Badge>
    }
    if (status === "cancelled") {
      return <Badge variant="destructive">Storniert</Badge>
    }
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bestellhistorie</h2>

      {completedOrders.length > 0 ? (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {completedOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.customerName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity}x {getTypeName(order.baleType)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bestelldatum:</span>
                      <p>{new Date(order.orderDate).toLocaleDateString("de-DE")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Abholdatum:</span>
                      <p>{new Date(order.pickupDate).toLocaleDateString("de-DE")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zuvor:</span>
                      <p>{order.deliveryPreferred ? "Ja" : "Nein"}</p>
                    </div>
                    {order.completedAt && (
                      <div>
                        <span className="text-muted-foreground">Abgeschlossen:</span>
                        <p>{new Date(order.completedAt).toLocaleDateString("de-DE")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12 text-muted-foreground">Keine abgeschlossenen Bestellungen vorhanden.</div>
      )}
    </div>
  )
}
