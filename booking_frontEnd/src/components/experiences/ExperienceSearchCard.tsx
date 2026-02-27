"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, MapPin, Search, Users } from "lucide-react"
import type { ExperienceCategory, ExperienceSearchData, ExperienceTravelers } from "@/lib/experience-types"
import { categoryLabel, totalTravelers } from "@/lib/experience-utils"
import { MOCK_EXPERIENCES } from "@/lib/mock-experiences"
import { useMediaQuery } from "@/lib/use-media-query"

type Props = {
  value: ExperienceSearchData
  onChange: (next: ExperienceSearchData) => void
  onSearch: () => void
  className?: string
  ctaLabel?: string
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

export function ExperienceSearchCard({ value, onChange, onSearch, className = "", ctaLabel }: Props) {
  const isMobile = useMediaQuery("(max-width: 767px)")
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
    const q = (value.destination || "").trim().toLowerCase()
    if (!q) return DESTS.slice(0, 8)
    return DESTS.filter((d) => d.toLowerCase().includes(q)).slice(0, 8)
  }, [value.destination])

  const travelersLabel = useMemo(() => {
    const t = totalTravelers(value.travelers)
    const parts = [`${t} traveler${t > 1 ? "s" : ""}`]
    parts.push(`${value.travelers.adults} adult${value.travelers.adults > 1 ? "s" : ""}`)
    if (value.travelers.children) parts.push(`${value.travelers.children} child${value.travelers.children === 1 ? "" : "ren"}`)
    return parts.join(" • ")
  }, [value.travelers])

  const openTravelers = () => {
    if (isMobile) setSheetOpen(true)
    else setTravOpen((v) => !v)
  }

  const setTravelers = (next: ExperienceTravelers) => {
    onChange({ ...value, travelers: next })
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
              onClick={() => setTravelers({ ...value.travelers, adults: clamp(value.travelers.adults - 1, 1, 20) })}
              aria-label="Decrease adults"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{value.travelers.adults}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setTravelers({ ...value.travelers, adults: clamp(value.travelers.adults + 1, 1, 20) })}
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
              onClick={() => setTravelers({ ...value.travelers, children: clamp(value.travelers.children - 1, 0, 10) })}
              aria-label="Decrease children"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{value.travelers.children}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setTravelers({ ...value.travelers, children: clamp(value.travelers.children + 1, 0, 10) })}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Total travelers: <span className="font-medium text-foreground">{totalTravelers(value.travelers)}</span>
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
    <div
      className={[
        "clean-card border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl shadow-black/5",
        className
      ].join(" ")}
    >
      <div className="p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
          {/* Where to */}
          <div className="lg:col-span-5" ref={destWrapRef}>
            <label className="text-sm font-medium">Where to</label>
            <div className="relative mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="clean-input pl-9"
                placeholder="City or country"
                value={value.destination}
                onFocus={() => setDestOpen(true)}
                onChange={(e) => {
                  onChange({ ...value, destination: e.target.value })
                  setDestOpen(true)
                }}
              />
              {destOpen ? (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                  <div className="p-3 text-xs text-muted-foreground">Popular picks</div>
                  <div className="max-h-64 overflow-auto">
                    {destinationSuggestions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors"
                        onClick={() => {
                          onChange({ ...value, destination: d })
                          setDestOpen(false)
                        }}
                      >
                        <div className="text-sm font-medium">{d.split(",")[0]}</div>
                        <div className="text-xs text-muted-foreground">{d.split(",").slice(1).join(",").trim()}</div>
                      </button>
                    ))}
                    {destinationSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">No matches.</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Date */}
          <div className="lg:col-span-3">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="clean-input mt-1"
              value={value.date}
              onChange={(e) => onChange({ ...value, date: e.target.value })}
              aria-label="Experience date"
            />
          </div>

          {/* Tour type */}
          <div className="lg:col-span-2">
            <label className="text-sm font-medium">Tour type</label>
            <select
              className="clean-input mt-1"
              value={value.category}
              onChange={(e) => onChange({ ...value, category: e.target.value as ExperienceCategory | "any" })}
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
          <div className="lg:col-span-2 relative" ref={travWrapRef}>
            <label className="text-sm font-medium">Travelers</label>
            <button
              type="button"
              className="clean-input mt-1 flex items-center justify-between gap-2"
              onClick={openTravelers}
              aria-label="Open travelers selector"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{travelersLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {!isMobile && travOpen ? (
              <div className="absolute z-50 top-full mt-2 right-0 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden px-4 py-3">
                <div className="p-3 border-b border-border">
                  <div className="font-semibold">Travelers</div>
                  <div className="text-xs text-muted-foreground">Adults and children counts.</div>
                </div>
                <TravelersEditor variant="popover" />
              </div>
            ) : null}
          </div>

          {/* CTA */}
          <div className="lg:col-span-12 lg:flex lg:justify-end">
            <Button className="h-11 px-6 w-full lg:w-auto" onClick={onSearch}>
              <Search className="h-4 w-4 mr-2" />
              {ctaLabel ?? "Search experiences"}
            </Button>
          </div>
        </div>

        {/* Micro-hint */}
        <div className="mt-3 text-xs text-muted-foreground">
          Tip: choose a tour type like <span className="text-foreground font-medium">{categoryLabel(value.category)}</span> to reduce options.
        </div>
      </div>

      {/* Mobile bottom sheet for travelers */}
      {isMobile && sheetOpen ? (
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
      ) : null}
    </div>
  )
}

