export type BaleType = "barley" | "wheat" | "hay"

export interface Inventory {
  id: string
  bale_type: BaleType
  quantity: number
  updated_at: string
}

export interface Order {
  id: string
  customer_name: string
  bale_type: BaleType
  quantity: number
  status: "pending" | "completed" | "cancelled"
  order_date: string
  pickup_date: string
  delivery_preferred: boolean
  is_pre_order: boolean
  created_at: string
}

export interface HistoryEntry {
  id: string
  action: string
  details: string
  timestamp: string
}

export interface AppData {
  inventory: Inventory[]
  orders: Order[]
  completedOrders: Order[]
  history: HistoryEntry[]
}
