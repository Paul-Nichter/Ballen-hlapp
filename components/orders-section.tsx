"use client"

import { NewOrderDialog } from "./new-order-dialog"
import { OrderCard } from "./order-card"
import type { Order, Inventory, BaleType } from "@/lib/types"

interface OrdersSectionProps {
  orders: Order[]
  inventory: Inventory[]
  onCreateOrder: (order: {
    customerName: string
    baleType: BaleType
    quantity: number
    orderDate: string
    pickupDate: string
    deliveryPreferred: boolean
    isPreOrder: boolean
  }) => void
  onCompleteOrder: (id: string) => void
  onCancelOrder: (id: string) => void
}

export function OrdersSection({
  orders,
  inventory,
  onCreateOrder,
  onCompleteOrder,
  onCancelOrder,
}: OrdersSectionProps) {
  const activeOrders = orders.filter((o) => !o.isPreOrder)
  const preOrders = orders.filter((o) => o.isPreOrder)

  const canFulfillOrder = (order: Order) => {
    const inv = inventory.find((i) => i.baleType === order.baleType)
    return inv ? inv.quantity >= order.quantity : false
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bestellungen</h2>
        <NewOrderDialog onCreateOrder={onCreateOrder} />
      </div>

      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Aktive Bestellungen</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                canFulfill={canFulfillOrder(order)}
                onComplete={onCompleteOrder}
                onCancel={onCancelOrder}
              />
            ))}
          </div>
        </div>
      )}

      {preOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Vorbestellungen</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {preOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                canFulfill={canFulfillOrder(order)}
                onComplete={onCompleteOrder}
                onCancel={onCancelOrder}
              />
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Keine Bestellungen vorhanden. Erstelle eine neue Bestellung.
        </div>
      )}
    </div>
  )
}
