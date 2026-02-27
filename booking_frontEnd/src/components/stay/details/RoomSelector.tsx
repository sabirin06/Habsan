/* eslint-disable @next/next/no-img-element */
"use client"

import type { Hotel, HotelRoom } from "@/lib/stay-types"
import { BedDouble, CheckCircle2, Info, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

export function RoomSelector({
  hotel,
  selectedRoomId,
  onSelectRoom
}: {
  hotel: Hotel
  selectedRoomId: string | null
  onSelectRoom: (id: string) => void
}) {
  const bestValueId = hotel.rooms.reduce((best, r) => (r.pricePerNight < best.pricePerNight ? r : best), hotel.rooms[0] as HotelRoom).id

  return (
    <section className="clean-card p-4 md:p-6 border border-border/60 bg-card" aria-label="Room selection">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Choose a room</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select one option to continue to booking.</p>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          Prices are demo placeholders
        </div>
      </div>

      <div className="mt-4" role="radiogroup" aria-label="Available rooms">
        <div className="space-y-3">
          {hotel.rooms.map((r) => {
            const selected = selectedRoomId === r.id
            const best = r.id === bestValueId
            return (
              <div
                key={r.id}
                className={[
                  "rounded-2xl border p-4 md:p-5 transition-all duration-200",
                  "bg-background/40 hover:bg-accent/30",
                  selected ? "border-primary/40 ring-2 ring-primary/10 bg-primary/5" : "border-border/60"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-start gap-3 cursor-pointer min-w-0">
                    <input
                      type="radio"
                      name="room"
                      value={r.id}
                      checked={selected}
                      onChange={() => onSelectRoom(r.id)}
                      className="mt-1 h-4 w-4 accent-primary"
                      aria-label={`Select ${r.name}`}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-base">{r.name}</div>
                        {best ? (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                            Best value
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="h-4 w-4" /> Sleeps {r.capacity}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          {r.refundable ? "Free cancellation" : "Non-refundable"}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary" />
                          {r.breakfastIncluded ? "Breakfast included" : "No breakfast"}
                        </span>
                      </div>
                    </div>
                  </label>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">Per night</div>
                    <div className="text-lg font-semibold tabular-nums">{fmtMoney(r.pricePerNight)}</div>
                    <Button
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className="mt-2 h-9"
                      onClick={() => onSelectRoom(r.id)}
                    >
                      {selected ? (
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Selected
                        </span>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Room details */}
                <details className="mt-4 rounded-xl border border-border/60 bg-background/70 overflow-hidden">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-accent/50 transition-colors">
                    <span className="inline-flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      Room details
                    </span>
                    <span className="text-xs text-muted-foreground">Expand</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    <ul className="mt-2 space-y-2">
                      <li>Comfortable bedding and modern bathroom</li>
                      <li>Fast Wi‑Fi and dedicated workspace (where available)</li>
                      <li>Flexible cancellation based on rate</li>
                    </ul>
                  </div>
                </details>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

