"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, ShoppingCart, Clock, CheckCircle } from "lucide-react"

interface StatsOverviewProps {
  totalBales: number
  activeOrders: number
  preOrders: number
  completedOrders: number
}

export function StatsOverview({ totalBales, activeOrders, preOrders, completedOrders }: StatsOverviewProps) {
  const stats = [
    {
      label: "Gesamtbestand",
      value: totalBales,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Aktive Bestellungen",
      value: activeOrders,
      icon: ShoppingCart,
      color: "text-accent",
    },
    {
      label: "Vorbestellungen",
      value: preOrders,
      icon: Clock,
      color: "text-chart-3",
    },
    {
      label: "Abgeschlossen",
      value: completedOrders,
      icon: CheckCircle,
      color: "text-chart-2",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
