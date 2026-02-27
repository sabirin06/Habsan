/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import type { Experience, ExperienceTravelers } from "@/lib/experience-types"
import { totalTravelers } from "@/lib/experience-utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/lib/use-media-query"
import { Calendar, Users } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function ExperienceBookingCard({
  experience,
  date,
  travelers,
  onChangeDate,
  onChangeTravelers,
  onBook
}: {
  experience: Experience
  date: string
  travelers: ExperienceTravelers
  onChangeDate: (next: string) => void
  onChangeTravelers: (next: ExperienceTravelers) => void
  onBook: () => void
}) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [sheetOpen, setSheetOpen] = useState(false)

  const total = useMemo(() => {
    const t = totalTravelers(travelers)
    const subtotal = experience.pricePerPerson * t
    const fees = Math.round(subtotal * 0.08 * 100) / 100
    return { subtotal, fees, total: Math.max(0, subtotal + fees) }
  }, [experience.pricePerPerson, travelers])

  const travelersLabel = useMemo(() => {
    const t = totalTravelers(travelers)
    const parts = [`${t} traveler${t > 1 ? "s" : ""}`]
    parts.push(`${travelers.adults} adult${travelers.adults > 1 ? "s" : ""}`)
    if (travelers.children) parts.push(`${travelers.children} child${travelers.children === 1 ? "" : "ren"}`)
    return parts.join(" • ")
  }, [travelers])

  const TravelersEditor = () => (
    <div className="p-4">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Adults</div>
            <div className="text-xs text-muted-foreground">Ages 13+</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChangeTravelers({ ...travelers, adults: clamp(travelers.adults - 1, 1, 20) })}
              aria-label="Decrease adults"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{travelers.adults}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChangeTravelers({ ...travelers, adults: clamp(travelers.adults + 1, 1, 20) })}
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Children</div>
            <div className="text-xs text-muted-foreground">Ages 0–12</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChangeTravelers({ ...travelers, children: clamp(travelers.children - 1, 0, 10) })}
              aria-label="Decrease children"
            >
              −
            </button>
            <div className="w-8 text-center tabular-nums">{travelers.children}</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
              onClick={() => onChangeTravelers({ ...travelers, children: clamp(travelers.children + 1, 0, 10) })}
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const DesktopCard = () => (
    <aside className="hidden lg:block">
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="clean-card p-4 md:p-6 border border-border/60 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-2xl font-semibold tabular-nums leading-tight">
                {fmtMoney(experience.pricePerPerson)}
                <span className="text-sm font-normal text-muted-foreground"> / person</span>
              </div>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              Secure checkout
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">Date</span>
              <div className="relative">
                <Calendar className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" className="clean-input pl-9" value={date} onChange={(e) => onChangeDate(e.target.value)} />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Travelers</span>
              <button
                type="button"
                className="clean-input w-full flex items-center justify-between gap-2"
                onClick={() => setSheetOpen(true)}
                aria-label="Edit travelers"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{travelersLabel}</span>
                </span>
                <span className="text-xs text-muted-foreground">Edit</span>
              </button>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{fmtMoney(total.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span className="font-medium tabular-nums">{fmtMoney(total.fees)}</span>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold tabular-nums">{fmtMoney(total.total)}</span>
            </div>
            <div className="text-xs text-muted-foreground">You’ll review details before payment.</div>
          </div>

          <div className="mt-5">
            <Button className="w-full h-11" onClick={onBook}>
              Book experience
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )

  const MobileSticky = () => (
    <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="min-w-0 text-left flex-1" onClick={() => setSheetOpen(true)} aria-label="Edit experience booking">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-sm font-semibold tabular-nums truncate">
            {fmtMoney(total.total)}{" "}
            <span className="text-xs font-normal text-muted-foreground">• {totalTravelers(travelers)} traveler{totalTravelers(travelers) > 1 ? "s" : ""}</span>
          </div>
        </button>
        <Button className="flex-1 h-11" onClick={onBook}>
          Book
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <DesktopCard />
      <MobileSticky />

      {/* Travelers sheet (mobile + desktop) */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 h-dvh" role="dialog" aria-modal="true" aria-label="Travelers">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className={[
              "absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-background border-t border-border overflow-hidden shadow-2xl",
              isDesktop ? "md:inset-0 md:m-auto md:h-auto md:max-h-[70vh] md:w-[min(520px,calc(100vw-2rem))] md:rounded-2xl md:border md:bottom-auto" : ""
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Travelers</div>
                <div className="text-xs text-muted-foreground">Adjust adults and children.</div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                onClick={() => setSheetOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-auto">
              <TravelersEditor />
            </div>
            <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-border bg-background/95 backdrop-blur-sm">
              <Button className="w-full" onClick={() => setSheetOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

