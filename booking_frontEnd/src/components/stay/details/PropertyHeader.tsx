/* eslint-disable @next/next/no-img-element */
"use client"

import type { Apartment, Hotel, Stay } from "@/lib/stay-types"
import { ArrowLeft, MapPin, ShieldCheck, CheckCircle2, BadgeCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

function StarsInline({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < count ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-muted-foreground/35"}
        />
      ))}
    </div>
  )
}

export function PropertyHeader({
  stay,
  backHref,
  onBack
}: {
  stay: Stay
  backHref: string
  onBack: () => void
}) {
  const isHotel = stay.type === "hotel"
  const hotel = stay as Hotel
  const apt = stay as Apartment

  return (
    <header className="clean-card p-4 md:p-6 border border-border/60 bg-card">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="h-9 px-2" onClick={onBack} aria-label="Back to stays">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to stays
        </Button>
        <a href={backHref} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
          Back to results
        </a>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{stay.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {stay.location.city}, {stay.location.country}
              </span>
              <span className="hidden sm:inline text-muted-foreground/60">•</span>
              <span className="hidden sm:inline text-muted-foreground">~{stay.distanceKm.toFixed(1)} km from center</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {isHotel ? (
              <div className="flex justify-end">
                <StarsInline count={hotel.stars} />
              </div>
            ) : null}
            <div className="mt-1 text-sm font-semibold tabular-nums">{stay.guestRating.toFixed(1)}/10</div>
            <div className="text-xs text-muted-foreground">{stay.reviewsCount.toLocaleString()} reviews</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure booking
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Instant confirmation
          </span>
          {isHotel && hotel.freeCancellation ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <BadgeCheck className="h-3.5 w-3.5" />
              Free cancellation
            </span>
          ) : null}

          {!isHotel ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium">
              {apt.entirePlace ? "Entire place" : "Private room"}
            </span>
          ) : null}
          {!isHotel && apt.host?.badge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              {apt.host.badge}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}

