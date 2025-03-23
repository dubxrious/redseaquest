import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AccountProfile from "@/components/account-profile"

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <AccountProfile user={user} />
      </div>
    </div>
  )
}

