"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Filter, SortAsc, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlightFilters } from "./flight-filters"
import { FlightResultCard } from "./flight-result-card"
import { FlightDetailsPanel } from "./flight-details-panel"
import type { FiltersState, Flight, SortOption } from "@/lib/flight-types"
import { DEFAULT_FILTERS } from "@/lib/flight-types"
import { applyFilters, sortFlights } from "@/lib/flight-utils"
import { useMediaQuery } from "@/lib/use-media-query"
import type { SearchData } from "./flight-search-compact"
import { useRouter } from "next/navigation"
import { MOCK_FLIGHTS } from "@/lib/mock-flights"
import { saveBookingDraft, type FlightBookingDraft } from "@/lib/booking-storage"

const flights = MOCK_FLIGHTS

const sortOptions: Array<{ id: SortOption; label: string }> = [
  { id: "best", label: "Best" },
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" }
]

type Props = {
  routeLabel?: string
  isLoading?: boolean
  searchToken?: number
  requestCloseFiltersToken?: number
  searchData?: SearchData
}

type Leg = { from: string; to: string; label: string }

function buildLegs(searchData?: SearchData): Leg[] {
  if (!searchData) return [{ from: "JFK", to: "—", label: "Leg 1" }]
  if (searchData.tripType === "multi-city") {
    return searchData.routes.map((r, idx) => ({
      from: r.from?.code ?? "—",
      to: r.to?.code ?? "—",
      label: `Leg ${idx + 1}`
    }))
  }
  if (searchData.tripType === "round-trip") {
    const from = searchData.from.code
    const to = searchData.to.code
    return [
      { from, to, label: "Outbound" },
      { from: to, to: from, label: "Return" }
    ]
  }
  return [{ from: searchData.from.code, to: searchData.to.code, label: "Leg 1" }]
}

export function FlightResultsComparison({
  routeLabel = "JFK → Various destinations",
  isLoading,
  searchToken,
  requestCloseFiltersToken,
  searchData
}: Props) {
  const router = useRouter()
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isMobile = useMediaQuery("(max-width: 767px)")
  const canGrid = useMediaQuery("(min-width: 1024px)")

  const layout: "desktop" | "tablet" | "mobile" = isDesktop ? "desktop" : isMobile ? "mobile" : "tablet"

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeLegIndex, setActiveLegIndex] = useState(0)
  const [selectedByLeg, setSelectedByLeg] = useState<Record<number, string | undefined>>({})
  const [previewFlightId, setPreviewFlightId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("best")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(20)
  const [isPending, startTransition] = useTransition()

  const desktopFiltersPrefRef = useRef(true)
  const prevLayoutRef = useRef<"desktop" | "tablet" | "mobile" | null>(null)

  useEffect(() => {
    const prev = prevLayoutRef.current
    if (prev !== null && prev === layout) return

    // Persist desktop preference when leaving desktop.
    if (prev === "desktop") {
      desktopFiltersPrefRef.current = filtersOpen
    }

    // Apply new layout defaults.
    if (layout === "desktop") {
      setFiltersOpen(desktopFiltersPrefRef.current)
    } else {
      setFiltersOpen(false)
      // On mobile, avoid side panel overlays.
      if (layout === "mobile") setDetailsOpen(false)
    }

    // Disable grid below 1024.
    if (!canGrid) setViewMode("list")

    prevLayoutRef.current = layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  useEffect(() => {
    if (!canGrid && viewMode === "grid") setViewMode("list")
  }, [canGrid, viewMode])

  useEffect(() => {
    if (!requestCloseFiltersToken) return
    setFiltersOpen(false)
  }, [requestCloseFiltersToken])

  useEffect(() => {
    if (!searchToken) return
    // Reset "results workspace" state on new search without clearing filters.
    setActiveLegIndex(0)
    setSelectedByLeg({})
    setPreviewFlightId(null)
    setDetailsOpen(false)
    setVisibleCount(20)
    setFiltersOpen(false)
  }, [searchToken])

  const airlinesForFilter = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of flights) counts.set(f.airline, (counts.get(f.airline) ?? 0) + 1)
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }))
  }, [])

  const filtered = useMemo(() => applyFilters(flights as Flight[], filters), [filters])
  const sorted = useMemo(() => sortFlights(filtered, sortBy), [filtered, sortBy])
  const paged = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])

  useEffect(() => {
    setVisibleCount(20)
  }, [filters, sortBy])

  const legs = useMemo(() => buildLegs(searchData), [searchData])
  const selectedForActiveLeg = selectedByLeg[activeLegIndex] ?? null
  const selectedCount = legs.length === 0 ? 0 : legs.filter((_, idx) => !!selectedByLeg[idx]).length
  const allSelected = legs.length > 0 && selectedCount === legs.length

  const selectedByLegKey = useMemo(() => JSON.stringify(selectedByLeg), [selectedByLeg])

  const previewFlightData = useMemo(
    () => (previewFlightId ? (flights as Flight[]).find((f) => f.id === previewFlightId) : undefined),
    [previewFlightId]
  )

  const handleSelectFlight = (flightId: string) => {
    const current = selectedByLeg[activeLegIndex]
    const isTogglingOff = current === flightId

    setSelectedByLeg((m) => ({ ...m, [activeLegIndex]: isTogglingOff ? undefined : flightId }))
    setPreviewFlightId(isTogglingOff ? null : flightId)

    // Helpful default: advance to next leg if selecting (not deselecting).
    if (!isTogglingOff && activeLegIndex < legs.length - 1) {
      setActiveLegIndex((i) => i + 1)
    }
  }

  const handleOpenDetails = (flightId: string) => {
    setPreviewFlightId(flightId)
    setDetailsOpen(true)
  }

  const handleBookFlight = () => {
    // Handle booking logic
    if (!allSelected) {
      // move focus to first missing leg
      const missingIdx = legs.findIndex((_, idx) => !selectedByLeg[idx])
      if (missingIdx >= 0) setActiveLegIndex(missingIdx)
      return
    }
    const draft: FlightBookingDraft = {
      version: 2,
      kind: "flight",
      createdAt: Date.now(),
      returnUrl: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/flights",
      searchData,
      legs: legs.map((l) => ({ label: l.label, from: l.from, to: l.to })),
      selectedByLeg
    }
    saveBookingDraft(draft)
    router.push("/checkout")
  }

  // Persist selection so the checkout flow can recover state.
  useEffect(() => {
    if (typeof window === "undefined") return
    const draft: FlightBookingDraft = {
      version: 2,
      kind: "flight",
      createdAt: Date.now(),
      returnUrl: `${window.location.pathname}${window.location.search}`,
      searchData,
      legs: legs.map((l) => ({ label: l.label, from: l.from, to: l.to })),
      selectedByLeg
    }
    saveBookingDraft(draft)
    // intentionally avoid deep deps besides JSON key + legs length + searchData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedByLegKey, legs.length, searchData])

  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []

    const [min, max] = filters.priceRange
    if (!(min === DEFAULT_FILTERS.priceRange[0] && max === DEFAULT_FILTERS.priceRange[1])) {
      chips.push({
        key: "price",
        label: `Price: $${min}–$${max}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, priceRange: DEFAULT_FILTERS.priceRange })))
      })
    }

    for (const s of filters.stops) {
      const label = s === "nonstop" ? "Non-stop" : s === "1stop" ? "1 stop" : "2+ stops"
      chips.push({
        key: `stops-${s}`,
        label,
        onRemove: () =>
          startTransition(() =>
            setFilters((f) => ({
              ...f,
              stops: f.stops.filter((x) => x !== s)
            }))
          )
      })
    }

    for (const a of filters.airlines) {
      chips.push({
        key: `air-${a}`,
        label: a,
        onRemove: () =>
          startTransition(() =>
            setFilters((f) => ({
              ...f,
              airlines: f.airlines.filter((x) => x !== a)
            }))
          )
      })
    }

    for (const t of filters.times) {
      const label =
        t === "early" ? "Early" : t === "afternoon" ? "Afternoon" : t === "evening" ? "Evening" : "Night"
      chips.push({
        key: `time-${t}`,
        label,
        onRemove: () =>
          startTransition(() =>
            setFilters((f) => ({
              ...f,
              times: f.times.filter((x) => x !== t)
            }))
          )
      })
    }

    for (const d of filters.durations) {
      const label = d === "under8" ? "Under 8h" : d === "8to16" ? "8–16h" : d === "16to24" ? "16–24h" : "24h+"
      chips.push({
        key: `dur-${d}`,
        label,
        onRemove: () =>
          startTransition(() =>
            setFilters((f) => ({
              ...f,
              durations: f.durations.filter((x) => x !== d)
            }))
          )
      })
    }

    return chips
  }, [filters, startTransition])

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Filters Sidebar (desktop only) */}
        {layout === "desktop" && filtersOpen ? (
          <div className="shrink-0">
            <div className="sticky" style={{ top: "var(--sticky-stack-h, 144px)", height: "calc(100vh - var(--sticky-stack-h, 144px))" }}>
              <FlightFilters
                isOpen
                onClose={() => setFiltersOpen(false)}
                value={filters}
                onChange={(next) => startTransition(() => setFilters(next))}
                onReset={() => startTransition(() => setFilters(DEFAULT_FILTERS))}
                airlines={airlinesForFilter}
              />
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <div
            className={[
              // On desktop we already have a sticky search summary above; avoid stacked sticky toolbars.
              layout === "desktop" ? "relative" : "sticky z-30",
              "bg-background/95 backdrop-blur-sm border-b border-border"
            ].join(" ")}
            style={layout === "desktop" ? undefined : { top: "var(--sticky-stack-h, 144px)" }}
          >
            <div className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {sorted.length} flights found
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {legs[activeLegIndex] ? `${legs[activeLegIndex].from} → ${legs[activeLegIndex].to}` : routeLabel}
                    {legs.length > 1 ? ` • Select flights: ${selectedCount}/${legs.length} legs` : null}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {layout === "desktop" ? (filtersOpen ? "Hide filters" : "Show filters") : "Filters"}
                  </Button>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => startTransition(() => setSortBy(e.target.value as SortOption))}
                    className="px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  {canGrid ? (
                    <div className="hidden md:flex border border-border rounded-md">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-r-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-l-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Leg selector (round-trip / multi-city) */}
              {legs.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {legs.map((l, idx) => {
                    const active = idx === activeLegIndex
                    const selectedId = selectedByLeg[idx]
                    const selectedFlightObj = selectedId ? (flights as Flight[]).find((f) => f.id === selectedId) : undefined
                    const hiddenByFilters = selectedId ? !sorted.some((f) => f.id === selectedId) : false
                    return (
                      <button
                        key={`${l.label}-${idx}`}
                        type="button"
                        onClick={() => setActiveLegIndex(idx)}
                        className={[
                          "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
                          active ? "bg-accent border-border text-foreground" : "border-border hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                        ].join(" ")}
                        aria-label={`Select ${l.label}`}
                      >
                        <span className="font-semibold">{l.label}</span>{" "}
                        <span className="text-muted-foreground/80">
                          {l.from}→{l.to}
                        </span>
                        {selectedFlightObj ? (
                          <span className="ml-2 text-foreground/90">
                            • {selectedFlightObj.airline} {selectedFlightObj.flightNumber}
                            {hiddenByFilters ? <span className="text-muted-foreground"> (hidden by filters)</span> : null}
                          </span>
                        ) : (
                          <span className="ml-2 text-muted-foreground">• Not selected</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {/* Selected filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
                <div className="flex gap-2 flex-wrap">
                  {filterChips.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No filters applied</span>
                  ) : (
                    filterChips.map((c) => (
                      <button
                        key={c.key}
                        className="px-3 py-1 text-xs border border-border rounded-full hover:bg-accent transition-colors"
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
                  {filterChips.length > 0 ? (
                    <Button variant="ghost" size="sm" onClick={() => startTransition(() => setFilters(DEFAULT_FILTERS))}>
                      Reset
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Flight Results */}
          <div className="p-4">
            <div
              className={[
                "space-y-3",
                viewMode === "grid" ? "lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0" : ""
              ].join(" ")}
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-xl bg-background p-4 animate-pulse">
                    <div className="h-4 w-40 bg-muted rounded mb-3" />
                    <div className="h-6 w-full bg-muted rounded mb-2" />
                    <div className="h-6 w-2/3 bg-muted rounded" />
                  </div>
                ))
              ) : (
                paged.map((flight) => (
                  <FlightResultCard
                    key={flight.id}
                    flight={flight}
                    onSelect={handleSelectFlight}
                    onDetails={handleOpenDetails}
                    isSelected={selectedForActiveLeg === flight.id}
                  />
                ))
              )}
            </div>

            {/* Load More */}
            {sorted.length > paged.length ? (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + 20)}>
                  Load more flights
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Flight Details Panel */}
      {detailsOpen && previewFlightData ? (
        layout === "mobile" ? (
          <div className="fixed inset-0 z-60 h-dvh" role="dialog" aria-modal="true" aria-label="Flight details">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDetailsOpen(false)} />
            <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
              <FlightDetailsPanel
                variant="sheet"
                flight={previewFlightData}
                onClose={() => setDetailsOpen(false)}
                onBook={handleBookFlight}
                primaryCtaLabel={
                  legs.length > 1
                    ? allSelected
                      ? "Review & book itinerary"
                      : `Continue (${selectedCount}/${legs.length} legs selected)`
                    : undefined
                }
              />
            </div>
          </div>
        ) : (
          <FlightDetailsPanel
            flight={previewFlightData}
            onClose={() => setDetailsOpen(false)}
            onBook={handleBookFlight}
            primaryCtaLabel={
              legs.length > 1
                ? allSelected
                  ? "Review & book itinerary"
                  : `Continue (${selectedCount}/${legs.length} legs selected)`
                : undefined
            }
          />
        )
      ) : null}

      {/* Mobile Filters Overlay */}
      {layout !== "desktop" && filtersOpen ? (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div
            className={[
              "absolute left-0 top-0 bottom-0 bg-background h-dvh",
              layout === "mobile" ? "w-screen" : "w-80"
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <FlightFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters(DEFAULT_FILTERS))}
              airlines={airlinesForFilter}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}