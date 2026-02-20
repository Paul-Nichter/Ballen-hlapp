"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Loader2 } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { useState } from "react"

export function Dashboard() {
  const { inventory, selectedProduct, setSelectedProduct, updateInventory, isLoading } = useInventory()

  const products = [
    { id: "gerstenstroh", name: "Gerstenstroh", icon: "\uD83C\uDF3E", color: "bg-primary" },
    { id: "weizenstroh", name: "Weizenstroh", icon: "\uD83C\uDF3E", color: "bg-secondary" },
    { id: "heu", name: "Heu", icon: "\uD83C\uDF3F", color: "bg-accent" },
  ]

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})

  const handleCustomAdd = (productId: string) => {
    const amount = parseInt(customAmounts[productId] || "0")
    if (amount > 0) {
      updateInventory(productId, amount)
      setCustomAmounts((p) => ({ ...p, [productId]: "" }))
    }
  }

  const handleCustomSubtract = (productId: string) => {
    const amount = parseInt(customAmounts[productId] || "0")
    if (amount > 0) {
      updateInventory(productId, -amount)
      setCustomAmounts((p) => ({ ...p, [productId]: "" }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Bestand</h2>
        <p className="text-sm text-muted-foreground">Aktueller Lagerbestand an Strohballen</p>
      </div>

      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-3 text-foreground">{"Sensor-Einlagern (Taste 'B')"}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {"Wähle das Produkt aus, das beim Drücken der Taste 'B' hinzugefügt wird"}
        </p>
        <div className="flex gap-2">
          {products.map((product) => (
            <Button
              key={product.id}
              variant={selectedProduct === product.id ? "default" : "outline"}
              onClick={() => setSelectedProduct(product.id)}
              className="flex-1"
            >
              {product.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {"Aktuell ausgewählt: "}
          <span className="font-semibold">{products.find((p) => p.id === selectedProduct)?.name}</span>
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{product.icon}</span>
              <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
            </div>
            <p className="text-4xl font-bold text-center mb-2 text-primary">
              {inventory[product.id] ?? 0}
            </p>
            <p className="text-sm text-muted-foreground text-center mb-4">Ballen verfügbar</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => updateInventory(product.id, -1)}>
                <Minus className="h-4 w-4 mr-1" />
                -1
              </Button>
              <Button variant="outline" size="sm" onClick={() => updateInventory(product.id, -10)}>
                <Minus className="h-4 w-4 mr-1" />
                -10
              </Button>
              <Button variant="default" size="sm" onClick={() => updateInventory(product.id, 1)} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-1" />
                +1
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => updateInventory(product.id, 10)}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1" />
                +10
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Anzahl"
                className="flex-1"
                value={customAmounts[product.id] || ""}
                onChange={(e) => setCustomAmounts((p) => ({ ...p, [product.id]: e.target.value }))}
              />
              <Button variant="outline" size="icon" onClick={() => handleCustomSubtract(product.id)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" className="bg-primary text-primary-foreground" onClick={() => handleCustomAdd(product.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
