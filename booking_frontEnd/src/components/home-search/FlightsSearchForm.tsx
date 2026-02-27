"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plane, Calendar, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AirportAutocomplete } from "@/components/flight-search/airport-autocomplete"
import { PassengerPicker, type PassengerState } from "@/components/flight-search/passenger-picker"
import type { Airport } from "@/lib/airports"

type TripType = "round-trip" | "one-way" | "multi-city"

type FlightSearchState = {
  from: Airport | null
  to: Airport | null
  departDate: string
  returnDate: string
  passengers: PassengerState
  tripType: TripType
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

export function FlightsSearchForm({ onSearch, isSearching }: Props) {
  const router = useRouter()
  const [state, setState] = useState<FlightSearchState>({
    from: null,
    to: null,
    departDate: todayPlusDate(7),
    returnDate: todayPlusDate(14),
    passengers: { adults: 1, childrenAges: [], infants: 0 },
    tripType: "round-trip"
  })

  const totalPassengers = useMemo(() => {
    return state.passengers.adults + state.passengers.childrenAges.length + state.passengers.infants
  }, [state.passengers])

  const isValid = useMemo(() => {
    return state.from && state.to && state.departDate && (state.tripType === "one-way" || state.returnDate)
  }, [state])

  const handleSwapLocations = () => {
    setState((prev) => ({ ...prev, from: prev.to, to: prev.from }))
  }

  const handleSearch = () => {
    if (!isValid) return

    const params = new URLSearchParams()
    if (state.from) params.set("from", state.from.code)
    if (state.to) params.set("to", state.to.code)
    // align with /flights module URL keys
    params.set("depart", state.departDate)
    if (state.tripType === "round-trip" && state.returnDate) params.set("return", state.returnDate)
    params.set("adults", String(state.passengers.adults))
    if (state.passengers.childrenAges.length > 0) {
      params.set("children", String(state.passengers.childrenAges.length))
      params.set("childrenAges", state.passengers.childrenAges.join(","))
    }
    if (state.passengers.infants > 0) params.set("infants", String(state.passengers.infants))
    params.set("tripType", state.tripType)

    onSearch()
    router.push(`/flights?${params.toString()}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Trip Type Selection */}
      <div className="flex gap-1 p-1 bg-muted/50 dark:bg-white/5 rounded-xl border border-border/50 dark:border-white/10 w-fit">
        {(
          [
            { id: "round-trip", label: "Round Trip" },
            { id: "one-way", label: "One Way" },
            { id: "multi-city", label: "Multi City" }
          ] as const
        ).map((type) => (
          <button
            key={type.id}
            onClick={() => setState({ ...state, tripType: type.id })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              state.tripType === type.id
                ? "bg-background dark:bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-card/50"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* From */}
        <div className="space-y-2">
          <AirportAutocomplete
            id="home-from"
            label="From"
            placeholder="Departure airport"
            value={state.from}
            onChange={(airport) => setState({ ...state, from: airport })}
          />
        </div>

        {/* To */}
        <div className="space-y-2">
          <div className="relative">
            <AirportAutocomplete
              id="home-to"
              label="To"
              placeholder="Destination airport"
              value={state.to}
              onChange={(airport) => setState({ ...state, to: airport })}
            />
            <button
              type="button"
              onClick={handleSwapLocations}
              className="absolute right-3 top-[38px] p-2 rounded-full hover:bg-accent transition-colors z-10"
              aria-label="Swap airports"
            >
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Departure Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Departure
          </label>
          <input
            type="date"
            value={state.departDate}
            min={todayPlusDate(0)}
            onChange={(e) => setState({ ...state, departDate: e.target.value })}
            className="clean-input w-full dark:bg-input dark:border-border/80"
          />
        </div>

        {/* Return Date */}
        {state.tripType === "round-trip" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Return
            </label>
            <input
              type="date"
              value={state.returnDate}
              min={state.departDate}
              onChange={(e) => setState({ ...state, returnDate: e.target.value })}
              className="clean-input w-full dark:bg-input dark:border-border/80"
            />
          </div>
        )}
      </div>

      {/* Passengers */}
      <div className="w-full">
        <PassengerPicker
          id="home-flight-passengers"
          label="Passengers"
          value={state.passengers}
          onChange={(passengers) => setState({ ...state, passengers })}
        />
      </div>

      {/* Search Button */}
      <Button
        size="lg"
        onClick={handleSearch}
        disabled={!isValid || isSearching}
        className="w-full premium-button-primary group"
      >
        <Plane className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        {isSearching ? "Searching..." : "Search Flights"}
      </Button>

    </div>
  )
}
