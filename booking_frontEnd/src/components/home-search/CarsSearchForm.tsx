"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, MapPin, CalendarClock, Users, PlaneLanding } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AirportAutocomplete } from "@/components/flight-search/airport-autocomplete"
import type { Airport } from "@/lib/airports"

type TransportTab = "airport_pickup" | "rent_a_car"
type VehicleType = "any" | "sedan" | "suv" | "van" | "luxury"
type DriverMode = "either" | "self_drive" | "with_driver"

type CarsSearchState = {
  tab: TransportTab
  // Airport pickup
  pickupAirport: Airport | null
  dropOffLocation: string
  pickupDateTime: string
  passengers: number
  // Rent a car
  rentalPickupLocation: string
  rentalPickupDateTime: string
  rentalReturnDateTime: string
  carType: VehicleType
  rentalDriverMode: DriverMode
}

type Props = {
  onSearch: () => void
  isSearching: boolean
}

function todayPlusDateTime(days: number, hour24 = 10) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour24, 0, 0, 0)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function vehicleTypeLabel(v: VehicleType) {
  if (v === "any") return "Any type"
  return v === "sedan" ? "Sedan" : v === "suv" ? "SUV" : v === "van" ? "Van" : "Luxury"
}

export function CarsSearchForm({ onSearch, isSearching }: Props) {
  const router = useRouter()
  const [state, setState] = useState<CarsSearchState>({
    tab: "airport_pickup",
    // Airport pickup
    pickupAirport: null,
    dropOffLocation: "",
    pickupDateTime: todayPlusDateTime(7, 10),
    passengers: 2,
    // Rent a car
    rentalPickupLocation: "",
    rentalPickupDateTime: todayPlusDateTime(7, 10),
    rentalReturnDateTime: todayPlusDateTime(10, 10),
    carType: "any",
    rentalDriverMode: "either"
  })

  const [passengersOpen, setPassengersOpen] = useState(false)
  const passengersWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (passengersWrapRef.current && !passengersWrapRef.current.contains(t)) setPassengersOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPassengersOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const passengersLabel = useMemo(() => {
    const p = Math.max(1, state.passengers)
    return `${p} passenger${p > 1 ? "s" : ""}`
  }, [state.passengers])

  const isValid = useMemo(() => {
    if (state.tab === "airport_pickup") {
      return state.pickupAirport && state.pickupDateTime
    } else {
      return state.rentalPickupLocation.trim() && state.rentalPickupDateTime && state.rentalReturnDateTime
    }
  }, [state])

  const handleSearch = () => {
    if (!isValid) return

    const params = new URLSearchParams()
    params.set("tab", state.tab)
    params.set("passengers", String(Math.max(1, state.passengers)))

    if (state.tab === "airport_pickup") {
      if (state.pickupAirport) params.set("airport", state.pickupAirport.code)
      if (state.dropOffLocation.trim()) params.set("dropoff", state.dropOffLocation.trim())
      params.set("dt", state.pickupDateTime)
    } else {
      if (state.rentalPickupLocation.trim()) params.set("pickup", state.rentalPickupLocation.trim())
      params.set("pickupDt", state.rentalPickupDateTime)
      params.set("returnDt", state.rentalReturnDateTime)
      params.set("carType", state.carType)
      params.set("driver", state.rentalDriverMode)
    }

    onSearch()
    router.push(`/transport/search?${params.toString()}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={state.tab} onValueChange={(v) => setState({ ...state, tab: v as TransportTab })}>
        <TabsList className="w-full">
          <TabsTrigger value="airport_pickup" className="flex-1">
            <PlaneLanding className="h-4 w-4 mr-2" />
            Airport Pickup
          </TabsTrigger>
          <TabsTrigger value="rent_a_car" className="flex-1">
            <Car className="h-4 w-4 mr-2" />
            Rent a Car
          </TabsTrigger>
        </TabsList>

        <TabsContent value="airport_pickup">
          <div className="grid gap-4 md:grid-cols-2">
        {/* Pickup Airport */}
        <div className="space-y-2">
          <AirportAutocomplete
            id="home-pickup-airport"
            label="Pickup Airport"
            placeholder="Search airport (e.g. MGQ)"
            value={state.pickupAirport}
            onChange={(airport) => setState({ ...state, pickupAirport: airport })}
          />
        </div>

        {/* Drop-off Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Drop-off Location
          </label>
          <div className="relative">
            <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="clean-input w-full pl-10 dark:bg-input dark:border-border/80"
              placeholder="Hotel, address, or landmark"
              value={state.dropOffLocation}
              onChange={(e) => setState({ ...state, dropOffLocation: e.target.value })}
            />
          </div>
        </div>

        {/* Pickup Date & Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Pickup Date & Time
          </label>
          <input
            type="datetime-local"
            value={state.pickupDateTime}
            min={todayPlusDateTime(0, 0)}
            onChange={(e) => setState({ ...state, pickupDateTime: e.target.value })}
            className="clean-input w-full dark:bg-input dark:border-border/80"
          />
        </div>

        {/* Passengers */}
        <div className="space-y-2 relative" ref={passengersWrapRef}>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Passengers
          </label>
          <button
            type="button"
            className="clean-input flex items-center justify-between gap-2 w-full dark:bg-input dark:border-border/80"
            onClick={() => setPassengersOpen((v) => !v)}
            aria-label="Open passengers selector"
          >
            <span className="truncate">{passengersLabel}</span>
            <span className="text-muted-foreground text-sm">▾</span>
          </button>

          {passengersOpen && (
            <div className="absolute z-50 top-full mt-2 left-0 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Passengers</div>
                    <div className="text-xs text-muted-foreground">How many people are traveling?</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
                      onClick={() => setState({ ...state, passengers: clamp(state.passengers - 1, 1, 12) })}
                      aria-label="Decrease passengers"
                    >
                      −
                    </button>
                    <div className="w-8 text-center tabular-nums">{Math.max(1, state.passengers)}</div>
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
                      onClick={() => setState({ ...state, passengers: clamp(state.passengers + 1, 1, 12) })}
                      aria-label="Increase passengers"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-end">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    onClick={() => setPassengersOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="rent_a_car">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="clean-input w-full pl-10 dark:bg-input dark:border-border/80"
                  placeholder="City, airport, neighborhood"
                  value={state.rentalPickupLocation}
                  onChange={(e) => setState({ ...state, rentalPickupLocation: e.target.value })}
                />
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Pickup Date & Time
              </label>
              <input
                type="datetime-local"
                value={state.rentalPickupDateTime}
                min={todayPlusDateTime(0, 0)}
                onChange={(e) => setState({ ...state, rentalPickupDateTime: e.target.value })}
                className="clean-input w-full dark:bg-input dark:border-border/80"
              />
            </div>

            {/* Return Date & Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Return Date & Time
              </label>
              <input
                type="datetime-local"
                value={state.rentalReturnDateTime}
                min={state.rentalPickupDateTime}
                onChange={(e) => setState({ ...state, rentalReturnDateTime: e.target.value })}
                className="clean-input w-full dark:bg-input dark:border-border/80"
              />
            </div>

            {/* Car Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Car Type
              </label>
              <select
                className="clean-input w-full dark:bg-input dark:border-border/80"
                value={state.carType}
                onChange={(e) => setState({ ...state, carType: e.target.value as VehicleType })}
              >
                {(["any", "sedan", "suv", "van", "luxury"] as const).map((t) => (
                  <option key={t} value={t}>
                    {vehicleTypeLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Mode */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Driver Options</label>
              <div className="flex flex-wrap gap-2">
                {(["either", "self_drive", "with_driver"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={[
                      "px-4 py-2 rounded-lg border text-sm transition-colors",
                      state.rentalDriverMode === m
                        ? "border-primary/40 bg-primary/10 text-primary font-medium"
                        : "border-border bg-background hover:bg-accent"
                    ].join(" ")}
                    onClick={() => setState({ ...state, rentalDriverMode: m })}
                  >
                    {m === "either" ? "Self-drive or Driver" : m === "self_drive" ? "Self-drive" : "With driver"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search Button */}
      <Button
        size="lg"
        onClick={handleSearch}
        disabled={!isValid || isSearching}
        className="w-full premium-button-primary group"
      >
        <Car className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        {isSearching ? "Searching..." : "Search Cars"}
      </Button>
    </div>
  )
}
