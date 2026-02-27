"use client"

import type React from "react"
import { CheckCircle2, Headset, ShieldCheck, Sparkles } from "lucide-react"
import type { StaySearchData, StayType } from "@/lib/stay-types"
import { StaySearchCard } from "./stay-search-card"

export function StayHero({
  searchData,
  onChangeSearch,
  onSearch,
  onChangeType,
  heroRef
}: {
  searchData: StaySearchData
  onChangeSearch: (next: StaySearchData) => void
  onSearch: () => void
  onChangeType: (t: StayType) => void
  heroRef?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <section ref={heroRef as any} className="pt-20 md:pt-24 pb-10 section-background">
      <div className="container">
        {/* Header (Flights rhythm, Stay copy) */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-primary/90">Premium African stays</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold tracking-tight mb-3">
            <span className="text-foreground">Find your perfect stay</span>
            <span className="block bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              in Africa
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hotels, apartments, and unique stays — trusted, secure, and easy.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Verified properties
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm px-3 py-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Secure payments
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm px-3 py-2 text-sm">
              <Headset className="h-4 w-4 text-primary" />
              Local support
            </span>
          </div>
        </div>

        {/* Search card (centered like Flights search section) */}
        <div className="mt-8 max-w-5xl mx-auto relative z-20">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-emerald-500/10 rounded-2xl blur-3xl scale-105" />
          <div className="relative">
            <StaySearchCard
              value={searchData}
              onChange={onChangeSearch}
              onSearch={onSearch}
              ctaLabel="Search stays"
              showTypeToggle
            />
          </div>
        </div>
      </div>
    </section>
  )
}

