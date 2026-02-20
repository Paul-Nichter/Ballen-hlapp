import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { customer, product, quantity, order_date, delivery_date, notes, is_preorder, preferred, price_per_unit, customer_address } = body

  // Generate invoice number
  const { data: counter, error: counterFetchError } = await supabase
    .from("invoice_counter")
    .select("*")
    .eq("id", 1)
    .single()

  let invoiceNumber = null
  if (!counterFetchError && counter) {
    const nextNumber = counter.current_number + 1
    invoiceNumber = `${counter.year}/${String(nextNumber).padStart(2, "0")}`
    await supabase
      .from("invoice_counter")
      .update({ current_number: nextNumber })
      .eq("id", 1)
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer,
      product,
      quantity,
      order_date,
      delivery_date,
      notes: notes || null,
      is_preorder: is_preorder || false,
      preferred: preferred || false,
      status: "ausstehend",
      invoice_number: invoiceNumber,
      customer_address: customer_address || null,
      price_per_unit: price_per_unit || 2.5,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, action } = body

  // Get the order first
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (action === "fulfill") {
    // Deduct from inventory
    const { data: inv } = await supabase
      .from("inventory")
      .select("*")
      .eq("name", order.product)
      .single()

    if (inv) {
      await supabase
        .from("inventory")
        .update({
          quantity: Math.max(0, inv.quantity - order.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inv.id)
    }

    // Move to history as completed
    await supabase.from("order_history").insert({
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      status: "abgeschlossen",
      invoice_number: order.invoice_number,
      customer_address: order.customer_address,
      price_per_unit: order.price_per_unit,
    })

    // Delete from active orders
    await supabase.from("orders").delete().eq("id", id)
  }

  if (action === "cancel") {
    // Move to history as cancelled
    await supabase.from("order_history").insert({
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      status: "storniert",
      invoice_number: order.invoice_number,
      customer_address: order.customer_address,
      price_per_unit: order.price_per_unit,
    })

    // Delete from active orders
    await supabase.from("orders").delete().eq("id", id)
  }

  return NextResponse.json({ success: true })
}
