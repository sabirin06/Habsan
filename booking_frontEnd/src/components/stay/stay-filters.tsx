"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from "lucide-react"
import type { StayAmenity, StayFiltersState, StayType } from "@/lib/stay-types"

const AMENITIES: Array<{ id: StayAmenity; label: string }> = [
  { id: "wifi", label: "Wi‑Fi" },
  { id: "ac", label: "Air conditioning" },
  { id: "parking", label: "Parking" },
  { id: "workspace", label: "Workspace" },
  { id: "pool", label: "Pool" },
  { id: "gym", label: "Gym" },
  { id: "breakfast", label: "Breakfast" },
  { id: "restaurant", label: "Restaurant" },
  { id: "kitchen", label: "Kitchen" },
  { id: "washer", label: "Washing machine" }
]

export function StayFilters({
  isOpen = true,
  onClose,
  className = "",
  stayType,
  value,
  onChange,
  onReset,
  hotelChains
}: {
  isOpen?: boolean
  onClose?: () => void
  className?: string
  stayType: StayType
  value: StayFiltersState
  onChange: (next: StayFiltersState) => void
  onReset: () => void
  hotelChains: string[]
}) {
  const starOptions = useMemo(() => [5, 4, 3, 2, 1] as const, [])

  const toggleStr = (arr: string[], id: string, checked: boolean) =>
    checked ? Array.from(new Set([...arr, id])) : arr.filter((x) => x !== id)

  const toggleStar = (arr: Array<1 | 2 | 3 | 4 | 5>, id: 1 | 2 | 3 | 4 | 5, checked: boolean) =>
    checked ? Array.from(new Set([...arr, id])) : arr.filter((x) => x !== id)

  if (!isOpen) return null

  return (
    <div
      className={[
        // Default: light, premium filter panel. Sheets/drawers can override via className.
        "w-full lg:w-80 bg-background/95 backdrop-blur-sm border border-border/60 h-full overflow-hidden flex flex-col rounded-2xl",
        className
      ].join(" ")}
    >
      {/* Header (always visible in sheets) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
            Clear
          </Button>
          {onClose ? (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close filters" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="p-4 space-y-7 overflow-y-auto flex-1">
        {/* Price */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price per night</h4>
          <div className="px-2">
            <Slider
              value={value.priceRange}
              onValueChange={(r) => onChange({ ...value, priceRange: [r[0], r[1]] })}
              max={2000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${value.priceRange[0]}</span>
              <span>${value.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Guest rating */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guest rating</h4>
          <div className="px-2">
            <Slider
              value={[value.guestRatingMin]}
              onValueChange={(r) => onChange({ ...value, guestRatingMin: r[0] })}
              max={10}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{value.guestRatingMin.toFixed(1)}+</span>
              <span>10.0</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</h4>
          <div className="space-y-1">
            {AMENITIES.map((a) => (
              <label
                key={a.id}
                htmlFor={`amenity-${a.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`amenity-${a.id}`}
                  checked={value.amenities.includes(a.id)}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...value,
                      amenities: toggleStr(value.amenities, a.id, Boolean(checked)) as StayAmenity[]
                    })
                  }
                />
                <span className="text-sm font-medium leading-none">{a.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location radius */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location radius</h4>
          <div className="px-2">
            <Slider
              value={[value.locationRadiusKm]}
              onValueChange={(r) => onChange({ ...value, locationRadiusKm: r[0] })}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>1 km</span>
              <span>{value.locationRadiusKm} km</span>
            </div>
          </div>
        </div>

        {/* Hotels-only */}
        {stayType === "hotel" ? (
          <>
            <div className="space-y-3 pt-6 border-t border-border/60">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Star rating</h4>
              <div className="space-y-1">
                {starOptions.map((s) => (
                  <label
                    key={s}
                    htmlFor={`stars-${s}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      id={`stars-${s}`}
                      checked={value.starRatings.includes(s)}
                      onCheckedChange={(checked) =>
                        onChange({
                          ...value,
                          starRatings: toggleStar(value.starRatings, s, Boolean(checked))
                        })
                      }
                    />
                    <span className="text-sm font-medium leading-none">{s} stars</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="breakfast" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
                <Checkbox
                  id="breakfast"
                  checked={value.breakfastIncluded}
                  onCheckedChange={(checked) => onChange({ ...value, breakfastIncluded: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Breakfast included</span>
              </label>
              <label htmlFor="free-cancel" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
                <Checkbox
                  id="free-cancel"
                  checked={value.freeCancellation}
                  onCheckedChange={(checked) => onChange({ ...value, freeCancellation: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Free cancellation</span>
              </label>
            </div>

            {hotelChains.length ? (
              <div className="space-y-3 pt-6 border-t border-border/60">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hotel chains</h4>
                <div className="space-y-1">
                  {hotelChains.map((c) => (
                    <label
                      key={c}
                      htmlFor={`chain-${c}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        id={`chain-${c}`}
                        checked={value.hotelChains.includes(c)}
                        onCheckedChange={(checked) =>
                          onChange({ ...value, hotelChains: toggleStr(value.hotelChains, c, Boolean(checked)) })
                        }
                      />
                      <span className="text-sm font-medium leading-none">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {/* Apartments-only */}
        {stayType === "apartment" ? (
          <>
            <div className="space-y-2 pt-6 border-t border-border/60">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Apartment type</h4>
              <label
                htmlFor="apt-entire"
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id="apt-entire"
                  checked={value.aptEntirePlace}
                  onCheckedChange={(checked) => onChange({ ...value, aptEntirePlace: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Entire place</span>
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bedrooms</h4>
              <div className="px-2">
                <Slider
                  value={[value.bedroomsMin]}
                  onValueChange={(r) => onChange({ ...value, bedroomsMin: r[0] })}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Any</span>
                  <span>{value.bedroomsMin === 0 ? "Any" : `${value.bedroomsMin}+`}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Must-have</h4>
              <label htmlFor="kitchen" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
                <Checkbox
                  id="kitchen"
                  checked={value.kitchen}
                  onCheckedChange={(checked) => onChange({ ...value, kitchen: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Kitchen</span>
              </label>
              <label htmlFor="washer" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
                <Checkbox
                  id="washer"
                  checked={value.washingMachine}
                  onCheckedChange={(checked) => onChange({ ...value, washingMachine: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Washing machine</span>
              </label>
              <label htmlFor="longstay" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer">
                <Checkbox
                  id="longstay"
                  checked={value.longStayDiscount}
                  onCheckedChange={(checked) => onChange({ ...value, longStayDiscount: Boolean(checked) })}
                />
                <span className="text-sm font-medium leading-none">Long-stay discount (7+ nights)</span>
              </label>
            </div>
          </>
        ) : null}
      </div>

      {/* Footer action (mobile / sheet) */}
      {onClose ? (
        <div className="sticky bottom-0 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-border/60 bg-background/95 backdrop-blur-sm">
          <Button className="w-full" onClick={onClose}>
            Apply filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}

