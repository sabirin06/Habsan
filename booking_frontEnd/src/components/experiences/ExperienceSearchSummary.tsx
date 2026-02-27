"use client"

import * as React from "react"
import { Calendar, Edit3, MapPin, Tag, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExperienceSearchSummary({
  destinationSummary,
  dateSummary,
  typeSummary,
  travelersSummary,
  onEdit
}: {
  destinationSummary: string
  dateSummary: string
  typeSummary: string
  travelersSummary: string
  onEdit?: () => void
}) {
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
      className="sticky z-40 bg-background/95 backdrop-blur-sm border-b border-border/60"
      style={{ top: "var(--app-header-h, 80px)" }}
    >
      <div className="container py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{destinationSummary}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dateSummary}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>{typeSummary}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{travelersSummary}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit} className="w-full md:w-auto justify-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Search
          </Button>
        </div>
      </div>
    </div>
  )
}

