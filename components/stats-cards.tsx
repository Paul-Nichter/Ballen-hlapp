"use client"

import { Card } from "@/components/ui/card"
import { Package, ShoppingCart, Clock, CheckCircle } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StatsCards() {
  const { inventory } = useInventory()
  const { data: orders } = useSWR("/api/orders", fetcher, { refreshInterval: 5000 })
  const { data: history } = useSWR("/api/history", fetcher, { refreshInterval: 5000 })

  const totalInventory = (inventory.gerstenstroh ?? 0) + (inventory.weizenstroh ?? 0) + (inventory.heu ?? 0)
  const activeOrders = orders?.filter((o: { is_preorder: boolean }) => !o.is_preorder)?.length ?? 0
  const preOrders = orders?.filter((o: { is_preorder: boolean }) => o.is_preorder)?.length ?? 0
  const completed = history?.filter((h: { status: string }) => h.status === "abgeschlossen")?.length ?? 0

  const stats = [
    {
      title: "Gesamtbestand",
      value: totalInventory.toString(),
      subtitle: "Ballen verfügbar",
      icon: Package,
    },
    {
      title: "Aktive Bestellungen",
      value: activeOrders.toString(),
      subtitle: "In Bearbeitung",
      icon: ShoppingCart,
    },
    {
      title: "Vorbestellungen",
      value: preOrders.toString(),
      subtitle: "Zukünftige Lieferungen",
      icon: Clock,
    },
    {
      title: "Abgeschlossen",
      value: completed.toString(),
      subtitle: "Erfolgreich ausgeführt",
      icon: CheckCircle,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </div>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      ))}
    </div>
  )
}
