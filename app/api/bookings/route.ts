import { type NextRequest, NextResponse } from "next/server"
import { bookingOperations } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get("user_id") || undefined
    const tour_id = searchParams.get("tour_id") || undefined
    const status = searchParams.get("status") || undefined
    const payment_status = searchParams.get("payment_status") || undefined
    const date_from = searchParams.get("date_from") || undefined
    const date_to = searchParams.get("date_to") || undefined
    const vendor_id = searchParams.get("vendor_id") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const filters: Record<string, any> = {}
    if (user_id) filters.user_id = Number.parseInt(user_id)
    if (tour_id) filters.tour_id = Number.parseInt(tour_id)
    if (status) filters.status = status
    if (payment_status) filters.payment_status = payment_status
    if (date_from) filters.date_from = date_from
    if (date_to) filters.date_to = date_to
    if (vendor_id) filters.vendor_id = Number.parseInt(vendor_id)
    if (limit) filters.limit = limit

    const bookings = await bookingOperations.getAll(filters)

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.tour_id || !data.availability_id || data.adults === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const booking = await bookingOperations.create(data)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

