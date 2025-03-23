import { notFound } from "next/navigation"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import { executeQuery } from "@/lib/db"

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

async function validateToken(token: string) {
  try {
    // Check if token exists and is valid
    const query = `
      SELECT user_id, expires_at
      FROM password_reset_tokens
      WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
    `

    const result = await executeQuery(query, [token])
    return result.length > 0
  } catch (error) {
    console.error("Token validation error:", error)
    return false
  }
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params

  // Validate token
  const isValid = await validateToken(token)

  if (!isValid) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ResetPasswordForm token={token} />
    </div>
  )
}

