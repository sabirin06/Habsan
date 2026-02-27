import type {
  DriverMode,
  TransportFiltersState,
  TransportSearchData,
  TransportService,
  TransportSortOption,
  TransportFeature,
  VehicleType
} from "@/lib/transport-types"

export function deriveTransportPriceBounds(items: TransportService[]): [number, number] {
  const prices = items.map((x) => x.pricing.amount).filter((n) => Number.isFinite(n))
  if (!prices.length) return [0, 200] as [number, number]
  const min = Math.max(0, Math.floor(Math.min(...prices)))
  const max = Math.max(min + 1, Math.ceil(Math.max(...prices)))
  // Make it feel “premium” + usable.
  const floor = Math.floor(min / 5) * 5
  const ceil = Math.ceil(max / 5) * 5
  return [Math.max(0, floor), Math.max(floor + 5, ceil)]
}

export function buildDefaultTransportFilters(priceBounds: [number, number]): TransportFiltersState {
  return {
    priceRange: priceBounds,
    vehicleTypes: [],
    driverModes: [],
    capacityMin: 1,
    providers: [],
    ratingMin: 0,
    freeCancellation: false
  }
}

function norm(s: string) {
  return (s || "").trim().toLowerCase()
}

function includesLoose(hay: string, needle: string) {
  const q = norm(needle)
  if (!q) return true
  return norm(hay).includes(q)
}

export function uniqueProviders(items: TransportService[]): Array<{ id: string; name: string }> {
  const m = new Map<string, { id: string; name: string }>()
  for (const t of items) m.set(t.provider.id, { id: t.provider.id, name: t.provider.name })
  return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function hasFeature(t: TransportService, f: TransportFeature) {
  return t.features.includes(f)
}

export function applyTransportFilters(items: TransportService[], search: TransportSearchData, filters: TransportFiltersState) {
  const tab = search.tab
  const wantsPickup = tab === "airport_pickup"
  const wantsRental = tab === "rent_a_car"

  return items.filter((t) => {
    // Phase 1: only airport pickup + car rentals.
    if (wantsPickup && t.kind !== "airport_pickup") return false
    if (wantsRental && t.kind !== "car_rental") return false

    // Search-level constraints.
    if (search.passengers > 0 && t.capacity < Math.max(1, search.passengers)) return false

    if (wantsPickup) {
      const airport = search.pickupAirport
      if (airport) {
        const supported = (t.pickup?.airports ?? []).some((a) => a.code === airport.code)
        if (!supported) return false
      }
      if (search.dropOffLocation?.trim()) {
        const zones = t.pickup?.dropOffZones ?? []
        const hay = zones.join(" • ")
        if (!includesLoose(hay, search.dropOffLocation)) return false
      }
    }

    if (wantsRental) {
      if (search.rentalPickupLocation?.trim()) {
        const locs = t.rental?.pickupLocations ?? []
        const hay = locs.join(" • ")
        if (!includesLoose(hay, search.rentalPickupLocation)) return false
      }
      if (search.carType !== "any" && t.vehicleType !== search.carType) return false
      if (search.rentalDriverMode !== "either") {
        if (!t.driverModes.includes(search.rentalDriverMode)) return false
      }
    }

    // Filters (real-time).
    const [minP, maxP] = filters.priceRange
    if (t.pricing.amount < minP || t.pricing.amount > maxP) return false

    if (filters.vehicleTypes.length && !filters.vehicleTypes.includes(t.vehicleType as VehicleType)) return false

    if (filters.driverModes.length) {
      const ok = filters.driverModes.some((m) => t.driverModes.includes(m as DriverMode))
      if (!ok) return false
    }

    if (filters.capacityMin > 1 && t.capacity < filters.capacityMin) return false

    if (filters.providers.length && !filters.providers.includes(t.provider.id)) return false

    if (filters.ratingMin > 0 && t.rating.score < filters.ratingMin) return false

    if (filters.freeCancellation && !t.freeCancellation) return false

    return true
  })
}

export function sortTransport(items: TransportService[], sortBy: TransportSortOption): TransportService[] {
  const arr = [...items]
  if (sortBy === "price_low") return arr.sort((a, b) => a.pricing.amount - b.pricing.amount)
  if (sortBy === "rating") return arr.sort((a, b) => b.rating.score - a.rating.score || b.rating.reviewsCount - a.rating.reviewsCount)

  // recommended: verified provider + rating + value
  const score = (t: TransportService) => {
    const verifiedBoost = t.provider.verified ? 10 : 0
    const cancelBoost = t.freeCancellation ? 1.25 : 0
    return verifiedBoost + t.rating.score * 2 + cancelBoost - Math.min(120, t.pricing.amount) / 40
  }
  return arr.sort((a, b) => score(b) - score(a))
}

