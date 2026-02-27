import type {
  Experience,
  ExperienceCategory,
  ExperienceDurationBucket,
  ExperienceFiltersState,
  ExperienceGroupType,
  ExperienceSearchData,
  ExperienceSortOption
} from "@/lib/experience-types"

export function totalTravelers(t: { adults: number; children: number }) {
  return Math.max(1, (t.adults || 0) + (t.children || 0))
}

export function derivePriceBounds(items: Experience[]) {
  const prices = items.map((x) => x.pricePerPerson).filter((n) => Number.isFinite(n))
  if (!prices.length) return [0, 500] as [number, number]
  const min = Math.max(0, Math.floor(Math.min(...prices)))
  const max = Math.max(min + 1, Math.ceil(Math.max(...prices)))
  return [min, max] as [number, number]
}

export function durationBucket(days: number): ExperienceDurationBucket {
  if (days <= 3) return "1_3"
  if (days <= 7) return "4_7"
  return "7_plus"
}

export function uniqueOperators(items: Experience[]) {
  const m = new Map<string, { id: string; name: string }>()
  for (const e of items) m.set(e.operator.id, { id: e.operator.id, name: e.operator.name })
  return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function uniqueLocations(items: Experience[]) {
  return Array.from(new Set(items.map((e) => e.location.city))).sort((a, b) => a.localeCompare(b))
}

export function uniqueLanguages(items: Experience[]) {
  return Array.from(new Set(items.flatMap((e) => e.languages))).sort((a, b) => a.localeCompare(b))
}

export function buildDefaultExperienceFilters(priceBounds: [number, number]): ExperienceFiltersState {
  return {
    priceRange: priceBounds,
    duration: [],
    locations: [],
    categories: [],
    groupType: [],
    groupSizeMax: 99,
    languages: [],
    operators: [],
    ratingMin: 0
  }
}

function matchesDestination(e: Experience, destination: string) {
  const q = (destination || "").trim().toLowerCase()
  if (!q) return true
  const hay = `${e.title} ${e.location.city} ${e.location.country} ${e.location.region ?? ""}`.toLowerCase()
  return hay.includes(q)
}

export function applyExperienceFilters(items: Experience[], search: ExperienceSearchData, filters: ExperienceFiltersState) {
  const q = (search.destination || "").trim()
  const category = search.category

  return items.filter((e) => {
    // Search box
    if (q && !matchesDestination(e, q)) return false
    if (category !== "any" && e.category !== category) return false

    // Price
    const [minP, maxP] = filters.priceRange
    if (e.pricePerPerson < minP || e.pricePerPerson > maxP) return false

    // Duration
    if (filters.duration.length) {
      const b = durationBucket(e.durationDays)
      if (!filters.duration.includes(b)) return false
    }

    // Location
    if (filters.locations.length && !filters.locations.includes(e.location.city)) return false

    // Tour type/category
    if (filters.categories.length && !filters.categories.includes(e.category as ExperienceCategory)) return false

    // Group type
    if (filters.groupType.length && !filters.groupType.includes(e.groupType as ExperienceGroupType)) return false

    // Group size cap
    if (Number.isFinite(filters.groupSizeMax) && filters.groupSizeMax > 0) {
      if (e.groupSizeMax > filters.groupSizeMax) return false
    }

    // Language
    if (filters.languages.length) {
      const has = filters.languages.some((l) => e.languages.includes(l))
      if (!has) return false
    }

    // Operator
    if (filters.operators.length && !filters.operators.includes(e.operator.id)) return false

    // Rating
    if (filters.ratingMin > 0 && e.rating.score < filters.ratingMin) return false

    return true
  })
}

export function sortExperiences(items: Experience[], sortBy: ExperienceSortOption) {
  const arr = [...items]
  if (sortBy === "price_low") arr.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
  else if (sortBy === "rating") arr.sort((a, b) => b.rating.score - a.rating.score || b.rating.reviewsCount - a.rating.reviewsCount)
  else if (sortBy === "duration") arr.sort((a, b) => a.durationDays - b.durationDays || a.pricePerPerson - b.pricePerPerson)
  else {
    // recommended: badges + rating + price
    const score = (e: Experience) => {
      const badgeBoost = e.badges.includes("hot_deal") ? 3 : e.badges.includes("popular") ? 2 : e.badges.includes("new") ? 1 : 0
      return badgeBoost * 10 + e.rating.score * 2 - Math.min(200, e.pricePerPerson) / 50
    }
    arr.sort((a, b) => score(b) - score(a))
  }
  return arr
}

export function categoryLabel(c: ExperienceCategory | "any") {
  if (c === "any") return "Any type"
  return c === "city_tours"
    ? "City tours"
    : c === "private_tours"
      ? "Private tours"
      : c === "cultural"
        ? "Cultural"
        : c === "adventure"
          ? "Adventure"
          : c === "nature"
            ? "Nature"
            : c === "beach"
              ? "Beach"
              : "Family"
}

