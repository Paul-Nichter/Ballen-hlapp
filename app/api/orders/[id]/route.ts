import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    const supabase = await createClient()

    // Get the order first
    const { data: order, error: fetchError } = await supabase.from("orders").select("*").eq("id", id).single()

    if (fetchError) throw fetchError

    // If completing order, update inventory
    if (status === "completed") {
      const { data: inventory, error: invError } = await supabase
        .from("inventory")
        .select("*")
        .eq("bale_type", order.bale_type)
        .single()

      if (invError) throw invError

      // Check if enough inventory
      if (inventory.quantity < order.quantity) {
        return NextResponse.json({ error: "Not enough inventory" }, { status: 400 })
      }

      // Update inventory
      await supabase
        .from("inventory")
        .update({
          quantity: inventory.quantity - order.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("bale_type", order.bale_type)
    }

    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        completed_at: status === "completed" || status === "cancelled" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Add history entry
    await supabase.from("history").insert({
      action: status === "completed" ? "order_completed" : "order_cancelled",
      details: `Bestellung ${status === "completed" ? "abgeschlossen" : "storniert"}: ${order.customer_name} - ${order.quantity}x ${order.bale_type}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
