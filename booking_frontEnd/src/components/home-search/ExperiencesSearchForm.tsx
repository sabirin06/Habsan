"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, ChevronDown, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MOCK_EXPERIENCES } from "@/lib/mock-experiences"
import { useMediaQuery } from "@/lib/use-media-query"
import type { ExperienceCategory, ExperienceTravelers } from "@/lib/experience-types"

type ExperiencesSearchState = {
  destination: string
  date: string
  category: ExperienceCategory | "any"
  travelers: ExperienceTravelers
}

type Props = {
  onSearch: () => void
  isSearching: boolean
}

function todayPlusDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function uniqueDestinations() {
  const list = Array.from(new Set(MOCK_EXPERIENCES.map((e) => `${e.location.city}, ${e.location.country}`)))
  return list.sort((a, b) => a.localeCompare(b))
}

const DESTS = uniqueDestinations()

const CATEGORY_OPTIONS: Array<{ id: ExperienceCategory | "any"; label: string }> = [
  { id: "any", label: "Any type" },
  { id: "cultural", label: "Cultural" },
  { id: "adventure", label: "Adventure" },
  { id: "nature", label: "Nature" },
  { id: "city_tours", label: "City tours" },
  { id: "beach", label: "Beach" },
  { id: "family", label: "Family" },
  { id: "private_tours", label: "Private tours" }
]

export function ExperiencesSearchForm({ onSearch, isSearching }: Props) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [state, setState] = useState<ExperiencesSearchState>({
    destination: "",
    date: todayPlusDate(7),
    category: "any",
    travelers: { adults: 2, children: 0 }
  })

  const [destOpen, setDestOpen] = useState(false)
  const [travOpen, setTravOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const destWrapRef = useRef<HTMLDivElement | null>(null)
  const travWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (destWrapRef.current && !destWrapRef.current.contains(t)) setDestOpen(false)
      if (travWrapRef.current && !travWrapRef.current.contains(t)) setTravOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDestOpen(false)
        setTravOpen(false)
        setSheetOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const destinationSuggestions = useMemo(() => {
    const q = state.destination.trim().toLowerCase()
    if (!q) return DESTS.slice(0, 8)
    return DESTS.filter((d) => d.toLowerCase().includes(q)).slice(0, 8)
  }, [state.destination])

  const totalTravelers = useMemo(() => {
    return Math.max(1, state.travelers.adults + state.travelers.children)
  }, [state.travelers])

  const travelersLabel = useMemo(() => {
    const t = totalTravelers
    const parts = [`${t} traveler${t > 1 ? "s" : ""}`]
    return parts.join(" • ")
  }, [totalTravelers])

  const isValid = useMemo(() => {
    return state.destination.trim() && state.date
  }, [state])

  const openTravelers = () => {
    if (isMobile) setSheetOpen(true)
    else setTravOpen((v) => !v)
  }

  const handleSearch = () => {
    if (!isValid) return

    const params = new URLSearchParams()
    params.set("destination", state.destination.trim())
    params.set("date", state.date)
    if (state.category !== "any") params.set("category", state.category)
    params.set("adults", String(state.travelers.adults))
    if (state.travelers.children > 0) params.set("children", String(state.travelers.children))

    onSearch()
    router.push(`/experiences/search?${params.toString()}`)
  }

  const TravelersEditor = ({ variant }: { variant: "popover" | "sheet" }) => (
    <div className={variant === "sheet" ? "p-4" : ""}>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Adults</div>
            <div className="text-xs text-muted-foreground">Ages 13+</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, travelers: { ...state.travelers, adults: clamp(state.travelers.adults - 1, 1, 20) } })}
              aria-label="Decrease adults"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{state.travelers.adults}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, travelers: { ...state.travelers, adults: clamp(state.travelers.adults + 1, 1, 20) } })}
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Children</div>
            <div className="text-xs text-muted-foreground">Ages 0–12</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, travelers: { ...state.travelers, children: clamp(state.travelers.children - 1, 0, 10) } })}
              aria-label="Decrease children"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{state.travelers.children}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, travelers: { ...state.travelers, children: clamp(state.travelers.children + 1, 0, 10) } })}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Total travelers: <span className="font-medium text-foreground">{totalTravelers}</span>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            onClick={() => {
              setTravOpen(false)
              setSheetOpen(false)
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Destination */}
        <div className="space-y-2" ref={destWrapRef}>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Destination
          </label>
          <div className="relative">
            <input
              className="clean-input w-full dark:bg-input dark:border-border/80 pl-10"
              placeholder="City or country"
              value={state.destination}
              onFocus={() => setDestOpen(true)}
              onChange={(e) => {
                setState({ ...state, destination: e.target.value })
                setDestOpen(true)
              }}
            />
            <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            {destOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                <div className="p-3 text-xs text-muted-foreground">Popular experiences</div>
                <div className="max-h-64 overflow-auto">
                  {destinationSuggestions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors"
                      onClick={() => {
                        setState({ ...state, destination: d })
                        setDestOpen(false)
                      }}
                    >
                      <div className="text-sm font-medium">{d.split(",")[0]}</div>
                      <div className="text-xs text-muted-foreground">{d.split(",").slice(1).join(",").trim()}</div>
                    </button>
                  ))}
                  {destinationSuggestions.length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No matches found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Date
          </label>
          <input
            type="date"
            value={state.date}
            min={todayPlusDate(0)}
            onChange={(e) => setState({ ...state, date: e.target.value })}
            className="clean-input w-full dark:bg-input dark:border-border/80"
          />
        </div>

        {/* Tour Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            Tour Type
          </label>
          <select
            className="clean-input w-full dark:bg-input dark:border-border/80"
            value={state.category}
            onChange={(e) => setState({ ...state, category: e.target.value as ExperienceCategory | "any" })}
            aria-label="Tour type"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Travelers */}
        <div className="space-y-2 relative" ref={travWrapRef}>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Travelers
          </label>
          <button
            type="button"
            className="clean-input flex items-center justify-between gap-2 w-full dark:bg-input dark:border-border/80"
            onClick={openTravelers}
            aria-label="Open travelers selector"
          >
            <span className="truncate">{travelersLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>

          {!isMobile && travOpen && (
            <div className="absolute z-50 top-full mt-2 right-0 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden px-4 py-3">
              <div className="p-3 border-b border-border">
                <div className="font-semibold">Travelers</div>
                <div className="text-xs text-muted-foreground">Adults and children counts.</div>
              </div>
              <TravelersEditor variant="popover" />
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <Button
        size="lg"
        onClick={handleSearch}
        disabled={!isValid || isSearching}
        className="w-full premium-button-primary group"
      >
        <Compass className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        {isSearching ? "Searching..." : "Search Experiences"}
      </Button>

      {/* Mobile bottom sheet for travelers */}
      {isMobile && sheetOpen && (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Travelers">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-background border-t border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Travelers</div>
                <div className="text-xs text-muted-foreground">Adults and children counts.</div>
              </div>
              <button type="button" className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm" onClick={() => setSheetOpen(false)}>
                Close
              </button>
            </div>
            <div className="overflow-auto">
              <TravelersEditor variant="sheet" />
            </div>
            <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-border bg-background/95 backdrop-blur-sm">
              <Button className="w-full" onClick={() => setSheetOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
