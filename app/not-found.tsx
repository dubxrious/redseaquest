import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8">The tour you're looking for doesn't exist or has been removed.</p>
      <Link
        href="/"
        className="bg-black text-white px-6 py-3 rounded-lg inline-block hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}

