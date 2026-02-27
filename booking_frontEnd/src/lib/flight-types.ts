export type Flight = {
  id: string
  airline: string
  flightNumber: string
  logo: string
  departure: {
    time: string // "HH:MM"
    airport: string
    code: string
    terminal?: string
    gate?: string
  }
  arrival: {
    time: string // "HH:MM"
    airport: string
    code: string
    terminal?: string
    gate?: string
    nextDay?: boolean
  }
  duration: string // "12h 15m"
  stops: number
  stopDetails?: string
  aircraft: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  amenities: string[]
  baggage: {
    carry: string
    checked: string
  }
  cabinClass: string
  cancellation?: string
  changes?: string
}

export type SortOption = "best" | "cheapest" | "fastest"

export type StopsFilter = "nonstop" | "1stop" | "2plus"
export type TimeOfDayFilter = "early" | "afternoon" | "evening" | "night"
export type DurationFilter = "under8" | "8to16" | "16to24" | "24plus"

export type FiltersState = {
  priceRange: [number, number]
  stops: StopsFilter[]
  airlines: string[]
  times: TimeOfDayFilter[]
  durations: DurationFilter[]
}

export const DEFAULT_FILTERS: FiltersState = {
  priceRange: [0, 3000],
  stops: [],
  airlines: [],
  times: [],
  durations: []
}

