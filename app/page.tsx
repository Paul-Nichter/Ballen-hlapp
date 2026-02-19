"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { TabsNavigation } from "@/components/tabs-navigation"
import { StatsOverview } from "@/components/stats-overview"
import { InventoryDashboard } from "@/components/inventory-dashboard"
import { ProductSelector } from "@/components/product-selector"
import { OrdersSection } from "@/components/orders-section"
import { HistorySection } from "@/components/history-section"
import { StorageSection } from "@/components/storage-section"
import { useInventory } from "@/hooks/use-inventory"
import { useOrders } from "@/hooks/use-orders"
import { useToast } from "@/hooks/use-toast"
import type { BaleType } from "@/lib/types"

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedType, setSelectedType] = useState<BaleType>("barley")
  const [isPaused, setIsPaused] = useState(false)

  const { inventory, updateInventory } = useInventory()
  const { orders, completedOrders, createOrder, completeOrder, cancelOrder } = useOrders()
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+L to toggle pause
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault()
        setIsPaused((prev) => {
          const newState = !prev
          toast({
            title: newState ? "Einlagern pausiert" : "Einlagern aktiviert",
            description: newState ? "Drücke Strg+L zum Fortsetzen" : "Sensor-Eingabe ist jetzt aktiv",
          })
          return newState
        })
        return
      }

      // 'b' key to add inventory
      if (e.key === "b" && !isPaused && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return
        }

        e.preventDefault()
        handleSensorAddInventory(selectedType)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedType, isPaused])

  const handleSensorAddInventory = async (type: BaleType) => {
    try {
      await updateInventory(type, 1)
      toast({
        title: "Bestand erhöht",
        description: `+1 ${getTypeName(type)}`,
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Bestand konnte nicht aktualisiert werden",
        variant: "destructive",
      })
    }
  }

  const getTypeName = (type: BaleType) => {
    switch (type) {
      case "barley":
        return "Gerstenstroh"
      case "wheat":
        return "Weizenstroh"
      case "hay":
        return "Heu"
    }
  }

  const totalBales = inventory.reduce((sum, inv) => sum + inv.quantity, 0)
  const activeOrdersCount = orders.filter((o) => !o.isPreOrder).length
  const preOrdersCount = orders.filter((o) => o.isPreOrder).length
  const completedOrdersCount = completedOrders.length

  return (
    <div className="min-h-screen bg-background">
      <Header isPaused={isPaused} />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <StatsOverview
          totalBales={totalBales}
          activeOrders={activeOrdersCount}
          preOrders={preOrdersCount}
          completedOrders={completedOrdersCount}
        />

        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <ProductSelector selectedType={selectedType} onTypeChange={setSelectedType} />
            <InventoryDashboard inventory={inventory} onUpdateInventory={updateInventory} />
          </div>
        )}

        {activeTab === "orders" && (
          <OrdersSection
            orders={orders}
            inventory={inventory}
            onCreateOrder={createOrder}
            onCompleteOrder={completeOrder}
            onCancelOrder={cancelOrder}
          />
        )}

        {activeTab === "history" && <HistorySection completedOrders={completedOrders} />}

        {activeTab === "storage" && (
          <StorageSection
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onAddInventory={handleSensorAddInventory}
            isPaused={isPaused}
          />
        )}
      </main>
    </div>
  )
}
