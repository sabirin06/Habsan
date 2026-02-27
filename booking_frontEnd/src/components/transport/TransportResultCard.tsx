"use client"

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import type { TransportService } from "@/lib/transport-types"
import { BadgeCheck, Car, Heart, MapPin, Star, Users, Wifi, Wind, Baby, ShieldCheck } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function unitLabel(unit: TransportService["pricing"]["unit"]) {
  return unit === "per_trip" ? "/ trip" : "/ day"
}

function featureBadge(f: string) {
  if (f === "wifi") return { icon: Wifi, label: "Wi‑Fi" }
  if (f === "ac") return { icon: Wind, label: "AC" }
  if (f === "child_seat") return { icon: Baby, label: "Child seat" }
  return null
}

export function TransportResultCard({
  service,
  onView,
  onBook,
  variant = "grid"
}: {
  service: TransportService
  onView: () => void
  onBook: () => void
  variant?: "listing" | "grid"
}) {
  const cover = service.images[0]
  const quickBadges = [
    service.provider.verified ? { icon: BadgeCheck, label: "Verified provider" } : null,
    service.freeCancellation ? { icon: ShieldCheck, label: "Free cancellation" } : null,
    { icon: Users, label: `${service.capacity} seats` }
  ].filter(Boolean) as Array<{ icon: any; label: string }>

  const chips = service.features
    .map((f) => featureBadge(f))
    .filter(Boolean)
    .slice(0, 3) as Array<{ icon: any; label: string }>

  const InfoRow = () => (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="font-semibold text-base sm:text-lg truncate">{service.title}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{service.kind === "airport_pickup" ? "Airport pickup" : "Car rental"}</span>
          <span className="text-muted-foreground">•</span>
          <span className="truncate">{service.provider.name}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickBadges.slice(0, 2).map((b) => {
            const Icon = b.icon
            return (
              <span
                key={b.label}
                className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground inline-flex items-center gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {b.label}
              </span>
            )
          })}
          {service.kind === "car_rental" ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-background/70 border border-border/60 text-muted-foreground inline-flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" />
              {service.driverModes.includes("self_drive") && service.driverModes.includes("with_driver")
                ? "Self-drive or driver"
                : service.driverModes.includes("with_driver")
                  ? "With driver"
                  : "Self-drive"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-background text-xs">
          <Star className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold">{service.rating.score.toFixed(1)}</span>
          <span className="text-muted-foreground">({service.rating.reviewsCount.toLocaleString()})</span>
        </div>
      </div>
    </div>
  )

  const ChipsRow = () =>
    chips.length ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => {
          const Icon = c.icon
          return (
            <span
              key={c.label}
              className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground inline-flex items-center gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </span>
          )
        })}
      </div>
    ) : null

  const PriceCtaRow = () => (
    <div className="mt-4 flex items-end justify-between gap-3 pt-4 border-t border-border/60">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">Starting from</div>
        <div className="text-xl font-semibold tabular-nums leading-tight">
          {fmtMoney(service.pricing.amount)}
          <span className="text-sm font-normal text-muted-foreground"> {unitLabel(service.pricing.unit)}</span>
        </div>
      </div>
      <div className="shrink-0 flex gap-2">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
        >
          View details
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onBook()
          }}
        >
          Book now
        </Button>
      </div>
    </div>
  )

  const commonProps = {
    role: "link" as const,
    tabIndex: 0,
    onClick: onView,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onView()
      }
    },
    className:
      "w-full text-left clean-card border border-border/60 overflow-hidden hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
    "aria-label": `Open ${service.title}`
  }

  const CardImage = ({ mode }: { mode: "grid" | "listing" }) => (
    <div className={mode === "listing" ? "relative overflow-hidden h-full" : "relative overflow-hidden"}>
      <div className={mode === "grid" ? "aspect-video" : "aspect-4/3 sm:aspect-auto sm:h-full"}>
        <img src={cover?.url ?? ""} alt={cover?.alt ?? service.title} className="w-full h-full object-cover" />
      </div>
      <button
        type="button"
        className="absolute top-3 right-3 h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
        aria-label="Save to wishlist"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Wishlist is fully supported on details page; keep this as a lightweight affordance.
        }}
      >
        <Heart className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  )

  if (variant === "listing") {
    return (
      <div {...commonProps}>
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 md:w-64 shrink-0">
            <CardImage mode="listing" />
          </div>
          <div className="flex-1 p-4 min-w-0">
            <InfoRow />
            <ChipsRow />
            <PriceCtaRow />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div {...commonProps}>
      <CardImage mode="grid" />
      <div className="p-4 min-w-0">
        <InfoRow />
        <ChipsRow />
        <PriceCtaRow />
      </div>
    </div>
  )
}

