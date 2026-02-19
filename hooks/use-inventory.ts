import useSWR from "swr"
import type { Inventory } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useInventory() {
  const { data, error, mutate } = useSWR<Inventory[]>("/api/inventory", fetcher, {
    refreshInterval: 3000,
  })

  const updateInventory = async (baleType: string, amount: number) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baleType, amount }),
      })

      if (!response.ok) throw new Error("Failed to update inventory")

      await mutate()
      return await response.json()
    } catch (error) {
      console.error("Error updating inventory:", error)
      throw error
    }
  }

  return {
    inventory: data || [],
    isLoading: !error && !data,
    isError: error,
    updateInventory,
    mutate,
  }
}
