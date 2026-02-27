"use client"

import * as React from "react"
import { Calendar, Users, Edit3, Route } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FlightSearchSummaryProps {
  routeSummary: string
  dateSummary: string
  passengersSummary: string
  tripType: "round-trip" | "one-way" | "multi-city"
  onEdit?: () => void
}

export function FlightSearchSummary({
  routeSummary,
  dateSummary,
  passengersSummary,
  tripType = "round-trip",
  onEdit
}: FlightSearchSummaryProps) {
  const summaryRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const headerEl = document.querySelector("header") as HTMLElement | null
    const root = document.documentElement

    const update = () => {
      const headerH = headerEl?.getBoundingClientRect().height ?? 80
      const summaryH = summaryRef.current?.getBoundingClientRect().height ?? 0
      root.style.setProperty("--app-header-h", `${Math.round(headerH)}px`)
      root.style.setProperty("--search-summary-h", `${Math.round(summaryH)}px`)
      root.style.setProperty("--sticky-stack-h", `calc(var(--app-header-h) + var(--search-summary-h))`)
    }

    update()

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update())
      if (headerEl) ro.observe(headerEl)
      if (summaryRef.current) ro.observe(summaryRef.current)
    }

    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("resize", update)
      ro?.disconnect()
    }
  }, [])

  return (
    <div
      ref={summaryRef}
      className="sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border"
      style={{ top: "var(--app-header-h, 80px)" }}
    >
      <div className="container py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Route */}
            <div className="flex items-center gap-2 text-sm">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{routeSummary}</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dateSummary}</span>
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{passengersSummary}</span>
            </div>

            {/* Trip Type */}
            <div className="px-2 py-1 bg-muted rounded text-xs font-medium">
              {tripType.replace('-', ' ')}
            </div>
          </div>

          {/* Edit Button */}
          <Button variant="outline" size="sm" onClick={onEdit} className="w-full md:w-auto justify-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Search
          </Button>
        </div>
      </div>
    </div>
  )
}