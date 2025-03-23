import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Schema validation for reset password
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Check if token exists and is valid
    const tokenQuery = `
      SELECT user_id, expires_at
      FROM password_reset_tokens
      WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
    `

    const tokens = await executeQuery(tokenQuery, [validatedData.token])

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const userId = tokens[0].user_id

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update user password
    const updatePasswordQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `

    await executeQuery(updatePasswordQuery, [hashedPassword, userId])

    // Delete the token
    const deleteTokenQuery = `
      DELETE FROM password_reset_tokens
      WHERE user_id = $1
    `

    await executeQuery(deleteTokenQuery, [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}

