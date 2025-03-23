import { hash, compare } from "bcrypt"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { executeQuery } from "./db"

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"
const TOKEN_EXPIRY = "7d" // 7 days

// User types
export type UserRole = "customer" | "vendor" | "admin"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: UserRole
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

// Compare a password with a hash
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Generate a JWT token
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  return sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

// Verify a JWT token
export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Get the current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  try {
    const query = `SELECT id, email, first_name, last_name, role FROM users WHERE id = $1`
    const result = await executeQuery(query, [decoded.id])

    if (result.length === 0) return null

    return result[0] as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Check if the current user has a specific role
export async function hasRole(roles: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  if (Array.isArray(roles)) {
    return roles.includes(user.role)
  }

  return user.role === roles
}

// Create a middleware to protect routes
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

// Create a middleware to protect routes by role
export async function requireRole(roles: UserRole | UserRole[]) {
  const user = await requireAuth()

  if (Array.isArray(roles)) {
    if (!roles.includes(user.role)) {
      throw new Error("Unauthorized")
    }
  } else if (user.role !== roles) {
    throw new Error("Unauthorized")
  }

  return user
}

