import { type NextRequest, NextResponse } from "next/server"
import { tourOperations } from "@/lib/db-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const tour = await tourOperations.getById(id)

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error fetching tour:", error)
    return NextResponse.json({ error: "Failed to fetch tour" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()

    // Validate required fields
    if (!data.abstract || !data.description || !data.activity_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tour = await tourOperations.update(id, data)

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error updating tour:", error)
    return NextResponse.json({ error: "Failed to update tour" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const success = await tourOperations.delete(id)

    if (!success) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tour:", error)
    return NextResponse.json({ error: "Failed to delete tour" }, { status: 500 })
  }
}

