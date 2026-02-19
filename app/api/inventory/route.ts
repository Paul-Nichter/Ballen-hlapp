import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("inventory").select("*").order("bale_type")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { baleType, amount } = await request.json()
    const supabase = await createClient()

    // Get current inventory
    const { data: current, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("bale_type", baleType)
      .single()

    if (fetchError) throw fetchError

    // Update inventory
    const newQuantity = Math.max(0, current.quantity + amount)
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("bale_type", baleType)
      .select()
      .single()

    if (error) throw error

    // Add history entry
    await supabase.from("history").insert({
      action: amount > 0 ? "inventory_increase" : "inventory_decrease",
      details: `${baleType}: ${amount > 0 ? "+" : ""}${amount} (Neuer Bestand: ${newQuantity})`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 })
  }
}
