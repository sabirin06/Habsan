/* eslint-disable @next/next/no-img-element */
"use client"

import type { Stay } from "@/lib/stay-types"
import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LocationSection({ stay }: { stay: Stay }) {
  const href = `https://www.google.com/maps?q=${encodeURIComponent(`${stay.location.lat},${stay.location.lng}`)}`

  return (
    <section className="clean-card p-4 md:p-6 border border-border/60 bg-card" aria-label="Location">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {stay.location.city}, {stay.location.country} • ~{stay.distanceKm.toFixed(1)} km from center
          </div>
        </div>
        <Button asChild variant="outline" className="h-9">
          <a href={href} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in maps
          </a>
        </Button>
      </div>

      <div className="mt-4 h-64 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
        Map placeholder ({stay.location.lat.toFixed(3)}, {stay.location.lng.toFixed(3)})
      </div>
    </section>
  )
}

