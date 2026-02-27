"use client"

import type { StayType } from "@/lib/stay-types"

export function StayTypeSwitcher({
  value,
  onChange,
  className = ""
}: {
  value: StayType
  onChange: (next: StayType) => void
  className?: string
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1 p-1 rounded-xl border border-border/60 bg-muted/30 backdrop-blur-sm",
        className
      ].join(" ")}
      role="tablist"
      aria-label="Stay type"
    >
      {(
        [
          { id: "hotel" as const, label: "Hotels" },
          { id: "apartment" as const, label: "Apartments" }
        ] as const
      ).map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              active
                ? "bg-background border border-border/60 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            ].join(" ")}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

