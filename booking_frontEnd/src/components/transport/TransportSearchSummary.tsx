"use client"

import { Button } from "@/components/ui/button"
import { Car, PlaneLanding, Pencil } from "lucide-react"

export function TransportSearchSummary({
  title,
  subtitle,
  onEdit
}: {
  title: string
  subtitle: string
  onEdit: () => void
}) {
  const isPickup = title.toLowerCase().includes("airport")
  return (
    <section className="bg-background border-b border-border/60">
      <div className="container pt-24 pb-6">
        <div className="clean-card border border-border/60 p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium">
                  {isPickup ? <PlaneLanding className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                  Transport
                </span>
                <div className="text-lg font-semibold truncate">{title}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground truncate">{subtitle}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

