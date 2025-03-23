import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Home, Users, Package, Calendar, CreditCard, Settings, LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - Red Sea Quest",
  description: "Admin dashboard for Red Sea Quest",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold">
            Red Sea Quest
          </Link>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Main</div>
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/tours" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Package className="h-5 w-5 mr-3" />
            Tours
          </Link>
          <Link href="/admin/bookings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Calendar className="h-5 w-5 mr-3" />
            Bookings
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Users className="h-5 w-5 mr-3" />
            Users
          </Link>
          <Link href="/admin/payments" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <CreditCard className="h-5 w-5 mr-3" />
            Payments
          </Link>

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-400 uppercase">Settings</div>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
          <Link href="/logout" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                <span className="mr-2">Admin User</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

