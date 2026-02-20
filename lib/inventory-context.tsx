"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import useSWR, { mutate as globalMutate } from "swr"

type InventoryItem = {
  id: string
  name: string
  quantity: number
  updated_at: string
}

type InventoryContextType = {
  inventory: Record<string, number>
  selectedProduct: string
  isPaused: boolean
  isLoading: boolean
  setSelectedProduct: (product: string) => void
  updateInventory: (productId: string, amount: number) => void
  togglePause: () => void
  refreshAll: () => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { data: inventoryData, isLoading } = useSWR<InventoryItem[]>("/api/inventory", fetcher, {
    refreshInterval: 5000,
  })

  const [selectedProduct, setSelectedProduct] = useState("gerstenstroh")
  const [isPaused, setIsPaused] = useState(false)
  const { toast } = useToast()

  const products = [
    { id: "gerstenstroh", name: "Gerstenstroh" },
    { id: "weizenstroh", name: "Weizenstroh" },
    { id: "heu", name: "Heu" },
  ]

  const inventory: Record<string, number> = {
    gerstenstroh: 0,
    weizenstroh: 0,
    heu: 0,
  }

  if (inventoryData) {
    for (const item of inventoryData) {
      inventory[item.id] = item.quantity
    }
  }

  const updateInventory = useCallback(
    async (productId: string, amount: number) => {
      const currentQty = inventory[productId] ?? 0
      const newQty = Math.max(0, currentQty + amount)

      // Optimistic update
      globalMutate(
        "/api/inventory",
        (current: InventoryItem[] | undefined) =>
          current?.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item)),
        false
      )

      try {
        await fetch("/api/inventory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: productId, quantity: newQty }),
        })
        globalMutate("/api/inventory")
      } catch {
        globalMutate("/api/inventory")
        toast({
          title: "Fehler",
          description: "Inventar konnte nicht aktualisiert werden",
          variant: "destructive",
        })
      }
    },
    [inventory, toast]
  )

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newState = !prev
      toast({
        title: newState ? "Einlagern pausiert" : "Einlagern fortgesetzt",
        description: newState ? "Drücken Sie Strg+L zum Fortsetzen" : "Einlagern ist jetzt aktiv",
      })
      return newState
    })
  }, [toast])

  const refreshAll = useCallback(() => {
    globalMutate("/api/inventory")
    globalMutate("/api/orders")
    globalMutate("/api/history")
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault()
        togglePause()
      }

      if (e.key.toLowerCase() === "b" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeElement = document.activeElement
        const isInput =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLSelectElement
        if (isInput) return

        e.preventDefault()

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
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedProduct, isPaused, togglePause, updateInventory, toast])

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        selectedProduct,
        isPaused,
        isLoading,
        setSelectedProduct,
        updateInventory,
        togglePause,
        refreshAll,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
