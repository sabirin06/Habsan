"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from "lucide-react"
import type {
  ExperienceCategory,
  ExperienceDurationBucket,
  ExperienceFiltersState,
  ExperienceGroupType
} from "@/lib/experience-types"
import { categoryLabel } from "@/lib/experience-utils"

const DURATION_OPTIONS: Array<{ id: ExperienceDurationBucket; label: string }> = [
  { id: "1_3", label: "1–3 days" },
  { id: "4_7", label: "4–7 days" },
  { id: "7_plus", label: "7+ days" }
]

const GROUP_TYPE: Array<{ id: ExperienceGroupType; label: string }> = [
  { id: "shared", label: "Shared" },
  { id: "private", label: "Private" }
]

export function ExperienceFilters({
  isOpen = true,
  onClose,
  className = "",
  value,
  onChange,
  onReset,
  priceMaxCap = 500,
  locations,
  operators,
  languages
}: {
  isOpen?: boolean
  onClose?: () => void
  className?: string
  value: ExperienceFiltersState
  onChange: (next: ExperienceFiltersState) => void
  onReset: () => void
  priceMaxCap?: number
  locations: string[]
  operators: Array<{ id: string; name: string }>
  languages: string[]
}) {
  const categories = useMemo(
    () =>
      ([
        "cultural",
        "adventure",
        "nature",
        "city_tours",
        "beach",
        "family",
        "private_tours"
      ] as ExperienceCategory[]).map((id) => ({ id, label: categoryLabel(id) })),
    []
  )

  const toggle = <T extends string>(arr: T[], id: T, checked: boolean): T[] =>
    checked ? (Array.from(new Set([...arr, id])) as T[]) : arr.filter((x) => x !== id)

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
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price per person</h4>
          <div className="px-2">
            <Slider
              value={value.priceRange}
              onValueChange={(r) => onChange({ ...value, priceRange: [r[0], r[1]] })}
              max={priceMaxCap}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${value.priceRange[0]}</span>
              <span>${value.priceRange[1]}</span>
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

        {/* Duration */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</h4>
          <div className="space-y-1">
            {DURATION_OPTIONS.map((d) => (
              <label
                key={d.id}
                htmlFor={`dur-${d.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`dur-${d.id}`}
                  checked={value.duration.includes(d.id)}
                  onCheckedChange={(checked) =>
                    onChange({ ...value, duration: toggle(value.duration, d.id, Boolean(checked)) })
                  }
                />
                <span className="text-sm font-medium leading-none">{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Group type */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Group type</h4>
          <div className="space-y-1">
            {GROUP_TYPE.map((g) => (
              <label
                key={g.id}
                htmlFor={`group-${g.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`group-${g.id}`}
                  checked={value.groupType.includes(g.id)}
                  onCheckedChange={(checked) =>
                    onChange({ ...value, groupType: toggle(value.groupType, g.id, Boolean(checked)) })
                  }
                />
                <span className="text-sm font-medium leading-none">{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Group size */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Group size</h4>
          <div className="px-2">
            <Slider
              value={[value.groupSizeMax]}
              onValueChange={(r) => onChange({ ...value, groupSizeMax: r[0] })}
              max={50}
              min={2}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>2</span>
              <span>Up to {value.groupSizeMax}</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3 pt-6 border-t border-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tour type</h4>
          <div className="space-y-1">
            {categories.map((c) => (
              <label
                key={c.id}
                htmlFor={`cat-${c.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`cat-${c.id}`}
                  checked={value.categories.includes(c.id)}
                  onCheckedChange={(checked) =>
                    onChange({ ...value, categories: toggle(value.categories, c.id, Boolean(checked)) })
                  }
                />
                <span className="text-sm font-medium leading-none">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        {locations.length ? (
          <div className="space-y-3 pt-6 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</h4>
            <div className="space-y-1">
              {locations.map((loc) => (
                <label
                  key={loc}
                  htmlFor={`loc-${loc}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`loc-${loc}`}
                    checked={value.locations.includes(loc)}
                    onCheckedChange={(checked) => onChange({ ...value, locations: toggle(value.locations, loc, Boolean(checked)) })}
                  />
                  <span className="text-sm font-medium leading-none">{loc}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {/* Language */}
        {languages.length ? (
          <div className="space-y-3 pt-6 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language</h4>
            <div className="space-y-1">
              {languages.map((l) => (
                <label
                  key={l}
                  htmlFor={`lang-${l}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`lang-${l}`}
                    checked={value.languages.includes(l)}
                    onCheckedChange={(checked) => onChange({ ...value, languages: toggle(value.languages, l, Boolean(checked)) })}
                  />
                  <span className="text-sm font-medium leading-none">{l}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {/* Operator */}
        {operators.length ? (
          <div className="space-y-3 pt-6 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operator</h4>
            <div className="space-y-1">
              {operators.map((o) => (
                <label
                  key={o.id}
                  htmlFor={`op-${o.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors cursor-pointer"
                >
                  <Checkbox
                    id={`op-${o.id}`}
                    checked={value.operators.includes(o.id)}
                    onCheckedChange={(checked) => onChange({ ...value, operators: toggle(value.operators, o.id, Boolean(checked)) })}
                  />
                  <span className="text-sm font-medium leading-none">{o.name}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
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

