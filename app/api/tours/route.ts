import { type NextRequest, NextResponse } from "next/server"
import { tourOperations } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined
    const vendor_id = searchParams.get("vendor_id") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const filters: Record<string, any> = {}
    if (category) filters.category = category
    if (search) filters.search = search
    if (vendor_id) filters.vendor_id = Number.parseInt(vendor_id)
    if (limit) filters.limit = limit

    const tours = await tourOperations.getAll(filters)

    return NextResponse.json({ tours })
  } catch (error) {
    console.error("Error fetching tours:", error)
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.abstract || !data.description || !data.activity_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tour = await tourOperations.create(data)

    return NextResponse.json({ tour }, { status: 201 })
  } catch (error) {
    console.error("Error creating tour:", error)
    return NextResponse.json({ error: "Failed to create tour" }, { status: 500 })
  }
}

