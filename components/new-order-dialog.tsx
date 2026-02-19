"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import type { BaleType } from "@/lib/types"

interface NewOrderDialogProps {
  onCreateOrder: (order: {
    customerName: string
    baleType: BaleType
    quantity: number
    orderDate: string
    pickupDate: string
    deliveryPreferred: boolean
    isPreOrder: boolean
  }) => void
}

export function NewOrderDialog({ onCreateOrder }: NewOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [baleType, setBaleType] = useState<BaleType>("barley")
  const [quantity, setQuantity] = useState("")
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [pickupDate, setPickupDate] = useState("")
  const [deliveryPreferred, setDeliveryPreferred] = useState(false)
  const [isPreOrder, setIsPreOrder] = useState(false)

  const handleSubmit = () => {
    if (!customerName || !quantity || !pickupDate) return

    onCreateOrder({
      customerName,
      baleType,
      quantity: Number.parseInt(quantity),
      orderDate,
      pickupDate,
      deliveryPreferred,
      isPreOrder,
    })

    setCustomerName("")
    setQuantity("")
    setPickupDate("")
    setDeliveryPreferred(false)
    setIsPreOrder(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Bestellung
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Bestellung erstellen</DialogTitle>
          <DialogDescription>Füge eine neue Kundenbestellung hinzu</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Kundenname</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Ballentyp</Label>
            <Select value={baleType} onValueChange={(value) => setBaleType(value as BaleType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barley">Gerstenstroh</SelectItem>
                <SelectItem value="wheat">Weizenstroh</SelectItem>
                <SelectItem value="hay">Heu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Menge</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              min="1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="orderDate">Bestelldatum</Label>
            <Input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pickupDate">Abholdatum</Label>
            <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery"
              checked={deliveryPreferred}
              onCheckedChange={(checked) => setDeliveryPreferred(checked as boolean)}
            />
            <Label htmlFor="delivery" className="cursor-pointer">
              Zuvor gewünscht
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preorder"
              checked={isPreOrder}
              onCheckedChange={(checked) => setIsPreOrder(checked as boolean)}
            />
            <Label htmlFor="preorder" className="cursor-pointer">
              Vorbestellung (bei nicht ausreichendem Bestand)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Bestellung erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
