import Link from "next/link"
import { redirect } from "next/navigation"
import { Check, Calendar, Clock, MapPin, Users, Download, Share2 } from "lucide-react"
import { executeQuery } from "@/lib/db"

interface ConfirmationPageProps {
  params: {
    id: string
  }
}

async function getBookingDetails(id: number) {
  try {
    const query = `
      SELECT b.*, t.abstract as tour_name, t.description as tour_description,
        ta.date as tour_date, ta.start_time as tour_time,
        bt.first_name, bt.last_name, bt.email, bt.phone
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN tour_availability ta ON b.availability_id = ta.id
      LEFT JOIN booking_travelers bt ON b.id = bt.booking_id AND bt.is_lead = true
      WHERE b.id = $1
    `

    const result = await executeQuery(query, [id])

    if (result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("Error fetching booking details:", error)
    return null
  }
}

export default async function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const id = Number.parseInt(params.id)
  const booking = await getBookingDetails(id)

  if (!booking) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Your booking has been confirmed. Your booking number is <strong>{booking.booking_number}</strong>.
          </p>
          <p className="text-gray-600">
            A confirmation email has been sent to <strong>{booking.email}</strong>.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
            <p className="text-gray-600">Booking #: {booking.booking_number}</p>
          </div>

          <div className="p-6">
            <h3 className="font-medium text-lg mb-4">{booking.tour_name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">
                    {new Date(booking.tour_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{booking.tour_time.slice(0, 5)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Meeting Point</p>
                  <p className="text-gray-600">Details will be provided in your confirmation email</p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Travelers</p>
                  <p className="text-gray-600">
                    {booking.adults} {booking.adults === 1 ? "Adult" : "Adults"}
                    {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "Child" : "Children"}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium mb-2">Lead Contact</h3>
              <p className="text-gray-600">
                {booking.first_name} {booking.last_name}
              </p>
              <p className="text-gray-600">{booking.email}</p>
              {booking.phone && <p className="text-gray-600">{booking.phone}</p>}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">${booking.total_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`${
                    booking.payment_status === "paid"
                      ? "text-green-600"
                      : booking.payment_status === "unpaid"
                        ? "text-red-600"
                        : "text-yellow-600"
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

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-5 w-5 mr-2" />
                Download Voucher
              </button>

              <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="h-5 w-5 mr-2" />
                Share Booking
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

