import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import ChangePasswordForm from "@/components/auth/change-password-form"

export default async function ChangePasswordPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      <div className="max-w-md mx-auto">
        <ChangePasswordForm />
      </div>
    </div>
  )
}

