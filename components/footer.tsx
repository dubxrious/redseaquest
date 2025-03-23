import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Red Sea Quest</h3>
            <p className="text-sm text-gray-600">
              Your gateway to unforgettable marine tours and experiences in the Red Sea.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 uppercase">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tours" className="text-sm hover:underline">
                  All Tours
                </Link>
              </li>
              <li>
                <Link href="/?category=Diving" className="text-sm hover:underline">
                  Diving
                </Link>
              </li>
              <li>
                <Link href="/?category=Snorkeling" className="text-sm hover:underline">
                  Snorkeling
                </Link>
              </li>
              <li>
                <Link href="/?category=Boat%20Tours" className="text-sm hover:underline">
                  Boat Tours
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 uppercase">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm hover:underline">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 uppercase">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Red Sea Quest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

