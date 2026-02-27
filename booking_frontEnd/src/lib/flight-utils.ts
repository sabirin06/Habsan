import type {
  DurationFilter,
  FiltersState,
  Flight,
  SortOption,
  StopsFilter,
  TimeOfDayFilter
} from "./flight-types"

export function parseTimeToMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  return hh * 60 + mm
}

export function parseDurationToMinutes(duration: string): number | null {
  // supports "12h 15m", "7h 5m", "8h"
  const s = duration.toLowerCase().trim()
  const hMatch = /(\d+)\s*h/.exec(s)
  const mMatch = /(\d+)\s*m/.exec(s)
  const h = hMatch ? Number(hMatch[1]) : 0
  const m = mMatch ? Number(mMatch[1]) : 0
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const total = h * 60 + m
  return total > 0 ? total : null
}

export function timeBucket(minutes: number): TimeOfDayFilter {
  // 0:00–4:59
  if (minutes < 5 * 60) return "night"
  // 5:00–11:59
  if (minutes < 12 * 60) return "early"
  // 12:00–17:59
  if (minutes < 18 * 60) return "afternoon"
  // 18:00–23:59
  return "evening"
}

export function durationBucket(minutes: number): DurationFilter {
  if (minutes < 8 * 60) return "under8"
  if (minutes < 16 * 60) return "8to16"
  if (minutes < 24 * 60) return "16to24"
  return "24plus"
}

export function stopsBucket(stops: number): StopsFilter {
  if (stops <= 0) return "nonstop"
  if (stops === 1) return "1stop"
  return "2plus"
}

export function applyFilters(flights: Flight[], filters: FiltersState): Flight[] {
  const [minPrice, maxPrice] = filters.priceRange
  return flights.filter((f) => {
    if (f.price < minPrice || f.price > maxPrice) return false

    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false

    if (filters.stops.length > 0) {
      const bucket = stopsBucket(f.stops)
      if (!filters.stops.includes(bucket)) return false
    }

    if (filters.times.length > 0) {
      const mins = parseTimeToMinutes(f.departure.time)
      if (mins == null) return false
      if (!filters.times.includes(timeBucket(mins))) return false
    }

    if (filters.durations.length > 0) {
      const mins = parseDurationToMinutes(f.duration)
      if (mins == null) return false
      if (!filters.durations.includes(durationBucket(mins))) return false
    }

    return true
  })
}

export function sortFlights(flights: Flight[], sortBy: SortOption): Flight[] {
  const copy = flights.slice()
  copy.sort((a, b) => {
    if (sortBy === "cheapest") return a.price - b.price

    if (sortBy === "fastest") {
      const ad = parseDurationToMinutes(a.duration) ?? Number.MAX_SAFE_INTEGER
      const bd = parseDurationToMinutes(b.duration) ?? Number.MAX_SAFE_INTEGER
      if (ad !== bd) return ad - bd
      return a.price - b.price
    }

    // "best": balanced score (price + duration + rating)
    const ad = parseDurationToMinutes(a.duration) ?? 99999
    const bd = parseDurationToMinutes(b.duration) ?? 99999

    const aScore = a.price * 1.0 + ad * 0.6 - a.rating * 120
    const bScore = b.price * 1.0 + bd * 0.6 - b.rating * 120
    if (aScore !== bScore) return aScore - bScore
    return a.price - b.price
  })
  return copy
}

export function priceBreakdown(total: number) {
  // Simple, predictable breakdown that sums cleanly.
  const base = Math.round(total * 0.82)
  const taxes = total - base
  return { baseFare: base, taxesAndFees: taxes, total }
}

