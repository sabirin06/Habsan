import type { Airport } from "@/lib/airports"

export type TransportKind = "airport_pickup" | "car_rental"

export type VehicleType = "sedan" | "suv" | "van" | "luxury"

export type DriverMode = "self_drive" | "with_driver"

export type TransportFeature = "wifi" | "ac" | "child_seat" | "water" | "meet_greet" | "phone_charger" | "extra_luggage"

export type TransportImage = { url: string; alt: string }

export type TransportProvider = {
  id: string
  name: string
  verified: boolean
}

export type TransportPricing = {
  amount: number
  unit: "per_trip" | "per_day"
  currency: "USD"
  depositUsd?: number
  includedKmPerDay?: number
  extraKmRateUsd?: number
}

export type AirportPickupInfo = {
  pickupType: "airport"
  airports: Array<Pick<Airport, "code" | "city" | "country" | "airport">>
  /** A few popular drop-off zones/cities (kept lightweight for Phase 1). */
  dropOffZones: string[]
  meetAndGreet: boolean
}

export type CarRentalInfo = {
  pickupLocations: string[]
  minDays: number
  transmission: "automatic" | "manual"
  fuelPolicy: "full_to_full" | "prepaid"
  mileage: "unlimited" | "limited"
  driverRequirement?: "25_plus" | "21_plus"
}

export type TransportService = {
  id: string
  kind: TransportKind
  title: string
  vehicleType: VehicleType
  provider: TransportProvider
  rating: { score: number; reviewsCount: number }
  capacity: number
  driverModes: DriverMode[]
  features: TransportFeature[]
  freeCancellation: boolean
  pricing: TransportPricing
  images: TransportImage[]

  overview: {
    description: string
    highlights: string[]
  }

  whatsIncluded: string[]
  cancellationPolicy: string
  pickupInstructions: string

  // kind-specific (Phase 1 only)
  pickup?: AirportPickupInfo
  rental?: CarRentalInfo

  /** If with driver is available, provide a light profile (API-ready placeholder). */
  driver?: {
    name: string
    languages: string[]
    verified: boolean
    yearsExperience: number
    phone?: string
    whatsapp?: string
  }

  reviews: Array<{
    id: string
    name: string
    rating: number
    dateISO: string
    comment: string
  }>
}

export type TransportSearchTab = "airport_pickup" | "rent_a_car"

export type TransportSearchData = {
  tab: TransportSearchTab

  // Airport pickup
  pickupAirport: Airport | null
  dropOffLocation: string
  pickupDateTime: string
  passengers: number

  // Car rental
  rentalPickupLocation: string
  rentalPickupDateTime: string
  rentalReturnDateTime: string
  carType: VehicleType | "any"
  rentalDriverMode: DriverMode | "either"
}

export type TransportFiltersState = {
  priceRange: [number, number]
  vehicleTypes: VehicleType[]
  driverModes: DriverMode[] // if empty => any
  capacityMin: number
  providers: string[] // provider ids
  ratingMin: number
  freeCancellation: boolean
}

export type TransportSortOption = "recommended" | "price_low" | "rating"

export type TransportBookingDraftData = {
  serviceId: string
  search: Pick<
    TransportSearchData,
    | "tab"
    | "pickupAirport"
    | "dropOffLocation"
    | "pickupDateTime"
    | "passengers"
    | "rentalPickupLocation"
    | "rentalPickupDateTime"
    | "rentalReturnDateTime"
    | "carType"
    | "rentalDriverMode"
  >
  pricing: {
    amount: number
    unit: "per_trip" | "per_day"
    days?: number
    fees: number
    total: number
    currency: "USD"
  }
}

