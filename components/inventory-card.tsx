"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import type { BaleType } from "@/lib/types"

interface InventoryCardProps {
  title: string
  type: BaleType
  quantity: number
  onUpdate: (type: BaleType, amount: number) => Promise<void>
}

export function InventoryCard({ title, type, quantity, onUpdate }: InventoryCardProps) {
  const [customAmount, setCustomAmount] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (amount: number) => {
    setIsUpdating(true)
    try {
      await onUpdate(type, amount)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCustomUpdate = async (isAdd: boolean) => {
    const amount = Number.parseInt(customAmount)
    if (isNaN(amount) || amount <= 0) return

    await handleUpdate(isAdd ? amount : -amount)
    setCustomAmount("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary">{quantity || 0}</div>
          <p className="text-muted-foreground mt-2">Ballen</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleUpdate(1)} disabled={isUpdating} size="lg" className="flex-1">
            +1
          </Button>
          <Button onClick={() => handleUpdate(10)} disabled={isUpdating} size="lg" className="flex-1">
            +10
          </Button>
          <Button
            onClick={() => handleUpdate(-1)}
            disabled={isUpdating || quantity === 0}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            -1
          </Button>
          <Button
            onClick={() => handleUpdate(-10)}
            disabled={isUpdating || quantity === 0}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            -10
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Eigene Menge"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
          />
          <div className="flex gap-2">
            <Button onClick={() => handleCustomUpdate(true)} disabled={!customAmount || isUpdating} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
            <Button
              onClick={() => handleCustomUpdate(false)}
              disabled={!customAmount || isUpdating || quantity === 0}
              variant="outline"
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-2" />
              Abziehen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
