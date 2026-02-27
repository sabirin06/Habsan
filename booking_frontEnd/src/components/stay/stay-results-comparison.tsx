"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Filter, Grid, List, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/lib/use-media-query"
import { MOCK_STAYS } from "@/lib/mock-stays"
import type { StayFiltersState, StaySearchData, StaySortOption } from "@/lib/stay-types"
import { DEFAULT_STAY_FILTERS } from "@/lib/stay-types"
import { applyStayFilters, derivePriceBounds, sortStays, uniqueHotelChains } from "@/lib/stay-utils"
import { StayFilters } from "./stay-filters"
import { StayResultCard } from "./stay-result-card"
import { useRouter } from "next/navigation"

function totalGuests(g: StaySearchData["guests"]) {
  return Math.max(1, (g.adults || 0) + (g.children || 0))
}

const sortOptions: Array<{ id: StaySortOption; label: string }> = [
  { id: "recommended", label: "Recommended" },
  { id: "price_low", label: "Price (low)" },
  { id: "rating_high", label: "Rating (high)" },
  { id: "distance", label: "Distance" }
]

export function StayResultsComparison({
  searchData,
  isLoading,
  searchToken,
  requestCloseFiltersToken
}: {
  searchData: StaySearchData
  isLoading?: boolean
  searchToken?: number
  requestCloseFiltersToken?: number
}) {
  const router = useRouter()
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isMobile = useMediaQuery("(max-width: 767px)")
  const canGrid = useMediaQuery("(min-width: 1024px)")
  const layout: "desktop" | "tablet" | "mobile" = isDesktop ? "desktop" : isMobile ? "mobile" : "tablet"

  const [filtersOpen, setFiltersOpen] = useState(true)
  const [sortBy, setSortBy] = useState<StaySortOption>("recommended")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [visibleCount, setVisibleCount] = useState(18)
  const [isPending, startTransition] = useTransition()

  const hotelChains = useMemo(() => uniqueHotelChains(MOCK_STAYS), [])
  const priceBounds = useMemo(() => derivePriceBounds(MOCK_STAYS.filter((s) => s.type === searchData.type)), [searchData.type])

  const [filters, setFilters] = useState<StayFiltersState>(() => ({
    ...DEFAULT_STAY_FILTERS,
    priceRange: priceBounds
  }))

  const prevLayoutRef = useRef<"desktop" | "tablet" | "mobile" | null>(null)
  const desktopFiltersPrefRef = useRef(true)

  useEffect(() => {
    // keep filters accessible on resize; only persist desktop preference
    const prev = prevLayoutRef.current
    if (prev === null) {
      // First mount: open filters on desktop, keep closed on tablet/mobile.
      prevLayoutRef.current = layout
      if (layout !== "desktop") setFiltersOpen(false)
      return
    }
    if (prev === layout) return

    if (prev === "desktop") desktopFiltersPrefRef.current = filtersOpen
    if (layout === "desktop") setFiltersOpen(desktopFiltersPrefRef.current)
    prevLayoutRef.current = layout
  }, [layout, filtersOpen])

  useEffect(() => {
    if (!canGrid && viewMode === "grid") setViewMode("list")
  }, [canGrid, viewMode])

  useEffect(() => {
    if (!requestCloseFiltersToken) return
    setFiltersOpen(false)
  }, [requestCloseFiltersToken])

  useEffect(() => {
    if (!searchToken) return
    setVisibleCount(18)
    // keep filters state; just close overlays to reduce visual noise on mobile
    if (layout !== "desktop") setFiltersOpen(false)
  }, [searchToken, layout])

  // When switching type, softly reset type-specific filters and rebase price bounds.
  useEffect(() => {
    startTransition(() =>
      setFilters((f) => ({
        ...f,
        priceRange: priceBounds,
        starRatings: searchData.type === "hotel" ? f.starRatings : [],
        breakfastIncluded: searchData.type === "hotel" ? f.breakfastIncluded : false,
        freeCancellation: searchData.type === "hotel" ? f.freeCancellation : false,
        hotelChains: searchData.type === "hotel" ? f.hotelChains : [],
        aptEntirePlace: searchData.type === "apartment" ? f.aptEntirePlace : false,
        bedroomsMin: searchData.type === "apartment" ? f.bedroomsMin : 0,
        kitchen: searchData.type === "apartment" ? f.kitchen : false,
        washingMachine: searchData.type === "apartment" ? f.washingMachine : false,
        longStayDiscount: searchData.type === "apartment" ? f.longStayDiscount : false
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.type, priceBounds[0], priceBounds[1]])

  const filtered = useMemo(() => applyStayFilters(MOCK_STAYS, searchData, filters), [filters, searchData])
  const sorted = useMemo(() => sortStays(filtered, sortBy), [filtered, sortBy])
  const paged = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])

  useEffect(() => {
    setVisibleCount(18)
  }, [filters, sortBy])

  const chips = useMemo(() => {
    const c: Array<{ key: string; label: string; onRemove: () => void }> = []
    const [min, max] = filters.priceRange
    if (!(min === priceBounds[0] && max === priceBounds[1])) {
      c.push({
        key: "price",
        label: `Price: $${min}–$${max}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, priceRange: priceBounds })))
      })
    }
    if (filters.guestRatingMin > 0) {
      c.push({
        key: "rating",
        label: `Rating: ${filters.guestRatingMin.toFixed(1)}+`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, guestRatingMin: 0 })))
      })
    }
    if (filters.amenities.length) {
      c.push({
        key: "amenities",
        label: `Amenities: ${filters.amenities.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, amenities: [] })))
      })
    }
    if (filters.locationRadiusKm !== DEFAULT_STAY_FILTERS.locationRadiusKm) {
      c.push({
        key: "radius",
        label: `Within ${filters.locationRadiusKm}km`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, locationRadiusKm: DEFAULT_STAY_FILTERS.locationRadiusKm })))
      })
    }

    if (searchData.type === "hotel") {
      if (filters.starRatings.length) {
        c.push({
          key: "stars",
          label: `Stars: ${filters.starRatings.sort((a, b) => b - a).join(",")}`,
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, starRatings: [] })))
        })
      }
      if (filters.breakfastIncluded) {
        c.push({
          key: "breakfast",
          label: "Breakfast included",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, breakfastIncluded: false })))
        })
      }
      if (filters.freeCancellation) {
        c.push({
          key: "cancel",
          label: "Free cancellation",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, freeCancellation: false })))
        })
      }
      if (filters.hotelChains.length) {
        c.push({
          key: "chains",
          label: `Chains: ${filters.hotelChains.length}`,
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, hotelChains: [] })))
        })
      }
    } else {
      if (filters.aptEntirePlace) {
        c.push({
          key: "entire",
          label: "Entire place",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, aptEntirePlace: false })))
        })
      }
      if (filters.bedroomsMin > 0) {
        c.push({
          key: "beds",
          label: `${filters.bedroomsMin}+ bedrooms`,
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, bedroomsMin: 0 })))
        })
      }
      if (filters.kitchen) {
        c.push({
          key: "kitchen",
          label: "Kitchen",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, kitchen: false })))
        })
      }
      if (filters.washingMachine) {
        c.push({
          key: "washer",
          label: "Washing machine",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, washingMachine: false })))
        })
      }
      if (filters.longStayDiscount) {
        c.push({
          key: "longstay",
          label: "Long-stay discount",
          onRemove: () => startTransition(() => setFilters((f) => ({ ...f, longStayDiscount: false })))
        })
      }
    }

    return c
  }, [filters, priceBounds, searchData.type, startTransition])

  const openDetails = (id: string) => {
    const params = new URLSearchParams()
    params.set("type", searchData.type)
    params.set("dest", searchData.destination)
    params.set("checkIn", searchData.checkIn)
    params.set("checkOut", searchData.checkOut)
    params.set("adults", String(searchData.guests.adults))
    params.set("children", String(searchData.guests.children))
    params.set("guests", String(totalGuests(searchData.guests)))
    params.set("rooms", String(searchData.rooms))
    if (searchData.entirePlace) params.set("entirePlace", "1")
    router.push(`/stay/${encodeURIComponent(id)}?${params.toString()}`)
  }

  const SkeletonCard = ({ variant }: { variant: "listing" | "grid" }) => {
    return variant === "grid" ? (
      <div className="clean-card border border-border/60 overflow-hidden animate-pulse">
        <div className="aspect-video bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded-full" />
            <div className="h-6 w-16 bg-muted rounded-full" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="pt-3 border-t border-border/60 flex items-end justify-between">
            <div className="space-y-2">
              <div className="h-3 w-10 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="h-10 w-28 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    ) : (
      <div className="clean-card border border-border/60 overflow-hidden animate-pulse">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 md:w-64 shrink-0">
            <div className="aspect-4/3 sm:aspect-4/3 bg-muted" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="h-4 w-2/3 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
            <div className="flex gap-2 flex-wrap">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="pt-3 border-t border-border/60 flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-3 w-10 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="h-10 w-28 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-background">
      <div className="container py-6">
        <div className="mx-auto max-w-6xl">
          <div className={layout === "desktop" ? "flex gap-6" : ""}>
            {/* Desktop filters rail (smooth collapse) */}
            {layout === "desktop" ? (
              <aside
                className={[
                  "shrink-0 transition-[width,opacity,transform] duration-300 ease-out",
                  filtersOpen ? "w-80 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-2 pointer-events-none"
                ].join(" ")}
              >
                <div
                  className="sticky"
                  style={{
                    top: "var(--sticky-stack-h, 144px)",
                    height: "calc(100vh - var(--sticky-stack-h, 144px))"
                  }}
                >
                  <StayFilters
                    isOpen
                    stayType={searchData.type}
                    value={filters}
                    onChange={(next) => startTransition(() => setFilters(next))}
                    onReset={() => startTransition(() => setFilters({ ...DEFAULT_STAY_FILTERS, priceRange: priceBounds }))}
                    hotelChains={hotelChains}
                    className="shadow-sm"
                  />
                </div>
              </aside>
            ) : null}

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div
                className={[
                  layout === "desktop" ? "relative" : "sticky z-30",
                  "bg-background/90 backdrop-blur-sm border border-border/60 rounded-2xl"
                ].join(" ")}
                style={layout === "desktop" ? undefined : { top: "var(--sticky-stack-h, 144px)" }}
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h2 className="text-base sm:text-lg font-semibold truncate">
                          {sorted.length} {searchData.type === "hotel" ? "hotels" : "apartments"} in{" "}
                          {searchData.destination?.trim() ? searchData.destination.trim() : "Africa"}
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                          From ${priceBounds[0]}/night
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {totalGuests(searchData.guests)} guest{totalGuests(searchData.guests) > 1 ? "s" : ""} • Sorted by{" "}
                        {sortOptions.find((o) => o.id === sortBy)?.label ?? "Recommended"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                      <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)}>
                        <Filter className="h-4 w-4 mr-2" />
                        {layout === "desktop" ? (filtersOpen ? "Hide filters" : "Show filters") : "Filters"}
                      </Button>

                      <div className="inline-flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={sortBy}
                          onChange={(e) => startTransition(() => setSortBy(e.target.value as StaySortOption))}
                          className="h-9 px-3 border border-border/60 rounded-lg text-sm bg-background dark:bg-input"
                          aria-label="Sort stays"
                        >
                          {sortOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {canGrid ? (
                        <div className="hidden md:flex border border-border/60 rounded-lg overflow-hidden">
                          <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="rounded-none"
                            aria-label="List view"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="rounded-none"
                            aria-label="Grid view"
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Chips row */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-3">
                    <div className="flex gap-2 flex-wrap">
                      {chips.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No filters applied</span>
                      ) : (
                        chips.map((c) => (
                          <button
                            key={c.key}
                            className="px-3 py-1.5 text-xs border border-border/60 bg-background/70 rounded-full hover:bg-accent/60 transition-colors"
                            onClick={c.onRemove}
                            aria-label={`Remove filter: ${c.label}`}
                          >
                            {c.label} <span className="ml-1 text-muted-foreground">×</span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isPending ? <span className="text-xs text-muted-foreground">Updating…</span> : null}
                      {chips.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startTransition(() => setFilters({ ...DEFAULT_STAY_FILTERS, priceRange: priceBounds }))}
                        >
                          Reset
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="mt-4">
                <div
                  className={[
                    viewMode === "grid" ? "grid gap-4 lg:grid-cols-2" : "space-y-3"
                  ].join(" ")}
                >
                  {isLoading ? (
                    Array.from({ length: viewMode === "grid" ? 6 : 6 }).map((_, i) => (
                      <SkeletonCard key={i} variant={viewMode === "grid" ? "grid" : "listing"} />
                    ))
                  ) : (
                    paged.map((s) => (
                      <StayResultCard
                        key={s.id}
                        stay={s}
                        onView={() => openDetails(s.id)}
                        variant={viewMode === "grid" ? "grid" : "listing"}
                      />
                    ))
                  )}
                </div>

                {sorted.length > paged.length ? (
                  <div className="text-center mt-8">
                    <Button variant="outline" onClick={() => setVisibleCount((c) => c + 18)}>
                      Load more
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet left drawer */}
      {layout === "tablet" && filtersOpen ? (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-background h-dvh shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <StayFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              stayType={searchData.type}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters({ ...DEFAULT_STAY_FILTERS, priceRange: priceBounds }))}
              hotelChains={hotelChains}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      ) : null}

      {/* Mobile bottom sheet */}
      {layout === "mobile" && filtersOpen ? (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-background border-t border-border overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <StayFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              stayType={searchData.type}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters({ ...DEFAULT_STAY_FILTERS, priceRange: priceBounds }))}
              hotelChains={hotelChains}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

