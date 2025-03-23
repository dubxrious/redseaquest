import { type NextRequest, NextResponse } from "next/server"
import { availabilityOperations } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tourId = searchParams.get("tourId")
    const date = searchParams.get("date")

    if (!tourId || !date) {
      return NextResponse.json({ error: "Tour ID and date are required" }, { status: 400 })
    }

    const slots = await availabilityOperations.getAvailableSlots(Number.parseInt(tourId), date)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.tour_id || !data.date || !data.start_time || !data.max_spots || !data.price_adult) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const availability = await availabilityOperations.create(data)

    return NextResponse.json({ availability }, { status: 201 })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json({ error: "Failed to create availability" }, { status: 500 })
  }
}

