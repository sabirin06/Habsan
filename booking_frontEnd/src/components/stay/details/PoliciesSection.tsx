/* eslint-disable @next/next/no-img-element */
"use client"

import type { Hotel } from "@/lib/stay-types"
import { AlarmClock, Ban, PawPrint } from "lucide-react"

export function PoliciesSection({ hotel }: { hotel: Hotel }) {
  const items = [
    { label: "Check-in", value: `From ${hotel.policies.checkInFrom}`, icon: AlarmClock },
    { label: "Check-out", value: `By ${hotel.policies.checkOutBy}`, icon: AlarmClock },
    { label: "Smoking", value: hotel.policies.smokingAllowed ? "Allowed" : "Not allowed", icon: Ban },
    { label: "Pets", value: hotel.policies.petsAllowed ? "Allowed" : "Not allowed", icon: PawPrint }
  ] as const

  return (
    <section className="clean-card p-4 md:p-6 border border-border/60 bg-card" aria-label="Policies">
      <h2 className="text-lg font-semibold">Hotel policies</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div key={it.label} className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-4 w-4" />
                {it.label}
              </div>
              <div className="mt-2 font-semibold">{it.value}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

