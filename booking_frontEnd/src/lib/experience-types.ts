export type ExperienceCategory =
  | "cultural"
  | "adventure"
  | "nature"
  | "city_tours"
  | "beach"
  | "family"
  | "private_tours"

export type ExperienceBadge = "hot_deal" | "popular" | "new"

export type ExperienceGroupType = "private" | "shared"

export type ExperienceImage = { url: string; alt: string }

export type ExperienceLocation = {
  city: string
  country: string
  region?: string
}

export type ExperienceOperator = {
  id: string
  name: string
  verified: boolean
}

export type ExperienceItineraryDay = {
  day: number
  title: string
  summary: string
  stops?: string[]
}

export type Experience = {
  id: string
  title: string
  category: ExperienceCategory
  badges: ExperienceBadge[]
  location: ExperienceLocation
  operator: ExperienceOperator
  durationDays: number
  durationLabel: string
  groupType: ExperienceGroupType
  groupSizeMin: number
  groupSizeMax: number
  languages: string[]
  rating: { score: number; reviewsCount: number }
  pricePerPerson: number
  currency: "USD"
  images: ExperienceImage[]

  overview: {
    description: string
    highlights: string[]
    whoItsFor: string[]
  }

  included: string[]
  excluded: string[]
  itinerary: ExperienceItineraryDay[]
  cancellationPolicy: string

  meetingPoint?: { label: string; lat?: number; lng?: number }
  whereYoullStay?: { stayId?: string; note?: string }
}

export type ExperienceTravelers = { adults: number; children: number }

export type ExperienceSearchData = {
  destination: string
  date: string
  category: ExperienceCategory | "any"
  travelers: ExperienceTravelers
}

export type ExperienceDurationBucket = "1_3" | "4_7" | "7_plus"

export type ExperienceFiltersState = {
  priceRange: [number, number]
  duration: ExperienceDurationBucket[]
  locations: string[] // city names
  categories: ExperienceCategory[]
  groupType: Array<ExperienceGroupType>
  groupSizeMax: number // cap
  languages: string[]
  operators: string[] // operator id
  ratingMin: number
}

export type ExperienceSortOption = "recommended" | "price_low" | "rating" | "duration"

export type ExperienceBookingDraftData = {
  experienceId: string
  date: string
  travelers: ExperienceTravelers
  pricing: {
    pricePerPerson: number
    travelers: number
    fees: number
    total: number
    currency: "USD"
  }
}

