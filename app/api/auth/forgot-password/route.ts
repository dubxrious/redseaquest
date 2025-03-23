import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { executeQuery } from "@/lib/db"

// Schema validation for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Check if user exists
    const userQuery = "SELECT id FROM users WHERE email = $1"
    const users = await executeQuery(userQuery, [validatedData.email])

    if (users.length === 0) {
      // We don't want to reveal whether the email exists or not for security reasons
      // So we'll return a success response even if the email doesn't exist
      return NextResponse.json({ success: true })
    }

    const userId = users[0].id

    // Generate reset token (valid for 1 hour)
    const resetToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in the database
    const insertTokenQuery = `
      INSERT INTO password_reset_tokens (
        user_id, token, expires_at
      ) VALUES ($1, $2, $3)
      ON CONFLICT (user_id) 
      DO UPDATE SET token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP
    `

    await executeQuery(insertTokenQuery, [userId, resetToken, expiresAt])

    // In a real application, you would send an email here with the reset link
    // For this demo, we'll just log the token
    console.log(`Password reset token for user ${userId}: ${resetToken}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

