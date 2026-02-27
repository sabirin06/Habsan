"use client"

import * as React from "react"
import { Calendar, Users, MapPin, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StayType } from "@/lib/stay-types"
import { StayTypeSwitcher } from "./stay-type-switcher"

type Props = {
  destinationSummary: string
  dateSummary: string
  guestsSummary: string
  stayType: StayType
  onChangeType: (t: StayType) => void
  onEdit?: () => void
}

export function StaySearchSummary({
  destinationSummary,
  dateSummary,
  guestsSummary,
  stayType,
  onChangeType,
  onEdit
}: Props) {
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
          <div className="min-w-0 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <StayTypeSwitcher value={stayType} onChange={onChangeType} className="shrink-0" />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm min-w-0">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{destinationSummary}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{dateSummary}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{guestsSummary}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full md:w-auto justify-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Search
          </Button>
        </div>
      </div>
    </div>
  )
}

