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
        customer_name: body.customerName,
        bale_type: body.baleType,
        quantity: body.quantity,
        status: "pending",
        order_date: body.orderDate,
        pickup_date: body.pickupDate,
        delivery_preferred: body.deliveryPreferred,
        is_pre_order: body.isPreOrder,
      })
      .select()
      .single()

    if (error) throw error

    // Add history entry
    await supabase.from("history").insert({
      action: "order_created",
      details: `Bestellung erstellt: ${body.customerName} - ${body.quantity}x ${body.baleType}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
