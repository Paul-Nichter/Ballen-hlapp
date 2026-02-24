"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Calendar, CheckCircle, XCircle, Plus, Loader2, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/lib/inventory-context"
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf"
import useSWR from "swr"
import { useState } from "react"

type OrderItem = {
  product: string
  quantity: number
  price_per_unit: number
}

type Order = {
  id: string
  customer: string
  product: string
  quantity: number
  order_date: string
  delivery_date: string
  status: string
  is_preorder: boolean
  preferred: boolean
  notes: string | null
  invoice_number: string | null
  customer_address: string | null
  price_per_unit: number | null
  items: OrderItem[] | null
}

function getOrderItems(order: Order): OrderItem[] {
  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    return order.items
  }
  return [{ product: order.product, quantity: order.quantity, price_per_unit: order.price_per_unit ?? 2.5 }]
}

const PRODUCT_OPTIONS = [
  { value: "Gerstenstroh", label: "Gerstenstroh" },
  { value: "Weizenstroh", label: "Weizenstroh" },
  { value: "Heu", label: "Heu" },
  { value: "Großballen Heu", label: "Großballen Heu" },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Bestellungen() {
  const { data: orders, isLoading, mutate } = useSWR<Order[]>("/api/orders", fetcher, { refreshInterval: 5000 })
  const { refreshAll, inventory } = useInventory()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customer: "",
    delivery_date: "",
    is_preorder: false,
    notes: "",
    customer_address: "",
  })

  const [formItems, setFormItems] = useState<OrderItem[]>([
    { product: "Weizenstroh", quantity: 1, price_per_unit: 2.5 },
  ])

  const addItem = () => {
    setFormItems((prev) => [...prev, { product: "Weizenstroh", quantity: 1, price_per_unit: 2.5 }])
  }

  const removeItem = (index: number) => {
    if (formItems.length <= 1) return
    setFormItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const activeOrders = orders?.filter((o) => !o.is_preorder) ?? []
  const preOrders = orders?.filter((o) => o.is_preorder) ?? []

  const canFulfill = (order: Order) => {
    const items = getOrderItems(order)
    return items.every((item) => {
      const productKey = item.product.toLowerCase().replace("ö", "oe").replace("ü", "ue").replace("ä", "ae")
      const mapping: Record<string, string> = {
        gerstenstroh: "gerstenstroh",
        weizenstroh: "weizenstroh",
        heu: "heu",
      }
      const invKey = mapping[productKey] ?? productKey
      // Products not tracked in inventory (like Großballen Heu) can always be fulfilled
      if (!(invKey in inventory)) return true
      return (inventory[invKey] ?? 0) >= item.quantity
    })
  }

  const handleFulfill = async (id: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "fulfill" }),
      })
      mutate()
      refreshAll()
      toast({ title: "Bestellung ausgeführt", description: "Bestellung wurde erfolgreich abgeschlossen" })
    } catch {
      toast({ title: "Fehler", description: "Konnte Bestellung nicht ausführen", variant: "destructive" })
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "cancel" }),
      })
      mutate()
      refreshAll()
      toast({ title: "Bestellung storniert", description: "Bestellung wurde storniert" })
    } catch {
      toast({ title: "Fehler", description: "Konnte Bestellung nicht stornieren", variant: "destructive" })
    }
  }

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const today = new Date()
      const invoiceDate = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`
      const items = getOrderItems(order)

      const pdfBlob = await generateInvoicePDF({
        invoiceNumber: order.invoice_number || "---",
        invoiceDate,
        customer: order.customer,
        customerAddress: order.customer_address || "",
        items,
      })

      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Rechnung_${order.invoice_number?.replace("/", "_") || order.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: "Fehler", description: "Konnte Rechnung nicht erstellen", variant: "destructive" })
    }
  }

  const handleSubmit = async () => {
    if (!formData.customer || !formData.delivery_date) {
      toast({ title: "Fehler", description: "Bitte alle Pflichtfelder ausfüllen", variant: "destructive" })
      return
    }
    if (formItems.some((item) => !item.product || item.quantity < 1)) {
      toast({ title: "Fehler", description: "Bitte alle Produkte korrekt ausfüllen", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const today = new Date()
      const orderDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData.customer,
          items: formItems,
          order_date: orderDate,
          delivery_date: formData.delivery_date,
          is_preorder: formData.is_preorder,
          notes: formData.notes || null,
          customer_address: formData.customer_address || null,
        }),
      })
      mutate()
      refreshAll()
      setShowForm(false)
      setFormData({ customer: "", delivery_date: "", is_preorder: false, notes: "", customer_address: "" })
      setFormItems([{ product: "Weizenstroh", quantity: 1, price_per_unit: 2.5 }])
      toast({ title: "Bestellung erstellt", description: "Neue Bestellung wurde hinzugefügt" })
    } catch {
      toast({ title: "Fehler", description: "Konnte Bestellung nicht erstellen", variant: "destructive" })
    } finally {
      setSubmitting(false)
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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Bestellungen</h2>
          <p className="text-sm text-muted-foreground">Aktive und ausstehende Bestellungen</p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Bestellung
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Neue Bestellung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Kundenname *</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData((p) => ({ ...p, customer: e.target.value }))}
                placeholder="Name des Kunden"
              />
            </div>
            <div>
              <Label htmlFor="delivery_date">Abholung Datum *</Label>
              <Input
                id="delivery_date"
                value={formData.delivery_date}
                onChange={(e) => setFormData((p) => ({ ...p, delivery_date: e.target.value }))}
                placeholder="z.B. 15.3.2026"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_preorder"
                checked={formData.is_preorder}
                onChange={(e) => setFormData((p) => ({ ...p, is_preorder: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_preorder">Vorbestellung</Label>
            </div>
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optionale Notizen"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="customer_address">Kundenadresse (für Rechnung)</Label>
              <textarea
                id="customer_address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                value={formData.customer_address}
                onChange={(e) => setFormData((p) => ({ ...p, customer_address: e.target.value }))}
                placeholder={"z.B. Trakehnerzucht\nJessica Dietz\nBergwiesenäcker 14\n72160 Horb am Neckar"}
              />
            </div>
          </div>

          {/* Multi-item section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Produkte</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Produkt hinzufügen
              </Button>
            </div>
            <div className="space-y-3">
              {formItems.map((item, index) => (
                <div key={index} className="flex items-end gap-3 rounded-lg border border-border p-3 bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`product-${index}`} className="text-xs text-muted-foreground">Produkt</Label>
                    <select
                      id={`product-${index}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                      value={item.product}
                      onChange={(e) => updateItem(index, "product", e.target.value)}
                    >
                      {PRODUCT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`quantity-${index}`} className="text-xs text-muted-foreground">Menge</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`price-${index}`} className="text-xs text-muted-foreground">{"Preis/Ballen (\u20AC)"}</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min={0}
                      step={0.1}
                      value={item.price_per_unit}
                      onChange={(e) => updateItem(index, "price_per_unit", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={formItems.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Produkt entfernen</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Erstellen
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Abbrechen
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Aktive Bestellungen</h3>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine aktiven Bestellungen</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeOrders.map((order) => {
              const items = getOrderItems(order)
              return (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">{order.customer}</h4>
                    </div>
                    <Badge variant="secondary">Ausstehend</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    {items.map((item, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-lg">{item.product === "Heu" || item.product === "Großballen Heu" ? "\uD83C\uDF3F" : "\uD83C\uDF3E"}</span>
                        {item.quantity}x {item.product} ({item.price_per_unit.toFixed(2)} {"\u20AC/Stk"})
                      </p>
                    ))}
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Bestellt: {order.order_date}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Abholung: {order.delivery_date}
                    </p>
                    {order.preferred && <p className="text-sm text-muted-foreground">Zuvor gewünscht</p>}
                  </div>
                  {canFulfill(order) && (
                    <p className="text-sm text-primary font-medium mb-4 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Kann ausgeführt werden
                    </p>
                  )}
                  {order.invoice_number && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Rechnung: {order.invoice_number}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => handleFulfill(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ausführen
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleCancel(order.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Stornieren
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Rechnung PDF
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Vorbestellungen</h3>
        {preOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Vorbestellungen</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {preOrders.map((order) => {
              const items = getOrderItems(order)
              return (
                <Card
                  key={order.id}
                  className="p-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">{order.customer}</h4>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary">Ausstehend</Badge>
                      <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                        Vorbestellung
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {items.map((item, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-lg">{item.product === "Heu" || item.product === "Großballen Heu" ? "\uD83C\uDF3F" : "\uD83C\uDF3E"}</span>
                        {item.quantity}x {item.product} ({item.price_per_unit.toFixed(2)} {"\u20AC/Stk"})
                      </p>
                    ))}
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Bestellt: {order.order_date}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Abholung: {order.delivery_date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => handleFulfill(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ausführen
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleCancel(order.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Stornieren
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Rechnung PDF
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
