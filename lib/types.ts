export interface Tour {
  id: number
  abstract: string
  description: string
  activity_type: string
  activity_type_label: string
  is_online: boolean
  booked_in_24_hours: number
  is_reserve_now_pay_later: boolean
}

export interface Category {
  id: number
  name: string
  code: string
  is_primary: boolean
}

export interface CancellationPolicy {
  id: number
  tour_id: number
  is_cancellable: boolean
  cancellation_offset: number
  cancellation_offset_unit: string
  fee: number
  fee_unit: string
}

export interface TourFlags {
  id: number
  tour_id: number
  best_seller: boolean
  is_certified_partner: boolean
  is_eco_certified: boolean
  is_gyg_authorised_reseller: boolean
  is_gyg_originals: boolean
  is_likely_to_sell_out: boolean
  is_reserve_now_pay_later_supported: boolean
  must_book_online: boolean
}

export interface Badge {
  id: number
  tour_id: number
  title: string
  description: string
  image_url: string
  badge_type: string
}

export interface ItineraryItem {
  id: number
  itinerary_id: number
  title: string
  location_name: string
  latitude: number
  longitude: number
  display_on_map: boolean
  is_endpoint: boolean
  is_important: boolean
  is_optional: boolean
  is_primary_stop: boolean
  is_transit: boolean
  map_message: string
  transit_time: string
  transportation_type: string
  item_type: string
  activity_label: string
  sequence_number: number
  flags: any
}

export interface AdditionalInfo {
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  not_allowed: string[]
  not_suitable_for: string[]
  to_bring: string[]
}

export interface TourDetail extends Tour {
  categories: Category[]
  cancellation_policy: CancellationPolicy
  flags: TourFlags
  badges: Badge[]
  itinerary_items: ItineraryItem[]
  additional_info: AdditionalInfo
}

