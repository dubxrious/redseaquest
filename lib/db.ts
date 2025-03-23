import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// The error indicates that the connection string is not being properly formed
// Let's directly use the NEON_DATABASE_URL environment variable which should be properly formatted
const sql = neon(process.env.NEON_DATABASE_URL!)
export const db = drizzle(sql)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

