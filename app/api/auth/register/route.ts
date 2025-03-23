import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Schema validation for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if email already exists
    const existingUserQuery = "SELECT id FROM users WHERE email = $1"
    const existingUser = await executeQuery(existingUserQuery, [validatedData.email])

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, role
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role
    `

    const newUser = await executeQuery(insertUserQuery, [
      validatedData.email,
      hashedPassword,
      validatedData.first_name,
      validatedData.last_name,
      validatedData.phone || null,
      "customer", // Default role
    ])

    return NextResponse.json({ user: newUser[0] }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

