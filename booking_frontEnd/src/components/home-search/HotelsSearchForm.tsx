"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, ChevronDown, BedDouble } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AFRICA_STAY_DESTINATIONS } from "@/lib/stay-destinations"
import { useMediaQuery } from "@/lib/use-media-query"
import type { StayGuests } from "@/lib/stay-types"

type HotelSearchState = {
  destination: string
  checkIn: string
  checkOut: string
  guests: StayGuests
  rooms: number
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

function calcNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  const diff = d2.getTime() - d1.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function HotelsSearchForm({ onSearch, isSearching }: Props) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [state, setState] = useState<HotelSearchState>({
    destination: "",
    checkIn: todayPlusDate(7),
    checkOut: todayPlusDate(10),
    guests: { adults: 2, children: 0 },
    rooms: 1
  })

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

  const nights = useMemo(() => calcNights(state.checkIn, state.checkOut), [state.checkIn, state.checkOut])

  const destinationSuggestions = useMemo(() => {
    const q = state.destination.trim().toLowerCase()
    if (!q) return AFRICA_STAY_DESTINATIONS.slice(0, 6)
    return AFRICA_STAY_DESTINATIONS.filter((d) => `${d.city} ${d.country}`.toLowerCase().includes(q)).slice(0, 6)
  }, [state.destination])

  const totalGuests = useMemo(() => {
    return Math.max(1, state.guests.adults + state.guests.children)
  }, [state.guests])

  const guestsLabel = useMemo(() => {
    const parts = [`${totalGuests} guest${totalGuests > 1 ? "s" : ""}`]
    if (state.rooms > 1) parts.push(`${state.rooms} room${state.rooms > 1 ? "s" : ""}`)
    return parts.join(" • ")
  }, [totalGuests, state.rooms])

  const isValid = useMemo(() => {
    return state.destination.trim() && state.checkIn && state.checkOut && nights > 0
  }, [state, nights])

  const openGuests = () => {
    if (isMobile) setSheetOpen(true)
    else setGuestOpen((v) => !v)
  }

  const handleSearch = () => {
    if (!isValid) return

    const params = new URLSearchParams()
    params.set("type", "hotel")
    params.set("destination", state.destination.trim())
    params.set("checkIn", state.checkIn)
    params.set("checkOut", state.checkOut)
    params.set("adults", String(state.guests.adults))
    if (state.guests.children > 0) params.set("children", String(state.guests.children))
    params.set("rooms", String(state.rooms))

    onSearch()
    router.push(`/stay/search?${params.toString()}`)
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
              onClick={() => setState({ ...state, guests: { ...state.guests, adults: clamp(state.guests.adults - 1, 1, 20) } })}
              aria-label="Decrease adults"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{state.guests.adults}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, guests: { ...state.guests, adults: clamp(state.guests.adults + 1, 1, 20) } })}
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
              onClick={() => setState({ ...state, guests: { ...state.guests, children: clamp(state.guests.children - 1, 0, 10) } })}
              aria-label="Decrease children"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{state.guests.children}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, guests: { ...state.guests, children: clamp(state.guests.children + 1, 0, 10) } })}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Rooms</div>
            <div className="text-xs text-muted-foreground">Hotel rooms</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, rooms: clamp(state.rooms - 1, 1, 10) })}
              aria-label="Decrease rooms"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{state.rooms}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => setState({ ...state, rooms: clamp(state.rooms + 1, 1, 10) })}
              aria-label="Increase rooms"
            >
              +
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Total guests: <span className="font-medium text-foreground">{totalGuests}</span>
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
    <div className="space-y-6 animate-fade-in">
      {/* Search Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Destination */}
        <div className="space-y-2 md:col-span-2" ref={destWrapRef}>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Destination
          </label>
          <div className="relative">
            <input
              className="clean-input w-full dark:bg-input dark:border-border/80 pl-10"
              placeholder="City, hotel, or landmark"
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
                <div className="p-3 text-xs text-muted-foreground">Popular destinations in Africa</div>
                <div className="max-h-64 overflow-auto">
                  {destinationSuggestions.map((d) => (
                    <button
                      key={d.city}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors"
                      onClick={() => {
                        setState({ ...state, destination: d.city })
                        setDestOpen(false)
                      }}
                    >
                      <div className="text-sm font-medium">{d.city}</div>
                      <div className="text-xs text-muted-foreground">{d.country}</div>
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

        {/* Check-in */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Check-in
          </label>
          <input
            type="date"
            value={state.checkIn}
            min={todayPlusDate(0)}
            onChange={(e) => setState({ ...state, checkIn: e.target.value })}
            className="clean-input w-full dark:bg-input dark:border-border/80"
          />
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Check-out
            {nights > 0 && <span className="text-xs text-muted-foreground">({nights} night{nights > 1 ? "s" : ""})</span>}
          </label>
          <input
            type="date"
            value={state.checkOut}
            min={state.checkIn}
            onChange={(e) => setState({ ...state, checkOut: e.target.value })}
            className="clean-input w-full dark:bg-input dark:border-border/80"
          />
        </div>
      </div>

      {/* Guests & Rooms */}
      <div className="w-full relative" ref={guestWrapRef}>
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Guests & Rooms
        </label>
        <button
          type="button"
          className="clean-input mt-2 flex items-center justify-between gap-2 w-full dark:bg-input dark:border-border/80"
          onClick={openGuests}
          aria-label="Open guests selector"
        >
          <span className="truncate">{guestsLabel}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        {!isMobile && guestOpen && (
          <div className="absolute z-50 top-full mt-2 right-0 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden px-4 py-3">
            <div className="p-3 border-b border-border">
              <div className="font-semibold">Guests & rooms</div>
              <div className="text-xs text-muted-foreground">Adjust guests and hotel rooms.</div>
            </div>
            <GuestsEditor variant="popover" />
          </div>
        )}
      </div>

      {/* Search Button */}
      <Button
        size="lg"
        onClick={handleSearch}
        disabled={!isValid || isSearching}
        className="w-full premium-button-primary group"
      >
        <BedDouble className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        {isSearching ? "Searching..." : "Search Hotels"}
      </Button>

      {/* Mobile bottom sheet for guests */}
      {isMobile && sheetOpen && (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Guests">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-background border-t border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Guests & rooms</div>
                <div className="text-xs text-muted-foreground">Adults, children, and rooms.</div>
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
      )}
    </div>
  )
}
