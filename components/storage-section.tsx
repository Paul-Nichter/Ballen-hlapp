"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductSelector } from "./product-selector"
import type { BaleType } from "@/lib/types"

interface StorageSectionProps {
  selectedType: BaleType
  onTypeChange: (type: BaleType) => void
  onAddInventory: (type: BaleType) => void
  isPaused: boolean
}

export function StorageSection({ selectedType, onTypeChange, onAddInventory, isPaused }: StorageSectionProps) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sensor-Eingabe</CardTitle>
              <CardDescription>
                Drücke 'b' oder klicke den Button, um {getTypeName(selectedType)} hinzuzufügen
              </CardDescription>
            </div>
            <Badge variant={isPaused ? "destructive" : "default"}>{isPaused ? "Pausiert" : "Aktiv"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={() => onAddInventory(selectedType)} disabled={isPaused} size="lg" className="flex-1">
              +1 {getTypeName(selectedType)}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Tastenkombinationen: <kbd className="px-2 py-1 bg-muted rounded">b</kbd> zum Hinzufügen,{" "}
            <kbd className="px-2 py-1 bg-muted rounded">Strg+L</kbd> zum Pausieren
          </p>
        </CardContent>
      </Card>

      <ProductSelector selectedType={selectedType} onTypeChange={onTypeChange} />
    </div>
  )
}
