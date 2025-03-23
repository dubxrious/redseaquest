import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, MapPin, Calendar, Users, Star, Award, Check, X, AlertTriangle, ShoppingBag } from "lucide-react"
import { executeQuery } from "@/lib/db"
import type { TourDetail } from "@/lib/types"

interface TourPageProps {
  params: {
    id: string
  }
}

async function getTourDetails(id: number): Promise<TourDetail | null> {
  try {
    // Get tour basic info
    const tourQuery = `SELECT * FROM tours WHERE id = $1`
    const tourResult = await executeQuery(tourQuery, [id])

    if (!tourResult || tourResult.length === 0) {
      return null
    }

    const tour = tourResult[0]

    // Get categories
    const categoriesQuery = `
      SELECT c.* FROM categories c
      JOIN tour_categories tc ON c.id = tc.category_id
      WHERE tc.tour_id = $1
    `
    const categories = await executeQuery(categoriesQuery, [id])

    // Get cancellation policy
    const policyQuery = `SELECT * FROM cancellation_policies WHERE tour_id = $1`
    const policyResult = await executeQuery(policyQuery, [id])
    const cancellation_policy = policyResult.length > 0 ? policyResult[0] : null

    // Get flags
    const flagsQuery = `SELECT * FROM tour_flags WHERE tour_id = $1`
    const flagsResult = await executeQuery(flagsQuery, [id])
    const flags = flagsResult.length > 0 ? flagsResult[0] : null

    // Get badges
    const badgesQuery = `SELECT * FROM badges WHERE tour_id = $1`
    const badges = await executeQuery(badgesQuery, [id])

    // Get itinerary items
    const itineraryQuery = `
      SELECT i.id FROM itineraries i WHERE i.tour_id = $1
    `
    const itineraryResult = await executeQuery(itineraryQuery, [id])
    let itinerary_items: any[] = []

    if (itineraryResult.length > 0) {
      const itineraryId = itineraryResult[0].id
      const itemsQuery = `
        SELECT * FROM itinerary_items 
        WHERE itinerary_id = $1
        ORDER BY sequence_number
      `
      itinerary_items = await executeQuery(itemsQuery, [itineraryId])
    }

    // Get additional info
    const additionalInfoQuery = `SELECT id FROM additional_info WHERE tour_id = $1`
    const additionalInfoResult = await executeQuery(additionalInfoQuery, [id])
    const additional_info: any = {
      highlights: [],
      inclusions: [],
      exclusions: [],
      not_allowed: [],
      not_suitable_for: [],
      to_bring: [],
    }

    if (additionalInfoResult.length > 0) {
      const additionalInfoId = additionalInfoResult[0].id

      // Get highlights
      const highlightsQuery = `
        SELECT content FROM highlights 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const highlights = await executeQuery(highlightsQuery, [additionalInfoId])
      additional_info.highlights = highlights.map((h: any) => h.content)

      // Get inclusions
      const inclusionsQuery = `
        SELECT content FROM inclusions 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const inclusions = await executeQuery(inclusionsQuery, [additionalInfoId])
      additional_info.inclusions = inclusions.map((i: any) => i.content)

      // Get exclusions
      const exclusionsQuery = `
        SELECT content FROM exclusions 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const exclusions = await executeQuery(exclusionsQuery, [additionalInfoId])
      additional_info.exclusions = exclusions.map((e: any) => e.content)

      // Get not_allowed
      const notAllowedQuery = `
        SELECT content FROM not_allowed 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const notAllowed = await executeQuery(notAllowedQuery, [additionalInfoId])
      additional_info.not_allowed = notAllowed.map((n: any) => n.content)

      // Get not_suitable_for
      const notSuitableQuery = `
        SELECT content FROM not_suitable_for 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const notSuitable = await executeQuery(notSuitableQuery, [additionalInfoId])
      additional_info.not_suitable_for = notSuitable.map((n: any) => n.content)

      // Get to_bring
      const toBringQuery = `
        SELECT content FROM to_bring 
        WHERE additional_info_id = $1
        ORDER BY sequence_number
      `
      const toBring = await executeQuery(toBringQuery, [additionalInfoId])
      additional_info.to_bring = toBring.map((t: any) => t.content)
    }

    const tourDetail: TourDetail = {
      ...tour,
      categories,
      cancellation_policy,
      flags,
      badges,
      itinerary_items,
      additional_info,
    }

    return tourDetail
  } catch (error) {
    console.error("Error fetching tour details:", error)
    return null
  }
}

export default async function TourPage({ params }: TourPageProps) {
  const id = Number.parseInt(params.id)
  const tour = await getTourDetails(id)

  if (!tour) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm hover:underline inline-flex items-center">
          ← Back to tours
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{tour.abstract}</h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
              {tour.categories?.map((category: any, index: number) => (
                <span key={index} className="inline-flex items-center">
                  {index > 0 && <span className="mx-1">•</span>}
                  {category.name}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                <Star className="h-4 w-4 mr-1 text-black" fill="currentColor" />
                <span>4.8</span>
                <span className="mx-1">•</span>
                <span>245 reviews</span>
              </div>

              {tour.flags?.best_seller && (
                <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Best Seller</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="relative h-80 w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
              <Image
                src={`/placeholder.svg?height=600&width=800`}
                alt={tour.abstract || "Tour image"}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=200&width=200&text=Image ${i}`}
                    alt={`Tour image ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About This Tour</h2>
            <p className="text-gray-700 whitespace-pre-line mb-4">{tour.description}</p>
          </div>

          {tour.additional_info.highlights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Highlights</h2>
              <ul className="grid gap-2">
                {tour.additional_info.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-black flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.itinerary_items?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
              <div className="border-l-2 border-gray-200 pl-4 ml-2">
                {tour.itinerary_items.map((item: any, index: number) => (
                  <div key={index} className="mb-6 relative">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-black"></div>
                    <h3 className="font-medium mb-1">{item.title || `Stop ${index + 1}`}</h3>
                    {item.location_name && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{item.location_name}</span>
                      </div>
                    )}
                    {item.transit_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{item.transit_time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {tour.additional_info.inclusions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What's Included</h2>
                <ul className="grid gap-2">
                  {tour.additional_info.inclusions.map((inclusion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-black flex-shrink-0" />
                      <span>{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.additional_info.exclusions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What's Not Included</h2>
                <ul className="grid gap-2">
                  {tour.additional_info.exclusions.map((exclusion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <X className="h-5 w-5 mr-2 text-black flex-shrink-0" />
                      <span>{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {tour.additional_info.to_bring.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What to Bring</h2>
                <ul className="grid gap-2">
                  {tour.additional_info.to_bring.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <ShoppingBag className="h-5 w-5 mr-2 text-black flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.additional_info.not_allowed.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Not Allowed</h2>
                <ul className="grid gap-2">
                  {tour.additional_info.not_allowed.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 text-black flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {tour.cancellation_policy && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {tour.cancellation_policy.is_cancellable ? (
                  <p>
                    Free cancellation up to {tour.cancellation_policy.cancellation_offset}{" "}
                    {tour.cancellation_policy.cancellation_offset_unit} before the experience starts. After that, a fee
                    of {tour.cancellation_policy.fee} {tour.cancellation_policy.fee_unit} will be charged.
                  </p>
                ) : (
                  <p>This experience is non-refundable and cannot be changed for any reason.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">$99</span>
                <span className="text-gray-600">per person</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded">
                <div className="flex items-center p-3 border-b border-gray-200">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Select Date</span>
                </div>
                <div className="p-3">
                  <input type="date" className="w-full border border-gray-300 rounded p-2" />
                </div>
              </div>

              <div className="border border-gray-200 rounded">
                <div className="flex items-center p-3 border-b border-gray-200">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Select Time</span>
                </div>
                <div className="p-3">
                  <select className="w-full border border-gray-300 rounded p-2">
                    <option>9:00 AM</option>
                    <option>11:00 AM</option>
                    <option>1:00 PM</option>
                    <option>3:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-200 rounded">
                <div className="flex items-center p-3 border-b border-gray-200">
                  <Users className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">Travelers</span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span>Adults</span>
                    <div className="flex items-center">
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l">
                        -
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center border-t border-b border-gray-300">
                        2
                      </span>
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Book Now
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">Reserve now & pay later</div>
          </div>
        </div>
      </div>
    </div>
  )
}

