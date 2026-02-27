import type { Apartment, Hotel, Stay, StayFiltersState, StaySearchData, StaySortOption } from "./stay-types"
import { DEFAULT_STAY_FILTERS } from "./stay-types"

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function calcNights(checkInISO: string, checkOutISO: string): number {
  const a = new Date(checkInISO)
  const b = new Date(checkOutISO)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1
  const ms = b.getTime() - a.getTime()
  const nights = Math.round(ms / (1000 * 60 * 60 * 24))
  return clamp(nights, 1, 60)
}

export function isLongStay(search: Pick<StaySearchData, "checkIn" | "checkOut">): boolean {
  return calcNights(search.checkIn, search.checkOut) >= 7
}

function hasAmenity(stay: Stay, a: string) {
  return stay.amenities.includes(a as any)
}

export function applyStayFilters(stays: Stay[], search: StaySearchData, filters: StayFiltersState): Stay[] {
  const typeFiltered = stays.filter((s) => s.type === search.type)

  return typeFiltered.filter((s) => {
    // shared
    if (s.pricePerNight < filters.priceRange[0] || s.pricePerNight > filters.priceRange[1]) return false
    if (filters.guestRatingMin > 0 && s.guestRating < filters.guestRatingMin) return false
    if (filters.locationRadiusKm > 0 && s.distanceKm > filters.locationRadiusKm) return false
    if (filters.amenities.length > 0) {
      for (const a of filters.amenities) if (!s.amenities.includes(a)) return false
    }

    if (s.type === "hotel") {
      const h = s as Hotel
      if (filters.starRatings.length > 0 && !filters.starRatings.includes(h.stars)) return false
      if (filters.breakfastIncluded && !h.breakfastIncluded) return false
      if (filters.freeCancellation && !h.freeCancellation) return false
      if (filters.hotelChains.length > 0) {
        if (!h.chain) return false
        if (!filters.hotelChains.includes(h.chain)) return false
      }
      return true
    }

    const a = s as Apartment
    if (filters.aptEntirePlace && !a.entirePlace) return false
    if (filters.bedroomsMin > 0 && a.bedrooms < filters.bedroomsMin) return false
    if (filters.kitchen && !hasAmenity(a, "kitchen")) return false
    if (filters.washingMachine && !hasAmenity(a, "washer")) return false
    if (filters.longStayDiscount) {
      if (!isLongStay(search)) return false
      if (!a.longStayDiscountPct || a.longStayDiscountPct <= 0) return false
    }
    return true
  })
}

export function sortStays(stays: Stay[], sortBy: StaySortOption): Stay[] {
  const arr = [...stays]
  if (sortBy === "price_low") return arr.sort((a, b) => a.pricePerNight - b.pricePerNight)
  if (sortBy === "rating_high") return arr.sort((a, b) => b.guestRating - a.guestRating)
  if (sortBy === "distance") return arr.sort((a, b) => a.distanceKm - b.distanceKm)

  // recommended: prefer rating then distance
  return arr.sort((a, b) => {
    const r = b.guestRating - a.guestRating
    if (Math.abs(r) > 0.05) return r
    return a.distanceKm - b.distanceKm
  })
}

export function uniqueHotelChains(stays: Stay[]): string[] {
  const set = new Set<string>()
  for (const s of stays) {
    if (s.type !== "hotel") continue
    const h = s as Hotel
    if (h.chain) set.add(h.chain)
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b))
}

export function derivePriceBounds(stays: Stay[]): [number, number] {
  if (stays.length === 0) return [DEFAULT_STAY_FILTERS.priceRange[0], DEFAULT_STAY_FILTERS.priceRange[1]]
  let min = Infinity
  let max = -Infinity
  for (const s of stays) {
    min = Math.min(min, s.pricePerNight)
    max = Math.max(max, s.pricePerNight)
  }
  // make bounds feel premium + usable
  const floor = Math.floor(min / 10) * 10
  const ceil = Math.ceil(max / 10) * 10
  return [Math.max(0, floor), Math.max(floor + 10, ceil)]
}

