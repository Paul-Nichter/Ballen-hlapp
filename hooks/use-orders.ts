"use client"

import useSWR from "swr"
import type { Order, BaleType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useOrders() {
  const { data, error, mutate } = useSWR<Order[]>("/api/orders", fetcher, {
    refreshInterval: 3000,
  })

  const createOrder = async (order: {
    customerName: string
    baleType: BaleType
    quantity: number
    orderDate: string
    pickupDate: string
    deliveryPreferred: boolean
    isPreOrder: boolean
  }) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })

      if (!response.ok) throw new Error("Failed to create order")

      await mutate()
      return await response.json()
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  const completeOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })

      if (!response.ok) throw new Error("Failed to complete order")

      await mutate()
      return await response.json()
    } catch (error) {
      console.error("Error completing order:", error)
      throw error
    }
  }

  const cancelOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!response.ok) throw new Error("Failed to cancel order")

      await mutate()
      return await response.json()
    } catch (error) {
      console.error("Error cancelling order:", error)
      throw error
    }
  }

  const activeOrders = data?.filter((o) => o.status === "pending") || []
  const completedOrders = data?.filter((o) => o.status === "completed" || o.status === "cancelled") || []

  return {
    orders: activeOrders,
    completedOrders,
    isLoading: !error && !data,
    isError: error,
    createOrder,
    completeOrder,
    cancelOrder,
    mutate,
  }
}
