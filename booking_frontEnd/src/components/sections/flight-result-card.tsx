"use client"

import * as React from "react"
import { Plane, Wifi, Coffee, Luggage, Star, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Flight } from "@/lib/flight-types"
import { useMediaQuery } from "@/lib/use-media-query"

interface FlightResultCardProps {
  flight: Flight
  onSelect?: (flightId: string) => void
  onDetails?: (flightId: string) => void
  isSelected?: boolean
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  meals: Coffee,
  entertainment: Star,
  lounge: Star,
  shower: Star
}

export function FlightResultCard({ flight, onSelect, onDetails, isSelected = false }: FlightResultCardProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [mobileDetailsOpen, setMobileDetailsOpen] = React.useState(false)

  const handleSelect = () => onSelect?.(flight.id)
  const handleDetails = () => onDetails?.(flight.id)

  if (isMobile) {
    return (
      <div
        className={[
          "border rounded-xl bg-background transition-shadow",
          isSelected ? "border-primary/60 ring-2 ring-primary/10" : "border-border"
        ].join(" ")}
      >
        <div className="p-4 space-y-3">
          {/* Row 1: Airline + aircraft */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={flight.logo} alt={flight.airline} className="w-8 h-8 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{flight.airline}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {flight.flightNumber} • {flight.aircraft}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              {flight.originalPrice ? (
                <div className="text-xs text-muted-foreground line-through">${flight.originalPrice}</div>
              ) : null}
              <div className="text-lg font-bold leading-none">${flight.price}</div>
              <div className="text-[11px] text-muted-foreground">per person</div>
            </div>
          </div>

          {/* Row 2: Times */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold tabular-nums">
              {flight.departure.time} <span className="text-xs text-muted-foreground">({flight.departure.code})</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {flight.duration} • {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {flight.arrival.time}
              {flight.arrival.nextDay ? <span className="text-xs text-red-500 ml-1 align-top">+1</span> : null}{" "}
              <span className="text-xs text-muted-foreground">({flight.arrival.code})</span>
            </div>
          </div>

          {/* Row 3: Compact meta */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">Cabin: {flight.cabinClass}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1">
              <Luggage className="h-3 w-3" />
              {flight.baggage.carry} + {flight.baggage.checked}
            </span>
          </div>

          {/* Row 4: Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              className="text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-accent"
              onClick={() => setMobileDetailsOpen((v) => !v)}
              aria-expanded={mobileDetailsOpen}
            >
              Details {mobileDetailsOpen ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />}
            </button>
            <Button onClick={handleSelect} className="px-6">
              {isSelected ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Selected
                </span>
              ) : (
                "Select"
              )}
            </Button>
          </div>
        </div>

        {/* Mobile accordion details */}
        {mobileDetailsOpen ? (
          <div className="border-t border-border bg-muted/20 p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-muted-foreground">Amenities</div>
              <div className="flex items-center gap-1">
                {flight.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Star
                  return (
                    <span key={amenity} className="p-1 rounded bg-primary/10" title={amenity}>
                      <Icon className="h-3 w-3 text-primary" />
                    </span>
                  )
                })}
              </div>
            </div>
            {flight.cancellation ? (
              <div>
                <div className="font-medium">Cancellation</div>
                <div className="text-muted-foreground">{flight.cancellation}</div>
              </div>
            ) : null}
            {flight.changes ? (
              <div>
                <div className="font-medium">Changes</div>
                <div className="text-muted-foreground">{flight.changes}</div>
              </div>
            ) : null}

            {onDetails ? (
              <Button variant="outline" size="sm" className="w-full" onClick={handleDetails}>
                View full flight details
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={[
        "border rounded-xl bg-background hover:shadow-md transition-shadow",
        isSelected ? "border-primary/60 ring-2 ring-primary/10" : "border-border"
      ].join(" ")}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleDetails()
      }}
      aria-label={`Flight option: ${flight.airline} ${flight.flightNumber}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <img
              src={flight.logo}
              alt={flight.airline}
              className="w-8 h-8 rounded object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{flight.airline}</div>
              <div className="text-xs text-muted-foreground">
                {flight.flightNumber} • {flight.aircraft}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex-1 min-w-0">
            {/* Departure */}
            <div className="flex items-center gap-3">
              <div className="text-center shrink-0">
                <div className="text-lg font-bold leading-none">{flight.departure.time}</div>
                <div className="text-xs text-muted-foreground">{flight.departure.code}</div>
              </div>

              {/* Visualization */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center relative">
                  <div className="h-px bg-border flex-1" />
                  <div className="mx-2 flex flex-col items-center">
                    <Plane className="h-3 w-3 text-muted-foreground" />
                    <div className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">{flight.duration}</div>
                  </div>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="truncate">Cabin: {flight.cabinClass}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Luggage className="h-3 w-3" />
                    {flight.baggage.carry} + {flight.baggage.checked}
                  </span>
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center shrink-0">
                <div className="text-lg font-bold leading-none">
                  {flight.arrival.time}
                  {flight.arrival.nextDay && <span className="text-xs text-red-500 ml-0.5 align-top">+1</span>}
                </div>
                <div className="text-xs text-muted-foreground">{flight.arrival.code}</div>
              </div>
            </div>

            {/* Tiny amenity + rating row */}
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {flight.amenities.slice(0, 3).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Star
                  return (
                    <span key={amenity} className="p-1 rounded bg-primary/10" title={amenity}>
                      <Icon className="h-3 w-3 text-primary" />
                    </span>
                  )
                })}
                {flight.amenities.length > 3 ? (
                  <span className="text-[11px] text-muted-foreground">+{flight.amenities.length - 3}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground/90">{flight.rating}</span>
                <span>({flight.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Price + actions */}
          <div className="text-right shrink-0">
            <div className="mb-2">
              {flight.originalPrice && (
                <div className="text-xs text-muted-foreground line-through">
                  ${flight.originalPrice}
                </div>
              )}
              <div className="text-2xl font-bold leading-none">${flight.price}</div>
              <div className="text-[11px] text-muted-foreground">per person</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDetails}
                className="text-xs"
              >
                Details
              </Button>
              <Button size="sm" onClick={handleSelect} className="text-xs">
                {isSelected ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Selected
                  </span>
                ) : (
                  "Select"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}