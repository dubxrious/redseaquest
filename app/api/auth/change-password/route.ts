import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { executeQuery } from "@/lib/db"
import { getCurrentUser, comparePassword, hashPassword } from "@/lib/auth"

// Schema validation for password change
const changePasswordSchema = z.object({
  current_password: z.string(),
  new_password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = changePasswordSchema.parse(body)

    // Get current password hash
    const passwordQuery = "SELECT password_hash FROM users WHERE id = $1"
    const result = await executeQuery(passwordQuery, [user.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentPasswordHash = result[0].password_hash

    // Verify current password
    const passwordMatch = await comparePassword(validatedData.current_password, currentPasswordHash)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validatedData.new_password)

    // Update password
    const updatePasswordQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `

    await executeQuery(updatePasswordQuery, [newPasswordHash, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}

