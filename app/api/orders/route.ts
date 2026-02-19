import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: body.customer_name,
        bale_type: body.bale_type,
        quantity: body.quantity,
        status: "pending",
        order_date: body.order_date,
        pickup_date: body.pickup_date,
        delivery_preferred: body.delivery_preferred,
        is_pre_order: body.is_pre_order,
      })
      .select()
      .single()

    if (error) throw error

    // Add history entry
    await supabase.from("history").insert({
      action: "order_created",
      details: `Bestellung erstellt: ${body.customer_name} - ${body.quantity}x ${body.bale_type}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
