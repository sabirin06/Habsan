"use client"

import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import type { DurationFilter, FiltersState, StopsFilter, TimeOfDayFilter } from "@/lib/flight-types"

interface FlightFiltersProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
  value: FiltersState
  onChange: (next: FiltersState) => void
  onReset: () => void
  airlines: Array<{ name: string; count: number }>
}

export function FlightFilters({
  isOpen = true,
  onClose,
  className = "",
  value,
  onChange,
  onReset,
  airlines
}: FlightFiltersProps) {
  const stops = useMemo(() => {
    return [
      { id: "nonstop" as const, name: "Non-stop" },
      { id: "1stop" as const, name: "1 Stop" },
      { id: "2plus" as const, name: "2+ Stops" }
    ]
  }, [])

  const times = useMemo(() => {
    return [
      { id: "early" as const, name: "Early morning (5:00–11:59)" },
      { id: "afternoon" as const, name: "Afternoon (12:00–17:59)" },
      { id: "evening" as const, name: "Evening (18:00–23:59)" },
      { id: "night" as const, name: "Night (00:00–4:59)" }
    ]
  }, [])

  const durations = useMemo(() => {
    return [
      { id: "under8" as const, name: "Under 8h" },
      { id: "8to16" as const, name: "8h–16h" },
      { id: "16to24" as const, name: "16h–24h" },
      { id: "24plus" as const, name: "24h+" }
    ]
  }, [])

  const toggle = <T extends string>(arr: T[], id: T, checked: boolean) =>
    checked ? Array.from(new Set([...arr, id])) : arr.filter((x) => x !== id)

  if (!isOpen) return null

  return (
    <div
      className={[
        "w-full lg:w-80 bg-background border-r border-border h-full overflow-hidden flex flex-col",
        className
      ].join(" ")}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Header */}
        <div className="hidden lg:flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Price Range</h4>
          <div className="px-2">
            <Slider
              value={value.priceRange}
              onValueChange={(r) => onChange({ ...value, priceRange: [r[0], r[1]] })}
              max={3000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${value.priceRange[0]}</span>
              <span>${value.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Stops</h4>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={stop.id}
                    checked={value.stops.includes(stop.id as StopsFilter)}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...value,
                        stops: toggle(value.stops, stop.id as StopsFilter, checked as boolean)
                      })
                    }
                  />
                  <label
                    htmlFor={stop.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {stop.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Airlines */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Airlines</h4>
          <div className="space-y-2">
            {airlines.map((airline) => (
              <div key={airline.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`airline-${airline.name}`}
                    checked={value.airlines.includes(airline.name)}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...value,
                        airlines: toggle(value.airlines, airline.name, checked as boolean)
                      })
                    }
                  />
                  <label
                    htmlFor={`airline-${airline.name}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {airline.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({airline.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Departure Times */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Departure Time</h4>
          <div className="space-y-2">
            {times.map((time) => (
              <div key={time.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={time.id}
                    checked={value.times.includes(time.id as TimeOfDayFilter)}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...value,
                        times: toggle(value.times, time.id as TimeOfDayFilter, checked as boolean)
                      })
                    }
                  />
                  <label
                    htmlFor={time.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {time.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Max Duration</h4>
          <div className="space-y-2">
            {durations.map((d) => (
              <div key={d.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dur-${d.id}`}
                  checked={value.durations.includes(d.id as DurationFilter)}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...value,
                      durations: toggle(value.durations, d.id as DurationFilter, checked as boolean)
                    })
                  }
                />
                <label
                  htmlFor={`dur-${d.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {d.name}
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Drawer footer (tablet/mobile) - always visible */}
      <div className="lg:hidden p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-border bg-background/95 backdrop-blur-sm">
        <Button className="w-full" onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}