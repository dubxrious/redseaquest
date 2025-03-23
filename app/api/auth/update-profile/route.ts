import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { executeQuery } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Schema validation for profile update
const updateProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Check if email is changed and already exists
    if (validatedData.email !== user.email) {
      const existingUserQuery = "SELECT id FROM users WHERE email = $1 AND id != $2"
      const existingUser = await executeQuery(existingUserQuery, [validatedData.email, user.id])

      if (existingUser.length > 0) {
        return NextResponse.json({ error: "Email already in use by another account" }, { status: 400 })
      }
    }

    // Update user profile
    const updateUserQuery = `
      UPDATE users
      SET 
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, first_name, last_name, role
    `

    const updatedUser = await executeQuery(updateUserQuery, [
      validatedData.first_name,
      validatedData.last_name,
      validatedData.email,
      validatedData.phone || null,
      user.id,
    ])

    return NextResponse.json({ user: updatedUser[0] })
  } catch (error) {
    console.error("Update profile error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

