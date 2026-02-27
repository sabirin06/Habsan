export type StayType = "hotel" | "apartment"

export type StayAmenity =
  | "wifi"
  | "pool"
  | "gym"
  | "breakfast"
  | "restaurant"
  | "parking"
  | "ac"
  | "workspace"
  | "kitchen"
  | "washer"
  | "pet_friendly"

export type StayLocation = {
  city: string
  country: string
  // lightweight placeholder for map rendering
  lat: number
  lng: number
}

export type StayImage = {
  url: string
  alt: string
}

export type BaseStay = {
  id: string
  type: StayType
  name: string
  location: StayLocation
  images: ReadonlyArray<StayImage>
  pricePerNight: number
  guestRating: number // 0-10 style
  reviewsCount: number
  amenities: StayAmenity[]
  // distance from a searched center (mocked)
  distanceKm: number
}

export type HotelRoom = {
  id: string
  name: string
  capacity: number
  refundable: boolean
  breakfastIncluded: boolean
  pricePerNight: number
}

export type Hotel = BaseStay & {
  type: "hotel"
  stars: 1 | 2 | 3 | 4 | 5
  chain?: string
  breakfastIncluded: boolean
  freeCancellation: boolean
  rooms: HotelRoom[]
  policies: {
    checkInFrom: string
    checkOutBy: string
    smokingAllowed: boolean
    petsAllowed: boolean
  }
}

export type ApartmentHost = {
  name: string
  badge?: "Superhost" | "Top Host"
}

export type Apartment = BaseStay & {
  type: "apartment"
  host?: ApartmentHost
  bedrooms: number
  beds: number
  bathrooms: number
  entirePlace: boolean
  cleaningFee: number
  longStayDiscountPct?: number // e.g. 10 means 10% off on 7+ nights
  houseRules: string[]
  spaceDescription: string
}

export type Stay = Hotel | Apartment

export type StayGuests = {
  adults: number
  children: number
}

export type StaySearchData = {
  type: StayType
  destination: string
  checkIn: string // ISO yyyy-mm-dd
  checkOut: string // ISO yyyy-mm-dd
  guests: StayGuests
  rooms: number
  entirePlace: boolean
}

export type StayFiltersState = {
  priceRange: [number, number]
  guestRatingMin: number
  amenities: StayAmenity[]
  locationRadiusKm: number

  // Hotels-only
  starRatings: Array<1 | 2 | 3 | 4 | 5>
  breakfastIncluded: boolean
  freeCancellation: boolean
  hotelChains: string[]

  // Apartments-only
  aptEntirePlace: boolean
  bedroomsMin: number
  kitchen: boolean
  washingMachine: boolean
  longStayDiscount: boolean
}

export const DEFAULT_STAY_FILTERS: StayFiltersState = {
  priceRange: [0, 1200],
  guestRatingMin: 0,
  amenities: [],
  locationRadiusKm: 25,

  starRatings: [],
  breakfastIncluded: false,
  freeCancellation: false,
  hotelChains: [],

  aptEntirePlace: false,
  bedroomsMin: 0,
  kitchen: false,
  washingMachine: false,
  longStayDiscount: false
}

export type StaySortOption = "recommended" | "price_low" | "rating_high" | "distance"

export type StayBookingDraftData = {
  type: StayType
  stayId: string
  roomId?: string // hotels book by room
  search: StaySearchData
  pricing: {
    nights: number
    pricePerNight: number
    subtotal: number
    fees: number
    discount: number
    total: number
    currency: "USD"
  }
}

