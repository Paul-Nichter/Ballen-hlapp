"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Wheat, Keyboard, Usb, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/lib/inventory-context"

export function Einlagern() {
  const { selectedProduct, setSelectedProduct, isPaused, updateInventory } = useInventory()
  const { toast } = useToast()

  const products = [
    { id: "gerstenstroh", name: "Gerstenstroh", icon: "🌾" },
    { id: "weizenstroh", name: "Weizenstroh", icon: "🌾" },
    { id: "heu", name: "Heu", icon: "🌿" },
  ]

  const handleManualAdd = () => {
    if (isPaused) {
      toast({
        title: "Einlagern pausiert",
        description: "Drücken Sie Strg+L zum Fortsetzen",
        variant: "destructive",
      })
      return
    }
    const product = products.find((p) => p.id === selectedProduct)
    updateInventory(selectedProduct, 1)
    toast({
      title: "Eingelagert",
      description: `1x ${product?.name} hinzugefügt`,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wheat className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Einlagern mit Sensor</h2>
          {isPaused && (
            <Badge variant="destructive" className="ml-auto">
              Pausiert (Strg+L)
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Wählen Sie das Produkt aus und verwenden Sie den Sensor, die Tastatur (Taste 'b') oder den manuellen Button
          zum Einlagern.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Produkt auswählen</h3>
            <RadioGroup value={selectedProduct} onValueChange={setSelectedProduct}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <RadioGroupItem value={product.id} id={product.id} />
                  <Label htmlFor={product.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                    <span className="text-2xl">{product.icon}</span>
                    <span className="font-medium">{product.name}</span>
                  </Label>
                  {selectedProduct === product.id && <Badge variant="secondary">Ausgewählt</Badge>}
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Eingabemethode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="default"
                className="h-auto py-4 flex-col gap-2 bg-primary"
                onClick={handleManualAdd}
                disabled={isPaused}
              >
                <Plus className="h-5 w-5" />
                <span>Manuell +1</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" disabled>
                <Usb className="h-5 w-5" />
                <span>Sensor verbinden</span>
              </Button>
              <Button variant={isPaused ? "destructive" : "default"} className="h-auto py-4 flex-col gap-2">
                <Keyboard className="h-5 w-5" />
                <span>Tastatur aktiv (Taste 'b')</span>
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">
              Tastatur-Modus aktiv - Drücken Sie 'b' auf jedem Tab für{" "}
              {products.find((p) => p.id === selectedProduct)?.name}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Verfügbare Eingabemethoden:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <span className="font-medium">Manuell:</span> Klicken Sie auf "Manuell +1" zum Einlagern
                </li>
                <li>
                  <span className="font-medium">Tastatur:</span> Drücken Sie die Taste 'b' auf jedem Tab (funktioniert
                  immer)
                </li>
                <li>
                  <span className="font-medium">Sensor (IRSW21A):</span> USB-Verbindung mit 9600 Baud (Chrome/Edge, nur
                  in Produktionsumgebung verfügbar)
                </li>
                <li className="font-semibold text-primary">
                  <span className="font-bold">Strg+L:</span> Einlagern pausieren/fortsetzen
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
