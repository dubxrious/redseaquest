import Link from "next/link"

export default function ResetPasswordNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-6">Invalid or Expired Link</h1>

        <p className="mb-6 text-gray-600">The password reset link you followed is invalid or has expired.</p>

        <div className="mb-4">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Request a new password reset link
          </Link>
        </div>

        <div>
          <Link href="/login" className="text-blue-600 hover:underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

