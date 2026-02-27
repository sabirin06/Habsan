/* eslint-disable @next/next/no-img-element */
"use client"

import type { Stay, StayType } from "@/lib/stay-types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Pencil, ShieldCheck, CheckCircle2, Users } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

export function BookingSummary({
  stayType,
  stay,
  nights,
  checkIn,
  checkOut,
  adults,
  children,
  guestsTotal,
  rooms,
  pricing,
  agreePolicies,
  onChangeAgreePolicies,
  canBook,
  selectedRoomId,
  onBook,
  onEditSearch,
  variant
}: {
  stayType: StayType
  stay: Stay
  nights: number
  checkIn: string
  checkOut: string
  adults: number
  children: number
  guestsTotal: number
  rooms: number
  pricing: { nights: number; pricePerNight: number; subtotal: number; fees: number; discount: number; total: number }
  agreePolicies: boolean
  onChangeAgreePolicies: (next: boolean) => void
  canBook: boolean
  selectedRoomId: string | null
  onBook: () => void
  onEditSearch: () => void
  variant: "desktop" | "sheet"
}) {
  const isHotel = stayType === "hotel"
  const ctaLabel = isHotel ? (selectedRoomId ? "Reserve room" : "Select a room") : "Reserve apartment"

  return (
    <section className="clean-card border border-border/60 bg-card overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 bg-background/70">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure booking
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 bg-background/70">
            <CheckCircle2 className="h-3.5 w-3.5" /> No hidden fees
          </span>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground">From</div>
          <div className="text-3xl font-bold tabular-nums leading-tight">
            {fmtMoney(pricing.pricePerNight)} <span className="text-sm font-medium text-muted-foreground">/ night</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Dates
              </div>
              <button
                type="button"
                className="h-8 px-2 rounded-lg border border-border/60 hover:bg-accent/60 transition-colors inline-flex items-center gap-2 text-xs"
                onClick={onEditSearch}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
            <div className="text-sm font-medium mt-1">
              {checkIn} → {checkOut}
            </div>
            <div className="text-xs text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Guests
              </div>
              <button
                type="button"
                className="h-8 px-2 rounded-lg border border-border/60 hover:bg-accent/60 transition-colors inline-flex items-center gap-2 text-xs"
                onClick={onEditSearch}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
            <div className="text-sm font-medium mt-1">
              {guestsTotal} guest{guestsTotal > 1 ? "s" : ""}
              <span className="text-xs text-muted-foreground font-normal">
                {" "}
                • {adults} adult{adults > 1 ? "s" : ""}
                {children ? ` • ${children} child${children > 1 ? "ren" : ""}` : ""}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isHotel ? `${Math.max(1, rooms || 1)} room${rooms > 1 ? "s" : ""}` : "Apartment booking"}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {fmtMoney(pricing.pricePerNight)} × {nights} nights
            </span>
            <span className="font-medium tabular-nums">{fmtMoney(pricing.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fees</span>
            <span className="font-medium tabular-nums">{fmtMoney(pricing.fees)}</span>
          </div>
          {pricing.discount > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium tabular-nums text-primary">- {fmtMoney(pricing.discount)}</span>
            </div>
          ) : null}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold tabular-nums">{fmtMoney(pricing.total)}</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-3 text-sm rounded-xl p-3 border border-border/60 bg-background/50 cursor-pointer hover:bg-accent/30 transition-colors">
            <Checkbox checked={agreePolicies} onCheckedChange={(c) => onChangeAgreePolicies(Boolean(c))} />
            <span className="text-muted-foreground">
              I agree to the {isHotel ? "hotel policies" : "house rules"} and cancellation terms.
              {!agreePolicies ? (
                <span className="block mt-1 text-xs text-destructive">Please accept to continue.</span>
              ) : null}
            </span>
          </label>
        </div>

        <div className="mt-5">
          <Button className="w-full h-11" disabled={!canBook} onClick={onBook}>
            {ctaLabel}
          </Button>
          {!canBook && isHotel ? (
            <div className="mt-2 text-xs text-muted-foreground">Select a room to continue.</div>
          ) : null}
        </div>
      </div>

      {variant === "sheet" ? (
        <div className="p-4 border-t border-border/60 bg-background/60 text-xs text-muted-foreground">
          Secure booking • Instant confirmation on eligible stays
        </div>
      ) : null}
    </section>
  )
}

