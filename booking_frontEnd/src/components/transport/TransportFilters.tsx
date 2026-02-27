"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from "lucide-react"
import type { DriverMode, TransportFiltersState, VehicleType } from "@/lib/transport-types"

const VEHICLES: Array<{ id: VehicleType; label: string }> = [
  { id: "sedan", label: "Sedan" },
  { id: "suv", label: "SUV" },
  { id: "van", label: "Van" },
  { id: "luxury", label: "Luxury" }
]

const DRIVER: Array<{ id: DriverMode; label: string }> = [
  { id: "self_drive", label: "Self-drive" },
  { id: "with_driver", label: "With driver" }
]

export function TransportFilters({
  isOpen = true,
  onClose,
  className = "",
  value,
  onChange,
  onReset,
  priceMaxCap = 250,
  providers
}: {
  isOpen?: boolean
  onClose?: () => void
  className?: string
  value: TransportFiltersState
  onChange: (next: TransportFiltersState) => void
  onReset: () => void
  priceMaxCap?: number
  providers: Array<{ id: string; name: string }>
}) {
  const toggle = <T extends string>(arr: T[], id: T, checked: boolean): T[] =>
    checked ? (Array.from(new Set([...arr, id])) as T[]) : arr.filter((x) => x !== id)

  const capMax = useMemo(() => Math.max(1, Math.min(16, value.capacityMin < 1 ? 16 : 16)), [value.capacityMin])

  if (!isOpen) return null

  return (
    <div
      className={[
        "w-full lg:w-80 bg-background/95 backdrop-blur-sm border border-border/60 h-full overflow-hidden flex flex-col rounded-2xl",
        className
      ].join(" ")}
    >
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
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</h4>
          <div className="px-2">
            <Slider
              value={value.priceRange}
              onValueChange={(r) => onChange({ ...value, priceRange: [r[0], r[1]] })}
              max={priceMaxCap}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${value.priceRange[0]}</span>
              <span>${value.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Vehicle type */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vehicle type</h4>
          <div className="space-y-1">
            {VEHICLES.map((v) => (
              <label
                key={v.id}
                htmlFor={`veh-${v.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`veh-${v.id}`}
                  checked={value.vehicleTypes.includes(v.id)}
                  onCheckedChange={(checked) => onChange({ ...value, vehicleTypes: toggle(value.vehicleTypes, v.id, Boolean(checked)) as any })}
                />
                <span className="text-sm font-medium leading-none">{v.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Driver mode */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Self-drive / Driver</h4>
          <div className="space-y-1">
            {DRIVER.map((d) => (
              <label
                key={d.id}
                htmlFor={`drv-${d.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`drv-${d.id}`}
                  checked={value.driverModes.includes(d.id)}
                  onCheckedChange={(checked) => onChange({ ...value, driverModes: toggle(value.driverModes, d.id, Boolean(checked)) as any })}
                />
                <span className="text-sm font-medium leading-none">{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Passenger capacity */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Passenger capacity</h4>
          <div className="px-2">
            <Slider
              value={[value.capacityMin]}
              onValueChange={(r) => onChange({ ...value, capacityMin: r[0] })}
              max={capMax}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>1</span>
              <span>{value.capacityMin}+</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rating</h4>
          <div className="px-2">
            <Slider
              value={[value.ratingMin]}
              onValueChange={(r) => onChange({ ...value, ratingMin: r[0] })}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{value.ratingMin.toFixed(1)}+</span>
              <span>5.0</span>
            </div>
          </div>
        </div>

        {/* Provider */}
        {providers.length ? (
          <div className="space-y-3 pt-6 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider</h4>
            <div className="space-y-1">
              {providers.map((p) => (
                <label
                  key={p.id}
                  htmlFor={`prov-${p.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`prov-${p.id}`}
                    checked={value.providers.includes(p.id)}
                    onCheckedChange={(checked) => onChange({ ...value, providers: toggle(value.providers, p.id, Boolean(checked)) })}
                  />
                  <span className="text-sm font-medium leading-none">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <label
            htmlFor="free-cancel"
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
          >
            <Checkbox
              id="free-cancel"
              checked={value.freeCancellation}
              onCheckedChange={(checked) => onChange({ ...value, freeCancellation: Boolean(checked) })}
            />
            <span className="text-sm font-medium leading-none">Free cancellation</span>
          </label>
        </div>
      </div>

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

