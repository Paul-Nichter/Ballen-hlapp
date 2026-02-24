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
  const { customer, items, order_date, delivery_date, notes, is_preorder, preferred, customer_address } = body

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

  // For backward compatibility, store first item in legacy columns
  const firstItem = items && items.length > 0 ? items[0] : null

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer,
      product: firstItem?.product || "Stroh",
      quantity: firstItem?.quantity || 0,
      price_per_unit: firstItem?.price_per_unit || 2.5,
      items: items || [],
      order_date,
      delivery_date,
      notes: notes || null,
      is_preorder: is_preorder || false,
      preferred: preferred || false,
      status: "ausstehend",
      invoice_number: invoiceNumber,
      customer_address: customer_address || null,
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

  // Resolve items: use new items column, or fall back to legacy single-product columns
  const orderItems = order.items && Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ product: order.product, quantity: order.quantity, price_per_unit: order.price_per_unit }]

  if (action === "fulfill") {
    // Deduct from inventory for each item
    for (const item of orderItems) {
      const { data: inv } = await supabase
        .from("inventory")
        .select("*")
        .eq("name", item.product)
        .single()

      if (inv) {
        await supabase
          .from("inventory")
          .update({
            quantity: Math.max(0, inv.quantity - item.quantity),
            updated_at: new Date().toISOString(),
          })
          .eq("id", inv.id)
      }
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
      items: orderItems,
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
      items: orderItems,
    })

    // Delete from active orders
    await supabase.from("orders").delete().eq("id", id)
  }

  return NextResponse.json({ success: true })
}
