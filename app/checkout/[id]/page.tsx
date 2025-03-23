import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import CheckoutForm from "@/components/checkout-form"

interface CheckoutPageProps {
  params: {
    id: string
  }
}

async function getBookingDetails(id: number) {
  try {
    const query = `
      SELECT b.*, t.abstract as tour_name, ta.date as tour_date, ta.start_time as tour_time
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN tour_availability ta ON b.availability_id = ta.id
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

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const id = Number.parseInt(params.id)
  const booking = await getBookingDetails(id)

  if (!booking) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <CheckoutForm booking={booking} />
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="mb-4">
                <h3 className="font-medium">{booking.tour_name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Date: {new Date(booking.tour_date).toLocaleDateString()}</div>
                  <div>Time: {booking.tour_time.slice(0, 5)}</div>
                  <div>Booking #: {booking.booking_number}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Adults ({booking.adults})</span>
                  <span>${(booking.total_price / (booking.adults + booking.children)) * booking.adults}</span>
                </div>

                {booking.children > 0 && (
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Children ({booking.children})</span>
                    <span>${(booking.total_price / (booking.adults + booking.children)) * booking.children}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${booking.total_price}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>
                  By proceeding with this booking, you agree to Red Sea Quest's Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

