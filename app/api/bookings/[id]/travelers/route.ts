import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = Number.parseInt(params.id)

    const query = `
      SELECT * FROM booking_travelers
      WHERE booking_id = $1
      ORDER BY is_lead DESC, id ASC
    `

    const travelers = await executeQuery(query, [bookingId])

    return NextResponse.json({ travelers })
  } catch (error) {
    console.error("Error fetching travelers:", error)
    return NextResponse.json({ error: "Failed to fetch travelers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = Number.parseInt(params.id)
    const data = await request.json()

    // Validate required fields
    if (!data.first_name || !data.last_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const query = `
      INSERT INTO booking_travelers (
        booking_id, first_name, last_name, email, phone, is_lead, traveler_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const params = [
      bookingId,
      data.first_name,
      data.last_name,
      data.email || null,
      data.phone || null,
      data.is_lead || false,
      data.traveler_type || "adult",
    ]

    const result = await executeQuery(query, params)
    const traveler = result[0]

    return NextResponse.json({ traveler }, { status: 201 })
  } catch (error) {
    console.error("Error creating traveler:", error)
    return NextResponse.json({ error: "Failed to create traveler" }, { status: 500 })
  }
}

