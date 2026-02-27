/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import type { Stay, StayAmenity } from "@/lib/stay-types"
import { Button } from "@/components/ui/button"
import { Wifi, Dumbbell, Utensils, Waves, Car, Snowflake, Briefcase, CookingPot, WashingMachine, X } from "lucide-react"

const ICONS: Partial<Record<StayAmenity, any>> = {
  wifi: Wifi,
  gym: Dumbbell,
  breakfast: Utensils,
  restaurant: Utensils,
  pool: Waves,
  parking: Car,
  ac: Snowflake,
  workspace: Briefcase,
  kitchen: CookingPot,
  washer: WashingMachine
}

function labelAmenity(a: StayAmenity) {
  return a === "wifi"
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
}

export function AmenitiesSection({ stay }: { stay: Stay }) {
  const [open, setOpen] = useState(false)
  const max = 10
  const shown = useMemo(() => stay.amenities.slice(0, max), [stay.amenities])
  const more = Math.max(0, stay.amenities.length - shown.length)

  const Chip = ({ a }: { a: StayAmenity }) => {
    const Icon = ICONS[a]
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-2 text-xs text-foreground">
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        {labelAmenity(a)}
      </span>
    )
  }

  return (
    <>
      <section className="clean-card p-4 md:p-6 border border-border/60 bg-card" aria-label="Amenities">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Amenities</h2>
            <p className="mt-1 text-sm text-muted-foreground">What this stay includes.</p>
          </div>
          {more > 0 ? (
            <Button variant="outline" className="h-9" onClick={() => setOpen(true)}>
              View all
            </Button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shown.map((a) => (
            <Chip key={a} a={a} />
          ))}
          {more > 0 ? (
            <button
              type="button"
              className="text-xs px-3 py-2 rounded-full border border-border/60 bg-background/60 text-muted-foreground hover:bg-accent/60 transition-colors"
              onClick={() => setOpen(true)}
            >
              +{more} more
            </button>
          ) : null}
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="All amenities">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 overflow-auto">
            <div className="container py-8">
              <div className="max-w-3xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
                  <div className="font-semibold">All amenities</div>
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg border border-border/60 hover:bg-accent inline-flex items-center justify-center"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {stay.amenities.map((a) => (
                    <Chip key={a} a={a} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

