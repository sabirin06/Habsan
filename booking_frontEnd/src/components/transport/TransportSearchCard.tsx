"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AirportAutocomplete } from "@/components/flight-search/airport-autocomplete"
import type { TransportSearchData, TransportSearchTab, VehicleType } from "@/lib/transport-types"
import { CalendarClock, Car, MapPin, PlaneLanding, Search, Users } from "lucide-react"

type Props = {
  value: TransportSearchData
  onChange: (next: TransportSearchData) => void
  onSearch: () => void
  className?: string
  ctaLabel?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function vehicleTypeLabel(v: VehicleType | "any") {
  if (v === "any") return "Any type"
  return v === "sedan" ? "Sedan" : v === "suv" ? "SUV" : v === "van" ? "Van" : "Luxury"
}

export function TransportSearchCard({ value, onChange, onSearch, className = "", ctaLabel }: Props) {
  const [passengersOpen, setPassengersOpen] = useState(false)
  const passengersWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (passengersWrapRef.current && !passengersWrapRef.current.contains(t)) setPassengersOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPassengersOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const passengersLabel = useMemo(() => {
    const p = Math.max(1, value.passengers || 1)
    return `${p} passenger${p > 1 ? "s" : ""}`
  }, [value.passengers])

  const setTab = (tab: TransportSearchTab) => {
    onChange({ ...value, tab })
  }

  return (
    <div
      className={[
        "clean-card border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl shadow-black/5",
        className
      ].join(" ")}
    >
      <div className="p-4 md:p-6">
        <Tabs value={value.tab} onValueChange={(v) => setTab(v as TransportSearchTab)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-muted-foreground">Search transport</div>
              <div className="text-lg font-semibold">Airport pickups & car rentals</div>
            </div>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="airport_pickup" className="flex-1 md:flex-none">
                <PlaneLanding className="h-4 w-4 mr-2" />
                Airport Pickup
              </TabsTrigger>
              <TabsTrigger value="rent_a_car" className="flex-1 md:flex-none">
                <Car className="h-4 w-4 mr-2" />
                Rent a Car
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="airport_pickup">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5">
                <AirportAutocomplete
                  id="transport-airport"
                  label="Pickup airport"
                  placeholder="Search airport (e.g. MGQ, Mogadishu)"
                  value={value.pickupAirport}
                  onChange={(next) => onChange({ ...value, pickupAirport: next })}
                />
              </div>

              <div className="lg:col-span-4 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Drop-off location
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="clean-input pl-9"
                    placeholder="Hotel, neighborhood, landmark"
                    value={value.dropOffLocation}
                    onChange={(e) => onChange({ ...value, dropOffLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Date & time</label>
                <div className="relative">
                  <CalendarClock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    className="clean-input pl-9"
                    value={value.pickupDateTime}
                    onChange={(e) => onChange({ ...value, pickupDateTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-9">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                  <div className="relative" ref={passengersWrapRef}>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">Passengers</label>
                    <button
                      type="button"
                      className="clean-input mt-2 flex items-center justify-between gap-2"
                      onClick={() => setPassengersOpen((v) => !v)}
                      aria-label="Open passengers selector"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{passengersLabel}</span>
                      </span>
                      <span className="text-muted-foreground text-sm">▾</span>
                    </button>

                    {passengersOpen ? (
                      <div className="absolute z-50 top-full mt-2 left-0 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">Passengers</div>
                              <div className="text-xs text-muted-foreground">Select how many people are riding.</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
                                onClick={() => onChange({ ...value, passengers: clamp((value.passengers || 1) - 1, 1, 12) })}
                                aria-label="Decrease passengers"
                              >
                                −
                              </button>
                              <div className="w-8 text-center tabular-nums">{Math.max(1, value.passengers || 1)}</div>
                              <button
                                type="button"
                                className="h-9 w-9 rounded-lg border border-border hover:bg-accent"
                                onClick={() => onChange({ ...value, passengers: clamp((value.passengers || 1) + 1, 1, 12) })}
                                aria-label="Increase passengers"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border flex items-center justify-end">
                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                              onClick={() => setPassengersOpen(false)}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <Button className="h-11 px-6 w-full sm:w-auto" onClick={onSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    {ctaLabel ?? "Search"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rent_a_car">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-4 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Pickup location</label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="clean-input pl-9"
                    placeholder="City, airport, neighborhood"
                    value={value.rentalPickupLocation}
                    onChange={(e) => onChange({ ...value, rentalPickupLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Pickup date & time</label>
                <div className="relative">
                  <CalendarClock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    className="clean-input pl-9"
                    value={value.rentalPickupDateTime}
                    onChange={(e) => onChange({ ...value, rentalPickupDateTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Return date & time</label>
                <div className="relative">
                  <CalendarClock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="datetime-local"
                    className="clean-input pl-9"
                    value={value.rentalReturnDateTime}
                    onChange={(e) => onChange({ ...value, rentalReturnDateTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">Car type</label>
                <select
                  className="clean-input"
                  value={value.carType}
                  onChange={(e) => onChange({ ...value, carType: e.target.value as any })}
                  aria-label="Car type"
                >
                  {(["any", "sedan", "suv", "van", "luxury"] as const).map((t) => (
                    <option key={t} value={t}>
                      {vehicleTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(["either", "self_drive", "with_driver"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={[
                          "px-3 py-2 rounded-lg border text-sm transition-colors",
                          value.rentalDriverMode === m ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                        ].join(" ")}
                        onClick={() => onChange({ ...value, rentalDriverMode: m })}
                        aria-label={`Driver mode: ${m === "either" ? "Either" : m === "self_drive" ? "Self-drive" : "With driver"}`}
                      >
                        {m === "either" ? "Self-drive or Driver" : m === "self_drive" ? "Self-drive" : "With driver"}
                      </button>
                    ))}
                  </div>

                  <Button className="h-11 px-6 w-full sm:w-auto" onClick={onSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    {ctaLabel ?? "Search"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

