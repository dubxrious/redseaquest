import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"

async function getUserBookings(userId: number) {
  try {
    const query = `
      SELECT b.*, t.abstract as tour_name, ta.date as tour_date, ta.start_time as tour_time
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN tour_availability ta ON b.availability_id = ta.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
    `

    return await executeQuery(query, [userId])
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }
}

export default async function BookingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const bookings = await getUserBookings(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <h2 className="text-xl font-medium mb-2">No bookings found</h2>
          <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
          <Link
            href="/tours"
            className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Explore Tours
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{booking.tour_name}</h2>
                  <p className="text-gray-600 text-sm">Booking #{booking.booking_number}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : booking.payment_status === "unpaid"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.payment_status === "paid"
                      ? "Paid"
                      : booking.payment_status === "unpaid"
                        ? "Unpaid"
                        : "Partially Paid"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{new Date(booking.tour_date).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p>{booking.tour_time.slice(0, 5)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  <p>
                    {booking.adults} {booking.adults === 1 ? "Adult" : "Adults"}
                    {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "Child" : "Children"}`}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-semibold">${booking.total_price}</p>

                <Link href={`/booking-confirmation/${booking.id}`} className="text-sm text-blue-600 hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

