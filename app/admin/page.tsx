import Link from "next/link"
import { Users, Package, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { executeQuery } from "@/lib/db"

async function getDashboardStats() {
  try {
    // Get total tours
    const toursQuery = "SELECT COUNT(*) as total FROM tours"
    const toursResult = await executeQuery(toursQuery)
    const totalTours = Number.parseInt(toursResult[0].total)

    // Get total users
    const usersQuery = "SELECT COUNT(*) as total FROM users"
    const usersResult = await executeQuery(usersQuery)
    const totalUsers = Number.parseInt(usersResult[0].total)

    // Get total bookings
    const bookingsQuery = "SELECT COUNT(*) as total FROM bookings"
    const bookingsResult = await executeQuery(bookingsQuery)
    const totalBookings = Number.parseInt(bookingsResult[0].total)

    // Get recent bookings
    const recentBookingsQuery = `
      SELECT b.id, b.booking_number, b.total_price, b.status, b.booking_date,
        t.abstract as tour_name, u.email as user_email
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.booking_date DESC
      LIMIT 5
    `
    const recentBookings = await executeQuery(recentBookingsQuery)

    // Get popular tours
    const popularToursQuery = `
      SELECT t.id, t.abstract, COUNT(b.id) as booking_count
      FROM tours t
      JOIN bookings b ON t.id = b.tour_id
      GROUP BY t.id, t.abstract
      ORDER BY booking_count DESC
      LIMIT 5
    `
    const popularTours = await executeQuery(popularToursQuery)

    return {
      totalTours,
      totalUsers,
      totalBookings,
      recentBookings,
      popularTours,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalTours: 0,
      totalUsers: 0,
      totalBookings: 0,
      recentBookings: [],
      popularTours: [],
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Tours</p>
              <h3 className="text-2xl font-bold">{stats.totalTours}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              12%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              8%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              24%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Revenue</p>
              <h3 className="text-2xl font-bold">$12,628</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              3%
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:underline">
                        {booking.booking_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.tour_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.total_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Link href="/admin/bookings" className="text-sm text-blue-600 hover:underline">
            View all bookings
          </Link>
        </div>
      </div>

      {/* Popular tours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Popular Tours</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.popularTours.length > 0 ? (
                stats.popularTours.map((tour: any) => (
                  <tr key={tour.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/tours/${tour.id}`} className="text-blue-600 hover:underline">
                        {tour.abstract}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tour.booking_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 20) + 5}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No popular tours found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Link href="/admin/tours" className="text-sm text-blue-600 hover:underline">
            View all tours
          </Link>
        </div>
      </div>
    </div>
  )
}

