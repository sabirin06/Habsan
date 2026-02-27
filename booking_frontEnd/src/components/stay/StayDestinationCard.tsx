"use client"

import type { StayDestination } from "@/lib/stay-destinations"
import { MapPin } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

export function StayDestinationCard({
  destination,
  onClick
}: {
  destination: StayDestination
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left clean-card overflow-hidden border border-border/60 hover:shadow-xl transition-shadow shrink-0 w-[260px] sm:w-[300px]"
      aria-label={`Select destination ${destination.city}, ${destination.country}`}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={`${destination.city}, ${destination.country}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white font-semibold text-base leading-tight">{destination.city}</div>
          <div className="text-white/80 text-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {destination.country}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Avg / night</div>
            <div className="font-semibold tabular-nums">{fmtMoney(destination.avgPricePerNight)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Properties</div>
            <div className="font-semibold tabular-nums">{destination.propertyCount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </button>
  )
}

