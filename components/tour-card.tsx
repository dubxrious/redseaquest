import Link from "next/link"
import Image from "next/image"
import type { Tour } from "@/lib/types"

interface TourCardProps {
  tour: Tour & {
    categories: string[]
    is_best_seller?: boolean
    is_likely_to_sell_out?: boolean
  }
}

export default function TourCard({ tour }: TourCardProps) {
  return (
    <Link href={`/tours/${tour.id}`} className="block group">
      <div className="border border-gray-200 rounded-md overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={`/placeholder.svg?height=400&width=600`}
            alt={tour.abstract || "Tour image"}
            fill
            className="object-cover"
          />
          {tour.is_best_seller && (
            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">Best Seller</div>
          )}
          {tour.is_likely_to_sell_out && (
            <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
              Likely to Sell Out
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">{tour.categories?.slice(0, 3).join(" • ")}</div>
          <h3 className="font-medium text-base mb-2 line-clamp-2 group-hover:underline">
            {tour.abstract || "Tour title"}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{tour.activity_type || "Activity"}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">$99</div>
              <div className="text-xs text-gray-500">per adult</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

