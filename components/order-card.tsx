"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { Order } from "@/lib/types"

interface OrderCardProps {
  order: Order
  canFulfill: boolean
  onComplete: (id: string) => void
  onCancel: (id: string) => void
}

export function OrderCard({ order, canFulfill, onComplete, onCancel }: OrderCardProps) {
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

  const getStatusBadge = () => {
    if (order.is_pre_order) {
      return <Badge variant="secondary">Vorbestellung</Badge>
    }
    if (order.status === "pending") {
      return <Badge variant="outline">Ausstehend</Badge>
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{order.customer_name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {order.quantity}x {getTypeName(order.bale_type)}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bestelldatum:</span>
            <span>{new Date(order.order_date).toLocaleDateString("de-DE")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Abholdatum:</span>
            <span>{new Date(order.pickup_date).toLocaleDateString("de-DE")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Zuvor:</span>
            <span>{order.delivery_preferred ? "Ja" : "Nein"}</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {canFulfill ? (
              <div className="flex items-center gap-2 text-sm text-accent">
                <CheckCircle className="h-4 w-4" />
                <span>Ausreichend Bestand</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Nicht genügend Bestand</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => onComplete(order.id)} disabled={!canFulfill} className="flex-1" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Ausführen
            </Button>
            <Button onClick={() => onCancel(order.id)} variant="outline" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Stornieren
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
