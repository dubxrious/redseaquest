"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    async function handleLogout() {
      await logout()
      router.push("/")
    }

    handleLogout()
  }, [logout, router])

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="inline-block p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Logging Out</h1>
        <p className="text-gray-600">Please wait while we log you out...</p>
      </div>
    </div>
  )
}

