/* eslint-disable @next/next/no-img-element */
"use client"

import type { Stay, StayType } from "@/lib/stay-types"
import { Button } from "@/components/ui/button"
import { BookingSummary } from "./BookingSummary"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

export function StayBookingCard({
  stay,
  stayType,
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
  onEditSearch
}: {
  stay: Stay
  stayType: StayType
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
}) {
  return (
    <>
      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-24 space-y-6">
          <BookingSummary
            stayType={stayType}
            stay={stay}
            nights={nights}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            guestsTotal={guestsTotal}
            rooms={rooms}
            pricing={pricing}
            agreePolicies={agreePolicies}
            onChangeAgreePolicies={onChangeAgreePolicies}
            canBook={canBook}
            selectedRoomId={selectedRoomId}
            onBook={onBook}
            onEditSearch={onEditSearch}
            variant="desktop"
          />
        </div>
      </aside>

      {/* Mobile sticky CTA (simple + opens summary in results edit flow) */}
      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="min-w-0 text-left flex-1" onClick={onEditSearch} aria-label="Edit stay search">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-sm font-semibold tabular-nums truncate">
              {fmtMoney(pricing.total)}{" "}
              <span className="text-xs font-normal text-muted-foreground">• {nights} night{nights > 1 ? "s" : ""}</span>
            </div>
          </button>
          <Button className="flex-1 h-11" disabled={!canBook} onClick={onBook}>
            {stayType === "hotel" ? (selectedRoomId ? "Reserve" : "Select room") : "Reserve"}
          </Button>
        </div>
      </div>
    </>
  )
}

