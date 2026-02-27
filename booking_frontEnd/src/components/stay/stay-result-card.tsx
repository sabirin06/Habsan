"use client"

import { Button } from "@/components/ui/button"
import type { Apartment, Hotel, Stay } from "@/lib/stay-types"
import { Bath, BedDouble, Heart, MapPin, Star, Users } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function StarsInline({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < count ? "h-3.5 w-3.5 fill-yellow-400 text-yellow-400" : "h-3.5 w-3.5 text-muted-foreground/35"}
        />
      ))}
    </div>
  )
}

export function StayResultCard({
  stay,
  onView,
  variant = "grid"
}: {
  stay: Stay
  onView: () => void
  variant?: "listing" | "grid"
}) {
  const isHotel = stay.type === "hotel"
  const hotel = stay as Hotel
  const apt = stay as Apartment
  const cover = stay.images[0]

  const amenityLabel = (a: string) =>
    a === "wifi"
      ? "Wi‑Fi"
      : a === "pool"
        ? "Pool"
        : a === "gym"
          ? "Gym"
          : a === "breakfast"
            ? "Breakfast"
            : a === "restaurant"
              ? "Restaurant"
              : a === "parking"
                ? "Parking"
                : a === "ac"
                  ? "A/C"
                  : a === "workspace"
                    ? "Workspace"
                    : a === "kitchen"
                      ? "Kitchen"
                      : a === "washer"
                        ? "Washer"
                        : "Amenity"

  const quickAmenities = stay.amenities.slice(0, 4)
  const moreAmenities = Math.max(0, stay.amenities.length - quickAmenities.length)

  const ctaLabel = isHotel ? "View rooms" : "View apartment"
  const cancellationBadge = isHotel && hotel.freeCancellation
  const longStay = !isHotel && typeof apt.longStayDiscountPct === "number" && apt.longStayDiscountPct > 0

  const CardImage = ({ mode }: { mode: "grid" | "listing" }) => (
    <div className={mode === "listing" ? "relative overflow-hidden h-full" : "relative overflow-hidden"}>
      <div className={mode === "grid" ? "aspect-video" : "aspect-4/3 sm:aspect-auto sm:h-full"}>
        <img src={cover?.url ?? ""} alt={cover?.alt ?? stay.name} className="w-full h-full object-cover" />
      </div>
      <button
        type="button"
        className="absolute top-3 right-3 h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
        aria-label="Save to wishlist"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Heart className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  )

  const MetaBadges = () => (
    <div className="flex flex-wrap gap-2">
      {cancellationBadge ? (
        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
          Free cancellation
        </span>
      ) : null}
      {!isHotel ? (
        <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-foreground">
          {apt.entirePlace ? "Entire place" : "Private room"}
        </span>
      ) : null}
      {longStay ? (
        <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground">
          Long-stay −{apt.longStayDiscountPct}%
        </span>
      ) : null}
    </div>
  )

  const RatingBlock = () => (
    <div className="shrink-0 text-right">
      {isHotel ? (
        <div className="flex justify-end">
          <StarsInline count={hotel.stars} />
        </div>
      ) : null}
      <div className="mt-1 text-xs text-muted-foreground tabular-nums">
        {stay.guestRating.toFixed(1)} • {stay.reviewsCount.toLocaleString()} reviews
      </div>
    </div>
  )

  const AmenitiesRow = () => (
    <div className="mt-3 flex flex-wrap gap-2">
      {quickAmenities.map((a) => (
        <span key={a} className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground">
          {amenityLabel(a)}
        </span>
      ))}
      {moreAmenities > 0 ? (
        <span className="text-[11px] px-2 py-1 rounded-full bg-background/70 border border-border/60 text-muted-foreground">
          +{moreAmenities} more
        </span>
      ) : null}
    </div>
  )

  const PriceCtaRow = () => (
    <div className="mt-4 flex items-end justify-between gap-3 pt-4 border-t border-border/60">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">From</div>
        <div className="text-xl font-semibold tabular-nums leading-tight">
          {fmtMoney(stay.pricePerNight)}
          <span className="text-sm font-normal text-muted-foreground"> / night</span>
        </div>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onView()
        }}
        className="shrink-0"
      >
        {ctaLabel}
      </Button>
    </div>
  )

  if (variant === "listing") {
    return (
      <div
        role="link"
        tabIndex={0}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onView()
          }
        }}
        className="w-full text-left clean-card border border-border/60 overflow-hidden hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-label={`Open ${stay.name}`}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 md:w-64 shrink-0">
            <CardImage mode="listing" />
          </div>
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold text-base sm:text-lg truncate">{stay.name}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {stay.location.city}, {stay.location.country}
                  </span>
                  <span className="hidden sm:inline text-muted-foreground/60">•</span>
                  <span className="hidden sm:inline text-muted-foreground">~{stay.distanceKm.toFixed(1)} km away</span>
                </div>
                <div className="mt-2">
                  <MetaBadges />
                </div>

                {!isHotel ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-4 w-4" /> {apt.bedrooms} bd
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" /> {apt.beds} beds
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-4 w-4" /> {apt.bathrooms} bath
                    </span>
                  </div>
                ) : null}
              </div>
              <RatingBlock />
            </div>

            <AmenitiesRow />
            <PriceCtaRow />
          </div>
        </div>
      </div>
    )
  }

  // Grid / compact card
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView()
        }
      }}
      className="w-full text-left clean-card border border-border/60 overflow-hidden hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      aria-label={`Open ${stay.name}`}
    >
      <CardImage mode="grid" />
      <div className="p-4 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-base truncate">{stay.name}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {stay.location.city}, {stay.location.country}
              </span>
            </div>
          </div>
          <RatingBlock />
        </div>

        <div className="mt-2">
          <MetaBadges />
        </div>

        <AmenitiesRow />
        <PriceCtaRow />
      </div>
    </div>
  )
}

