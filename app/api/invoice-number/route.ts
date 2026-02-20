import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  // Get current counter
  const { data: counter, error: fetchError } = await supabase
    .from("invoice_counter")
    .select("*")
    .eq("id", 1)
    .single()

  if (fetchError || !counter) {
    return NextResponse.json({ error: "Counter not found" }, { status: 500 })
  }

  const nextNumber = counter.current_number + 1
  const year = counter.year
  const invoiceNumber = `${year}/${String(nextNumber).padStart(2, "0")}`

  // Update counter
  const { error: updateError } = await supabase
    .from("invoice_counter")
    .update({ current_number: nextNumber })
    .eq("id", 1)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ invoiceNumber })
}
