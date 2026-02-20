"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { Einlagern } from "@/components/einlagern"
import { Bestellungen } from "@/components/bestellungen"
import { Historie } from "@/components/historie"
import { InventoryProvider } from "@/lib/inventory-context"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "einlagern" | "bestellungen" | "historie">("dashboard")

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <StatsCards />
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-8">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "einlagern" && <Einlagern />}
            {activeTab === "bestellungen" && <Bestellungen />}
            {activeTab === "historie" && <Historie />}
          </div>
        </main>
      </div>
    </InventoryProvider>
  )
}
