"use client"

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import type { Experience } from "@/lib/experience-types"
import { Clock3, Globe2, Heart, MapPin, Users } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function badgeLabel(b: string) {
  return b === "hot_deal" ? "Hot deal" : b === "popular" ? "Popular" : "New"
}

export function ExperienceResultCard({
  experience,
  onView,
  onBook,
  variant = "grid"
}: {
  experience: Experience
  onView: () => void
  onBook: () => void
  variant?: "listing" | "grid"
}) {
  const cover = experience.images[0]
  const chips = [
    { icon: Clock3, label: experience.durationLabel },
    { icon: Users, label: `${experience.groupType === "private" ? "Private" : "Shared"} • up to ${experience.groupSizeMax}` },
    { icon: Globe2, label: experience.languages.slice(0, 2).join(", ") + (experience.languages.length > 2 ? ` +${experience.languages.length - 2}` : "") }
  ]

  const CardImage = ({ mode }: { mode: "grid" | "listing" }) => (
    <div className={mode === "listing" ? "relative overflow-hidden h-full" : "relative overflow-hidden"}>
      <div className={mode === "grid" ? "aspect-video" : "aspect-4/3 sm:aspect-auto sm:h-full"}>
        <img src={cover?.url ?? ""} alt={cover?.alt ?? experience.title} className="w-full h-full object-cover" />
      </div>
      <button
        type="button"
        className="absolute top-3 right-3 h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors"
        aria-label="Save to favorites"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Experience favorites are supported on details page; keep this as a lightweight affordance.
        }}
      >
        <Heart className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        {experience.badges.slice(0, 2).map((b) => (
          <span
            key={b}
            className={[
              "text-[11px] px-2 py-1 rounded-full border backdrop-blur-sm",
              b === "hot_deal" ? "bg-primary/10 border-primary/20 text-primary" : "bg-background/85 border-border text-muted-foreground"
            ].join(" ")}
          >
            {badgeLabel(b)}
          </span>
        ))}
      </div>
    </div>
  )

  const MetaRow = () => (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="font-semibold text-base sm:text-lg truncate">{experience.title}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {experience.location.city}, {experience.location.country}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground">
            {experience.operator.verified ? "Verified operator" : "Operator"}
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-background/70 border border-border/60 text-muted-foreground">
            {experience.category === "city_tours"
              ? "City tour"
              : experience.category === "private_tours"
                ? "Private tour"
                : experience.category.charAt(0).toUpperCase() + experience.category.slice(1).replace("_", " ")}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-background text-xs">
          <span className="font-semibold">{experience.rating.score.toFixed(1)}</span>
          <span className="text-muted-foreground">({experience.rating.reviewsCount.toLocaleString()})</span>
        </div>
      </div>
    </div>
  )

  const ChipsRow = () => (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((c) => {
        const Icon = c.icon
        return (
          <span key={c.label} className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {c.label}
          </span>
        )
      })}
    </div>
  )

  const PriceCtaRow = () => (
    <div className="mt-4 pt-4 border-t border-border/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">From</div>
          <div className="text-xl font-semibold tabular-nums leading-tight">
            {fmtMoney(experience.pricePerPerson)}
            <span className="text-sm font-normal text-muted-foreground"> / person</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
          >
            View details
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation()
              onBook()
            }}
          >
            Book now
          </Button>
        </div>
      </div>
    </div>
  )

  const commonProps = {
    role: "link" as const,
    tabIndex: 0,
    onClick: onView,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onView()
      }
    },
    className:
      "w-full text-left clean-card border border-border/60 overflow-hidden hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
    "aria-label": `Open ${experience.title}`
  }

  if (variant === "listing") {
    return (
      <div {...commonProps}>
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 md:w-64 shrink-0">
            <CardImage mode="listing" />
          </div>
          <div className="flex-1 p-4 min-w-0">
            <MetaRow />
            <ChipsRow />
            <PriceCtaRow />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div {...commonProps}>
      <CardImage mode="grid" />
      <div className="p-4 min-w-0">
        <MetaRow />
        <ChipsRow />
        <PriceCtaRow />
      </div>
    </div>
  )
}

