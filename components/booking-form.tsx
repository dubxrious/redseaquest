"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, CreditCard } from "lucide-react"

interface BookingFormProps {
  tourId: number
  tourName: string
  priceAdult: number
  priceChild?: number
}

interface AvailabilitySlot {
  id: number
  date: string
  start_time: string
  end_time: string | null
  max_spots: number
  spots_booked: number
  price_adult: number
  price_child: number | null
}

export default function BookingForm({ tourId, tourName, priceAdult, priceChild = 0 }: BookingFormProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate total price
  const totalPrice = adults * priceAdult + children * (priceChild || 0)

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return

    const fetchAvailableSlots = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/availability?tourId=${tourId}&date=${selectedDate}`)

        if (!response.ok) {
          throw new Error("Failed to fetch availability")
        }

        const data = await response.json()
        setAvailableSlots(data.slots)
      } catch (error) {
        console.error("Error fetching availability:", error)
        setError("Failed to load available time slots. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [tourId, selectedDate])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedSlot) {
      setError("Please select a date and time")
      return
    }

    if (adults + children < 1) {
      setError("Please select at least one traveler")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tour_id: tourId,
          availability_id: selectedSlot,
          adults,
          children,
          total_price: totalPrice,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      const data = await response.json()

      // Redirect to checkout page
      router.push(`/checkout/${data.booking.id}`)
    } catch (error) {
      console.error("Error creating booking:", error)
      setError("Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">${priceAdult}</span>
          <span className="text-gray-600">per person</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Date Selection */}
        <div className="border border-gray-200 rounded">
          <div className="flex items-center p-3 border-b border-gray-200">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Select Date</span>
          </div>
          <div className="p-3">
            <input
              type="date"
              className="w-full border border-gray-300 rounded p-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        {/* Time Selection */}
        <div className="border border-gray-200 rounded">
          <div className="flex items-center p-3 border-b border-gray-200">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Select Time</span>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="text-center py-2">Loading available times...</div>
            ) : availableSlots.length > 0 ? (
              <select
                className="w-full border border-gray-300 rounded p-2"
                value={selectedSlot || ""}
                onChange={(e) => setSelectedSlot(Number(e.target.value))}
                required
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.start_time.slice(0, 5)} {slot.end_time ? `- ${slot.end_time.slice(0, 5)}` : ""} (
                    {slot.max_spots - slot.spots_booked} spots left)
                  </option>
                ))}
              </select>
            ) : selectedDate ? (
              <div className="text-center py-2 text-gray-500">No available times for this date</div>
            ) : (
              <div className="text-center py-2 text-gray-500">Select a date to see available times</div>
            )}
          </div>
        </div>

        {/* Travelers */}
        <div className="border border-gray-200 rounded">
          <div className="flex items-center p-3 border-b border-gray-200">
            <Users className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Travelers</span>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span>Adults</span>
              <div className="flex items-center">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                  onClick={() => setAdults(Math.max(0, adults - 1))}
                >
                  -
                </button>
                <span className="w-8 h-8 flex items-center justify-center border-t border-b border-gray-300">
                  {adults}
                </span>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                  onClick={() => setAdults(adults + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {priceChild > 0 && (
              <div className="flex items-center justify-between">
                <span>Children</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                  >
                    -
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center border-t border-b border-gray-300">
                    {children}
                  </span>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                    onClick={() => setChildren(children + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between mb-2">
          <span>
            Adults ({adults} × ${priceAdult})
          </span>
          <span>${adults * priceAdult}</span>
        </div>
        {children > 0 && priceChild > 0 && (
          <div className="flex justify-between mb-2">
            <span>
              Children ({children} × ${priceChild})
            </span>
            <span>${children * priceChild}</span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Book Now
          </>
        )}
      </button>

      <div className="mt-4 text-center text-sm text-gray-500">Reserve now & pay later</div>
    </form>
  )
}

