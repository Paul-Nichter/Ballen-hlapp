"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="orders">Bestellungen</TabsTrigger>
        <TabsTrigger value="history">Historie</TabsTrigger>
        <TabsTrigger value="storage">Einlagern</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
