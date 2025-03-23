"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)

    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to process your request. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center">Password Reset Email Sent</h1>

        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
          <p>
            If there is an account associated with {email}, you will receive an email with instructions to reset your
            password.
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>

      <p className="mb-4 text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-blue-600 hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  )
}

