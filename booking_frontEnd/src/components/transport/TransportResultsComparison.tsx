"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Filter, Grid, List, SortAsc } from "lucide-react"
import type { TransportFiltersState, TransportSearchData, TransportSortOption } from "@/lib/transport-types"
import { MOCK_TRANSPORT } from "@/lib/mock-transport"
import { applyTransportFilters, buildDefaultTransportFilters, deriveTransportPriceBounds, sortTransport, uniqueProviders } from "@/lib/transport-utils"
import { useMediaQuery } from "@/lib/use-media-query"
import { TransportFilters } from "@/components/transport/TransportFilters"
import { TransportResultCard } from "@/components/transport/TransportResultCard"

const sortOptions: Array<{ id: TransportSortOption; label: string }> = [
  { id: "recommended", label: "Recommended" },
  { id: "price_low", label: "Price (low → high)" },
  { id: "rating", label: "Rating" }
]

function firstNonEmpty(...v: Array<string | undefined | null>) {
  for (const x of v) if (x && x.trim()) return x.trim()
  return ""
}

function SkeletonCard({ variant }: { variant: "grid" | "listing" }) {
  if (variant === "grid") {
    return (
      <div className="clean-card border border-border/60 overflow-hidden animate-pulse">
        <div className="aspect-video bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="flex gap-2 flex-wrap">
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-6 w-24 bg-muted rounded-full" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="pt-3 border-t border-border/60 flex items-end justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="h-10 w-44 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="clean-card border border-border/60 overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-56 md:w-64 shrink-0">
          <div className="aspect-4/3 sm:aspect-4/3 bg-muted" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="flex gap-2 flex-wrap">
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-6 w-24 bg-muted rounded-full" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="pt-3 border-t border-border/60 flex items-end justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="h-10 w-44 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TransportResultsComparison({
  searchData,
  isLoading,
  searchToken,
  requestCloseFiltersToken
}: {
  searchData: TransportSearchData
  isLoading: boolean
  searchToken?: number
  requestCloseFiltersToken?: number
}) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const canGrid = useMediaQuery("(min-width: 1024px)")
  const layout: "desktop" | "tablet" | "mobile" = isDesktop ? "desktop" : isMobile ? "mobile" : "tablet"
  const [isPending, startTransition] = useTransition()

  const itemsForTab = useMemo(() => {
    return MOCK_TRANSPORT.filter((t) => (searchData.tab === "airport_pickup" ? t.kind === "airport_pickup" : t.kind === "car_rental"))
  }, [searchData.tab])

  const priceBounds = useMemo(() => deriveTransportPriceBounds(itemsForTab), [itemsForTab])
  const providers = useMemo(() => uniqueProviders(itemsForTab), [itemsForTab])

  const [filters, setFilters] = useState<TransportFiltersState>(() => buildDefaultTransportFilters(priceBounds))
  const [filtersOpen, setFiltersOpen] = useState(true)
  const desktopFiltersPrefRef = useRef(true)

  const [sortBy, setSortBy] = useState<TransportSortOption>("recommended")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [visibleCount, setVisibleCount] = useState(18)

  // Rebase filters when switching tab / bounds change.
  useEffect(() => {
    startTransition(() => setFilters((f) => ({ ...f, priceRange: priceBounds })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.tab, priceBounds[0], priceBounds[1]])

  useEffect(() => {
    if (layout === "desktop") setFiltersOpen(desktopFiltersPrefRef.current)
    else setFiltersOpen(false)
  }, [layout])

  useEffect(() => {
    if (!requestCloseFiltersToken) return
    setFiltersOpen(false)
  }, [requestCloseFiltersToken])

  useEffect(() => {
    if (!searchToken) return
    if (layout !== "desktop") setFiltersOpen(false)
    setVisibleCount(18)
  }, [searchToken, layout])

  useEffect(() => {
    setVisibleCount(18)
  }, [filters, sortBy])

  const filtered = useMemo(() => applyTransportFilters(MOCK_TRANSPORT, searchData, filters), [filters, searchData])
  const sorted = useMemo(() => sortTransport(filtered, sortBy), [filtered, sortBy])
  const paged = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])

  const chips = useMemo(() => {
    const out: Array<{ key: string; label: string; onRemove: () => void }> = []
    const [minP, maxP] = filters.priceRange
    if (minP > priceBounds[0] || maxP < priceBounds[1]) {
      out.push({
        key: "price",
        label: `$${minP}–$${maxP}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, priceRange: priceBounds })))
      })
    }
    if (filters.vehicleTypes.length) {
      out.push({
        key: "vehicle",
        label: `Vehicle ${filters.vehicleTypes.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, vehicleTypes: [] })))
      })
    }
    if (filters.driverModes.length) {
      out.push({
        key: "driver",
        label: `Driver ${filters.driverModes.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, driverModes: [] })))
      })
    }
    if (filters.capacityMin > 1) {
      out.push({
        key: "cap",
        label: `${filters.capacityMin}+ seats`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, capacityMin: 1 })))
      })
    }
    if (filters.providers.length) {
      out.push({
        key: "prov",
        label: `Providers ${filters.providers.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, providers: [] })))
      })
    }
    if (filters.ratingMin > 0) {
      out.push({
        key: "rating",
        label: `Rating ${filters.ratingMin.toFixed(1)}+`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, ratingMin: 0 })))
      })
    }
    if (filters.freeCancellation) {
      out.push({
        key: "cancel",
        label: "Free cancellation",
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, freeCancellation: false })))
      })
    }
    return out
  }, [filters, priceBounds, startTransition])

  const openDetails = (id: string) => {
    const params = new URLSearchParams()
    params.set("tab", searchData.tab)
    params.set("passengers", String(Math.max(1, searchData.passengers || 1)))
    if (searchData.tab === "airport_pickup") {
      if (searchData.pickupAirport) params.set("airport", searchData.pickupAirport.code)
      if (searchData.dropOffLocation.trim()) params.set("dropoff", searchData.dropOffLocation.trim())
      if (searchData.pickupDateTime) params.set("dt", searchData.pickupDateTime)
    } else {
      if (searchData.rentalPickupLocation.trim()) params.set("pickup", searchData.rentalPickupLocation.trim())
      if (searchData.rentalPickupDateTime) params.set("pickupDt", searchData.rentalPickupDateTime)
      if (searchData.rentalReturnDateTime) params.set("returnDt", searchData.rentalReturnDateTime)
      params.set("carType", searchData.carType)
      params.set("driver", searchData.rentalDriverMode)
    }
    router.push(`/transport/details/${encodeURIComponent(id)}?${params.toString()}`)
  }

  const summaryTitle =
    searchData.tab === "airport_pickup"
      ? `${sorted.length} airport pickups`
      : `${sorted.length} car rentals`

  const summarySubtitle =
    searchData.tab === "airport_pickup"
      ? firstNonEmpty(searchData.pickupAirport?.city, "Airport pickup") +
        ` • ${Math.max(1, searchData.passengers || 1)} passenger${Math.max(1, searchData.passengers || 1) > 1 ? "s" : ""}`
      : firstNonEmpty(searchData.rentalPickupLocation, "Car rentals") +
        ` • ${Math.max(1, searchData.passengers || 1)} passenger${Math.max(1, searchData.passengers || 1) > 1 ? "s" : ""}`

  return (
    <section className="bg-background">
      <div className="container py-6">
        <div className="mx-auto max-w-6xl">
          <div className={layout === "desktop" ? "flex gap-6" : ""}>
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
                  <TransportFilters
                    isOpen
                    value={filters}
                    onChange={(next) => startTransition(() => setFilters(next))}
                    onReset={() => startTransition(() => setFilters(buildDefaultTransportFilters(priceBounds)))}
                    providers={providers}
                    priceMaxCap={Math.max(120, priceBounds[1])}
                    className="shadow-sm"
                  />
                </div>
              </aside>
            ) : null}

            <div className="flex-1 min-w-0">
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
                        <h2 className="text-base sm:text-lg font-semibold truncate">{summaryTitle}</h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                          {summarySubtitle}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        Sorted by {sortOptions.find((o) => o.id === sortBy)?.label ?? "Recommended"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (layout === "desktop") {
                            desktopFiltersPrefRef.current = !filtersOpen
                          }
                          setFiltersOpen(!filtersOpen)
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {layout === "desktop" ? (filtersOpen ? "Hide filters" : "Show filters") : "Filters"}
                      </Button>

                      <div className="inline-flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={sortBy}
                          onChange={(e) => startTransition(() => setSortBy(e.target.value as TransportSortOption))}
                          className="h-9 px-3 border border-border/60 rounded-lg text-sm bg-background dark:bg-input"
                          aria-label="Sort transport"
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
                        <Button variant="ghost" size="sm" onClick={() => startTransition(() => setFilters(buildDefaultTransportFilters(priceBounds)))}>
                          Reset
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {sorted.length === 0 && !isLoading ? (
                  <div className="clean-card p-6 border border-border/60">
                    <div className="text-lg font-semibold">No options found</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Try widening price range, removing a filter, or switching vehicle type.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => startTransition(() => setFilters(buildDefaultTransportFilters(priceBounds)))}>
                        Clear filters
                      </Button>
                      <Button
                        onClick={() => {
                          startTransition(() => setSortBy("recommended"))
                          startTransition(() => setFiltersOpen(true))
                        }}
                      >
                        Browse recommended
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === "grid" ? "grid gap-4 lg:grid-cols-2" : "space-y-3"}>
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} variant={viewMode === "grid" ? "grid" : "listing"} />)
                      : paged.map((t) => (
                          <TransportResultCard
                            key={t.id}
                            service={t}
                            onView={() => openDetails(t.id)}
                            onBook={() => openDetails(t.id)}
                            variant={viewMode === "grid" ? "grid" : "listing"}
                          />
                        ))}
                  </div>
                )}

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
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background h-dvh shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <TransportFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters(buildDefaultTransportFilters(priceBounds)))}
              providers={providers}
              priceMaxCap={Math.max(120, priceBounds[1])}
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
            <TransportFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters(buildDefaultTransportFilters(priceBounds)))}
              providers={providers}
              priceMaxCap={Math.max(120, priceBounds[1])}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

