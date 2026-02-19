"use client"

import { InventoryCard } from "./inventory-card"
import { useInventory } from "@/hooks/use-inventory"
import type { BaleType } from "@/lib/types"

export function InventoryDashboard() {
  const { inventory, updateInventory } = useInventory()

  const getQuantity = (type: BaleType) => {
    return inventory.find((item) => item.bale_type === type)?.quantity || 0
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <InventoryCard title="Gerstenstroh" type="barley" quantity={getQuantity("barley")} onUpdate={updateInventory} />
      <InventoryCard title="Weizenstroh" type="wheat" quantity={getQuantity("wheat")} onUpdate={updateInventory} />
      <InventoryCard title="Heu" type="hay" quantity={getQuantity("hay")} onUpdate={updateInventory} />
    </div>
  )
}
