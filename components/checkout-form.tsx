"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Check } from "lucide-react"

interface CheckoutFormProps {
  booking: any
}

export default function CheckoutForm({ booking }: CheckoutFormProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "credit_card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setError("Please fill in all card details")
        return
      }
    }

    if (!email || !firstName || !lastName) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real application, you would integrate with a payment processor like Stripe
      // For this demo, we'll simulate a successful payment

      // Create payment record
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: booking.total_price,
          payment_method: paymentMethod,
          payment_intent_id: `demo_${Date.now()}`,
          status: "succeeded",
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Payment processing failed")
      }

      // Update booking with traveler info
      const travelerResponse = await fetch(`/api/bookings/${booking.id}/travelers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          is_lead: true,
        }),
      })

      if (!travelerResponse.ok) {
        throw new Error("Failed to update traveler information")
      }

      // Update booking status
      const bookingResponse = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "confirmed",
          payment_status: "paid",
        }),
      })

      if (!bookingResponse.ok) {
        throw new Error("Failed to update booking status")
      }

      setSuccess(true)

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        router.push(`/booking-confirmation/${booking.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error processing payment:", error)
      setError("Payment processing failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your booking has been confirmed. Redirecting to your booking confirmation...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="credit_card"
              checked={paymentMethod === "credit_card"}
              onChange={() => setPaymentMethod("credit_card")}
              className="mr-2"
            />
            <span>Credit Card</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="pay_later"
              checked={paymentMethod === "pay_later"}
              onChange={() => setPaymentMethod("pay_later")}
              className="mr-2"
            />
            <span>Pay Later</span>
          </label>
        </div>

        {paymentMethod === "credit_card" && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4">Contact Information</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="+1 (123) 456-7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
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
            {paymentMethod === "credit_card" ? "Pay Now" : "Reserve Now"}
          </>
        )}
      </button>
    </form>
  )
}

