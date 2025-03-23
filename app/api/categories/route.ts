import { type NextRequest, NextResponse } from "next/server"
import { categoryOperations } from "@/lib/db-utils"

export async function GET() {
  try {
    const categories = await categoryOperations.getAll()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const category = await categoryOperations.create(data)

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

