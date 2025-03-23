import { type NextRequest, NextResponse } from "next/server"
import { paymentOperations } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const booking_id = searchParams.get("booking_id") || undefined
    const status = searchParams.get("status") || undefined
    const payment_method = searchParams.get("payment_method") || undefined
    const date_from = searchParams.get("date_from") || undefined
    const date_to = searchParams.get("date_to") || undefined
    const user_id = searchParams.get("user_id") || undefined
    const vendor_id = searchParams.get("vendor_id") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const filters: Record<string, any> = {}
    if (booking_id) filters.booking_id = Number.parseInt(booking_id)
    if (status) filters.status = status
    if (payment_method) filters.payment_method = payment_method
    if (date_from) filters.date_from = date_from
    if (date_to) filters.date_to = date_to
    if (user_id) filters.user_id = Number.parseInt(user_id)
    if (vendor_id) filters.vendor_id = Number.parseInt(vendor_id)
    if (limit) filters.limit = limit

    const payments = await paymentOperations.getAll(filters)

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.booking_id || !data.amount || !data.payment_method || !data.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payment = await paymentOperations.create(data)

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}

