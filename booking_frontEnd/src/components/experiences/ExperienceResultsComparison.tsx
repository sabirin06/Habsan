"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Filter, Grid, List, SortAsc } from "lucide-react"
import type { ExperienceFiltersState, ExperienceSearchData, ExperienceSortOption } from "@/lib/experience-types"
import { MOCK_EXPERIENCES } from "@/lib/mock-experiences"
import {
  applyExperienceFilters,
  buildDefaultExperienceFilters,
  categoryLabel,
  derivePriceBounds,
  sortExperiences,
  totalTravelers,
  uniqueLanguages,
  uniqueLocations,
  uniqueOperators
} from "@/lib/experience-utils"
import { useMediaQuery } from "@/lib/use-media-query"
import { ExperienceFilters } from "./ExperienceFilters"
import { ExperienceResultCard } from "./ExperienceResultCard"

const sortOptions: Array<{ id: ExperienceSortOption; label: string }> = [
  { id: "recommended", label: "Recommended" },
  { id: "price_low", label: "Price (low → high)" },
  { id: "rating", label: "Rating" },
  { id: "duration", label: "Duration" }
]

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
              <div className="h-3 w-10 bg-muted rounded" />
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
              <div className="h-3 w-10 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="h-10 w-44 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExperienceResultsComparison({
  searchData,
  isLoading,
  searchToken,
  requestCloseFiltersToken
}: {
  searchData: ExperienceSearchData
  isLoading: boolean
  searchToken?: number
  requestCloseFiltersToken?: number
}) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const layout: "desktop" | "tablet" | "mobile" = isDesktop ? "desktop" : isMobile ? "mobile" : "tablet"
  const [isPending, startTransition] = useTransition()

  const [sortBy, setSortBy] = useState<ExperienceSortOption>("recommended")
  const [viewMode, setViewMode] = useState<"list" | "grid">(layout === "desktop" ? "list" : "list")
  const [filtersOpen, setFiltersOpen] = useState(true)
  const desktopFiltersPrefRef = useRef(true)

  const priceBounds = useMemo(() => derivePriceBounds(MOCK_EXPERIENCES), [])
  const operators = useMemo(() => uniqueOperators(MOCK_EXPERIENCES), [])
  const locations = useMemo(() => uniqueLocations(MOCK_EXPERIENCES), [])
  const languages = useMemo(() => uniqueLanguages(MOCK_EXPERIENCES), [])

  const [filters, setFilters] = useState<ExperienceFiltersState>(() => buildDefaultExperienceFilters(priceBounds))
  const [visibleCount, setVisibleCount] = useState(18)

  useEffect(() => {
    // keep filters accessible on resize; only persist desktop preference
    const prev = layout
    if (prev === "desktop") desktopFiltersPrefRef.current = filtersOpen
    if (layout === "desktop") setFiltersOpen(desktopFiltersPrefRef.current)
    if (layout !== "desktop") setFiltersOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const filtered = useMemo(() => applyExperienceFilters(MOCK_EXPERIENCES, searchData, filters), [filters, searchData])
  const sorted = useMemo(() => sortExperiences(filtered, sortBy), [filtered, sortBy])
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
    if (filters.ratingMin > 0) {
      out.push({
        key: "rating",
        label: `Rating ${filters.ratingMin.toFixed(1)}+`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, ratingMin: 0 })))
      })
    }
    if (filters.duration.length) {
      out.push({
        key: "duration",
        label: `Duration ${filters.duration.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, duration: [] })))
      })
    }
    if (filters.locations.length) {
      out.push({
        key: "locations",
        label: `Locations ${filters.locations.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, locations: [] })))
      })
    }
    if (filters.categories.length) {
      out.push({
        key: "types",
        label: `Types ${filters.categories.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, categories: [] })))
      })
    }
    if (filters.groupType.length) {
      out.push({
        key: "group",
        label: `Group ${filters.groupType.join(", ")}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, groupType: [] })))
      })
    }
    if (filters.languages.length) {
      out.push({
        key: "lang",
        label: `Language ${filters.languages.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, languages: [] })))
      })
    }
    if (filters.operators.length) {
      out.push({
        key: "ops",
        label: `Operators ${filters.operators.length}`,
        onRemove: () => startTransition(() => setFilters((f) => ({ ...f, operators: [] })))
      })
    }
    return out
  }, [filters, priceBounds, startTransition])

  const openDetails = (id: string) => {
    const params = new URLSearchParams()
    params.set("dest", searchData.destination)
    params.set("date", searchData.date)
    params.set("type", searchData.category)
    params.set("adults", String(searchData.travelers.adults))
    params.set("children", String(searchData.travelers.children))
    router.push(`/experiences/${encodeURIComponent(id)}?${params.toString()}`)
  }

  const onBookFromCard = (id: string) => {
    openDetails(id)
  }

  const summaryDestination = searchData.destination?.trim() ? searchData.destination.trim() : "Africa"
  const summaryType = categoryLabel(searchData.category)

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
                  <ExperienceFilters
                    isOpen
                    value={filters}
                    onChange={(next) => startTransition(() => setFilters(next))}
                    onReset={() => startTransition(() => setFilters(buildDefaultExperienceFilters(priceBounds)))}
                    priceMaxCap={Math.max(300, priceBounds[1])}
                    locations={locations}
                    operators={operators}
                    languages={languages}
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
                        <h2 className="text-base sm:text-lg font-semibold truncate">
                          {sorted.length} experiences in {summaryDestination}
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                          {summaryType}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {totalTravelers(searchData.travelers)} traveler{totalTravelers(searchData.travelers) > 1 ? "s" : ""} • Sorted by{" "}
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
                          onChange={(e) => startTransition(() => setSortBy(e.target.value as ExperienceSortOption))}
                          className="h-9 px-3 border border-border/60 rounded-lg text-sm bg-background dark:bg-input"
                          aria-label="Sort experiences"
                        >
                          {sortOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

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
                        <Button variant="ghost" size="sm" onClick={() => startTransition(() => setFilters(buildDefaultExperienceFilters(priceBounds)))}>
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
                    <div className="text-lg font-semibold">No experiences found</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Try removing a few filters, switching tour type, or searching a nearby city.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => startTransition(() => setFilters(buildDefaultExperienceFilters(priceBounds)))}>
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
                      : paged.map((e) => (
                          <ExperienceResultCard
                            key={e.id}
                            experience={e}
                            onView={() => openDetails(e.id)}
                            onBook={() => onBookFromCard(e.id)}
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
            <ExperienceFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters(buildDefaultExperienceFilters(priceBounds)))}
              priceMaxCap={Math.max(300, priceBounds[1])}
              locations={locations}
              operators={operators}
              languages={languages}
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
            <ExperienceFilters
              isOpen
              onClose={() => setFiltersOpen(false)}
              value={filters}
              onChange={(next) => startTransition(() => setFilters(next))}
              onReset={() => startTransition(() => setFilters(buildDefaultExperienceFilters(priceBounds)))}
              priceMaxCap={Math.max(300, priceBounds[1])}
              locations={locations}
              operators={operators}
              languages={languages}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

