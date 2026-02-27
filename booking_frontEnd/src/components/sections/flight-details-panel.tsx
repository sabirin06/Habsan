"use client"

import { X, Plane, Clock, Wifi, Coffee, Luggage, Star, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Flight } from "@/lib/flight-types"
import { priceBreakdown } from "@/lib/flight-utils"

interface FlightDetailsProps {
  flight: Flight
  onClose: () => void
  onBook: () => void
  primaryCtaLabel?: string
  variant?: "side" | "sheet"
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  meals: Coffee,
  entertainment: Star,
  lounge: Star,
  shower: Star
}

export function FlightDetailsPanel({
  flight,
  onClose,
  onBook,
  primaryCtaLabel,
  variant = "side"
}: FlightDetailsProps) {
  const breakdown = priceBreakdown(flight.price)
  return (
    <div
      className={[
        "fixed bg-background border-border shadow-xl overflow-y-auto",
        "focus:outline-none",
        // layout variants
        variant === "sheet" ? "inset-0 w-full max-w-none border-l-0 z-60" : "inset-y-0 right-0 w-full max-w-md border-l z-50"
      ].join(" ")}
    >
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Flight Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close flight details">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Flight Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={flight.logo}
              alt={flight.airline}
              className="w-10 h-10 rounded object-cover"
            />
            <div>
              <div className="font-semibold">{flight.airline}</div>
              <div className="text-sm text-muted-foreground">
                {flight.flightNumber} • {flight.aircraft}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total price</div>
                {flight.originalPrice ? (
                  <div className="text-sm text-muted-foreground line-through">${flight.originalPrice}</div>
                ) : null}
                <div className="text-2xl font-bold">${flight.price}</div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                Per traveler
              </div>
            </div>

            <div className="mt-3 border-t border-border/60 pt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base fare</span>
                <span className="font-medium">${breakdown.baseFare}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxes & fees</span>
                <span className="font-medium">${breakdown.taxesAndFees}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">${breakdown.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Route */}
        <div className="space-y-4">
          <h3 className="font-semibold">Flight Route</h3>
          
          {/* Departure */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-px h-16 bg-border"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">{flight.departure.time}</span>
                <span className="text-sm text-muted-foreground">
                  {flight.departure.code}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {flight.departure.airport}
              </div>
              {flight.departure.terminal && (
                <div className="text-xs text-muted-foreground">
                  Terminal {flight.departure.terminal}
                  {flight.departure.gate && ` • Gate ${flight.departure.gate}`}
                </div>
              )}
            </div>
          </div>

          {/* Flight Duration */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <Plane className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Flight time: {flight.duration}
              </div>
              {flight.stops > 0 && (
                <div className="text-sm text-muted-foreground">
                  {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">
                  {flight.arrival.time}
                  {flight.arrival.nextDay && (
                    <span className="text-xs text-red-500 ml-1">+1</span>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {flight.arrival.code}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {flight.arrival.airport}
              </div>
              {flight.arrival.terminal && (
                <div className="text-xs text-muted-foreground">
                  Terminal {flight.arrival.terminal}
                  {flight.arrival.gate && ` • Gate ${flight.arrival.gate}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stop Details */}
        {flight.stops > 0 && flight.stopDetails && (
          <div className="space-y-2">
            <h3 className="font-semibold">Layover Information</h3>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm">{flight.stopDetails}</div>
            </div>
          </div>
        )}

        {/* Cabin & Baggage */}
        <div className="space-y-4">
          <h3 className="font-semibold">Cabin & Baggage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Cabin Class</div>
              <div className="text-sm text-muted-foreground">{flight.cabinClass}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Baggage</div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Luggage className="h-3 w-3" />
                  {flight.baggage.carry}
                </div>
                <div className="text-xs">+ {flight.baggage.checked}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <h3 className="font-semibold">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {flight.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Star
              return (
                <div key={amenity} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm capitalize">{amenity}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <h3 className="font-semibold">Customer Rating</h3>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{flight.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({flight.reviews.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-3">
          <h3 className="font-semibold">Booking Policies</h3>
          <div className="space-y-2 text-sm">
            {flight.cancellation && (
              <div>
                <div className="font-medium">Cancellation</div>
                <div className="text-muted-foreground">{flight.cancellation}</div>
              </div>
            )}
            {flight.changes && (
              <div>
                <div className="font-medium">Changes</div>
                <div className="text-muted-foreground">{flight.changes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] -mx-4 -mb-4">
          <Button onClick={onBook} className="w-full" size="lg">
            {primaryCtaLabel ?? `Book Flight for $${flight.price}`}
          </Button>
        </div>
      </div>
    </div>
  )
}