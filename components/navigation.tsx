"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, History } from "lucide-react"

interface NavigationProps {
  activeTab: "dashboard" | "einlagern" | "bestellungen" | "historie"
  onTabChange: (tab: "dashboard" | "einlagern" | "bestellungen" | "historie") => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "einlagern" as const, label: "Einlagern", icon: Package },
    { id: "bestellungen" as const, label: "Bestellungen", icon: ShoppingCart },
    { id: "historie" as const, label: "Historie", icon: History },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mt-6 bg-muted/50 p-2 rounded-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-2"
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
