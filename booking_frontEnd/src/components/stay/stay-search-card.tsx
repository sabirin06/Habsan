"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BedDouble, Calendar, ChevronDown, MapPin, Search, Users } from "lucide-react"
import type { StayGuests, StaySearchData, StayType } from "@/lib/stay-types"
import { calcNights } from "@/lib/stay-utils"
import { AFRICA_STAY_DESTINATIONS } from "@/lib/stay-destinations"
import { useMediaQuery } from "@/lib/use-media-query"
import { StayTypeSwitcher } from "./stay-type-switcher"

type Props = {
  value: StaySearchData
  onChange: (next: StaySearchData) => void
  onSearch: () => void
  className?: string
  ctaLabel?: string
  showTypeToggle?: boolean
}

function totalGuests(g: StayGuests) {
  return Math.max(1, (g.adults || 0) + (g.children || 0))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function StaySearchCard({
  value,
  onChange,
  onSearch,
  className = "",
  ctaLabel,
  showTypeToggle = true
}: Props) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const nights = useMemo(() => calcNights(value.checkIn, value.checkOut), [value.checkIn, value.checkOut])
  const showLongStayHint = value.type === "apartment" && nights >= 7
  const [destOpen, setDestOpen] = useState(false)
  const [guestOpen, setGuestOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const destWrapRef = useRef<HTMLDivElement | null>(null)
  const guestWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (destWrapRef.current && !destWrapRef.current.contains(t)) setDestOpen(false)
      if (guestWrapRef.current && !guestWrapRef.current.contains(t)) setGuestOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDestOpen(false)
        setGuestOpen(false)
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
    if (!q) return AFRICA_STAY_DESTINATIONS.slice(0, 6)
    return AFRICA_STAY_DESTINATIONS.filter((d) => `${d.city} ${d.country}`.toLowerCase().includes(q)).slice(0, 6)
  }, [value.destination])

  const guestsLabel = useMemo(() => {
    const t = totalGuests(value.guests)
    const parts = [`${t} guest${t > 1 ? "s" : ""}`]
    parts.push(`${value.guests.adults} adult${value.guests.adults > 1 ? "s" : ""}`)
    if (value.guests.children) parts.push(`${value.guests.children} child${value.guests.children > 1 ? "ren" : ""}`)
    if (value.type === "hotel" && value.rooms) parts.push(`${value.rooms} room${value.rooms > 1 ? "s" : ""}`)
    return parts.join(" • ")
  }, [value.guests])

  const setType = (t: StayType) => {
    onChange({
      ...value,
      type: t,
      rooms: t === "hotel" ? value.rooms : Math.max(1, value.rooms || 1)
    })
  }

  const setRooms = (n: number) => {
    const next = value.type === "apartment" ? clamp(n, 1, 10) : clamp(n, 0, 10)
    onChange({ ...value, rooms: next })
  }

  const openGuests = () => {
    if (isMobile) setSheetOpen(true)
    else setGuestOpen((v) => !v)
  }

  const GuestsEditor = ({ variant }: { variant: "popover" | "sheet" }) => (
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
              onClick={() => onChange({ ...value, guests: { ...value.guests, adults: clamp(value.guests.adults - 1, 1, 20) } })}
              aria-label="Decrease adults"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{value.guests.adults}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChange({ ...value, guests: { ...value.guests, adults: clamp(value.guests.adults + 1, 1, 20) } })}
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
              onClick={() => onChange({ ...value, guests: { ...value.guests, children: clamp(value.guests.children - 1, 0, 10) } })}
              aria-label="Decrease children"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{value.guests.children}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChange({ ...value, guests: { ...value.guests, children: clamp(value.guests.children + 1, 0, 10) } })}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Rooms</div>
            <div className="text-xs text-muted-foreground">{value.type === "hotel" ? "Optional" : "Required"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setRooms(value.rooms - 1)}
              aria-label="Decrease rooms"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{value.rooms}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setRooms(value.rooms + 1)}
              aria-label="Increase rooms"
            >
              +
            </button>
          </div>
        </div>

        {value.type === "apartment" ? (
          <label className="flex items-center gap-3 pt-2 border-t border-border text-sm">
            <Checkbox checked={value.entirePlace} onCheckedChange={(c) => onChange({ ...value, entirePlace: Boolean(c) })} />
            <span className="flex-1">
              <span className="font-medium">Entire place</span>
              <span className="block text-xs text-muted-foreground">Hide private rooms and shared spaces.</span>
            </span>
          </label>
        ) : null}

        {showLongStayHint ? (
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
            <div className="font-medium">Long-stay hint</div>
            <div className="text-xs text-muted-foreground mt-1">Perks may apply for 7+ nights on eligible apartments.</div>
          </div>
        ) : null}

        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Total guests: <span className="font-medium text-foreground">{totalGuests(value.guests)}</span>
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            onClick={() => {
              setGuestOpen(false)
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
        {/* In-card type toggle (spec) */}
        {showTypeToggle ? (
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-sm font-medium text-muted-foreground">Stay type</div>
            <StayTypeSwitcher value={value.type} onChange={setType} />
          </div>
        ) : null}

        {/* Fields */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
          {/* Destination */}
          <div className="lg:col-span-5" ref={destWrapRef}>
            <label className="text-sm font-medium">Destination</label>
            <div className="relative mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="clean-input pl-9"
                placeholder={value.type === "hotel" ? "City, hotel, landmark" : "City, neighborhood"}
                value={value.destination}
                onFocus={() => setDestOpen(true)}
                onChange={(e) => {
                  onChange({ ...value, destination: e.target.value })
                  setDestOpen(true)
                }}
              />
              {destOpen ? (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                  <div className="p-3 text-xs text-muted-foreground">Popular in Africa</div>
                  <div className="max-h-64 overflow-auto">
                    {destinationSuggestions.map((d) => (
                      <button
                        key={d.city}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors"
                        onClick={() => {
                          onChange({ ...value, destination: d.city })
                          setDestOpen(false)
                        }}
                      >
                        <div className="text-sm font-medium">{d.city}</div>
                        <div className="text-xs text-muted-foreground">{d.country}</div>
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

          {/* Dates (combined control) */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dates</label>
              <div className="text-xs text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</div>
            </div>
            <div className="mt-1 rounded-xl border border-border bg-background dark:bg-input shadow-sm h-11 flex items-stretch overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary dark:border-border/90">
              <div className="flex items-center px-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                className="h-full bg-transparent px-2 text-sm text-foreground outline-none w-full"
                value={value.checkIn}
                onChange={(e) => onChange({ ...value, checkIn: e.target.value })}
                aria-label="Check-in date"
              />
              <div className="w-px bg-border" />
              <input
                type="date"
                className="h-full bg-transparent px-2 text-sm text-foreground outline-none w-full"
                value={value.checkOut}
                onChange={(e) => onChange({ ...value, checkOut: e.target.value })}
                aria-label="Check-out date"
              />
            </div>
          </div>

          {/* Guests (includes rooms + entire place) */}
          <div className="lg:col-span-3 relative" ref={guestWrapRef}>
            <label className="text-sm font-medium">Guests</label>
            <button
              type="button"
              className="clean-input mt-1 flex items-center justify-between gap-2"
              onClick={openGuests}
              aria-label="Open guests selector"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{guestsLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {value.type === "apartment" && value.entirePlace ? (
              <div className="mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                Entire place
              </div>
            ) : null}

            {!isMobile && guestOpen ? (
              <div className="absolute z-50 top-full mt-2 right-0 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden px-4 py-3">
                <div className="p-3 border-b border-border">
                  <div className="font-semibold">Guests & rooms</div>
                  <div className="text-xs text-muted-foreground">Adjust guests, rooms, and stay preferences.</div>
                </div>
                <GuestsEditor variant="popover" />
              </div>
            ) : null}
          </div>

          {/* CTA */}
          <div className="lg:col-span-12 lg:flex lg:justify-end">
            <Button className="h-11 px-6 w-full lg:w-auto" onClick={onSearch}>
              <Search className="h-4 w-4 mr-2" />
              {ctaLabel ?? "Search stays"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet for guests */}
      {isMobile && sheetOpen ? (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Guests">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-background border-t border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Guests & rooms</div>
                <div className="text-xs text-muted-foreground">Adults, children, rooms, and preferences.</div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                onClick={() => setSheetOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-auto">
              <GuestsEditor variant="sheet" />
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

