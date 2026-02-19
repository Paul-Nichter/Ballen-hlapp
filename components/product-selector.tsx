"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BaleType } from "@/lib/types"

interface ProductSelectorProps {
  selectedType: BaleType
  onTypeChange: (type: BaleType) => void
}

export function ProductSelector({ selectedType, onTypeChange }: ProductSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produktauswahl</CardTitle>
        <CardDescription>Wähle das Produkt, das beim Drücken der 'b'-Taste hinzugefügt wird</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedType} onValueChange={(value) => onTypeChange(value as BaleType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="barley" id="barley" />
            <Label htmlFor="barley" className="cursor-pointer">
              Gerstenstroh
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wheat" id="wheat" />
            <Label htmlFor="wheat" className="cursor-pointer">
              Weizenstroh
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hay" id="hay" />
            <Label htmlFor="hay" className="cursor-pointer">
              Heu
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
