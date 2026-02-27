"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { ExperienceCategory, ExperienceSearchData, ExperienceTravelers } from "@/lib/experience-types"
import { categoryLabel, totalTravelers } from "@/lib/experience-utils"
import { ExperienceSearchSummary } from "@/components/experiences/ExperienceSearchSummary"
import { ExperienceResultsComparison } from "@/components/experiences/ExperienceResultsComparison"
import { ExperienceSearchCard } from "@/components/experiences/ExperienceSearchCard"

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function firstParam(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
}

function asInt(input: string | null | undefined, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function safeCategory(input: string | null | undefined): ExperienceCategory | "any" {
  const v = (input ?? "").toLowerCase()
  const allowed = new Set([
    "any",
    "cultural",
    "adventure",
    "nature",
    "city_tours",
    "beach",
    "family",
    "private_tours"
  ])
  return allowed.has(v) ? (v as any) : "any"
}

function parseTravelers(params: Record<string, string | string[] | undefined>): ExperienceTravelers {
  const get = (k: string) => firstParam(params[k])
  const adults = Math.max(1, asInt(get("adults"), 2))
  const children = Math.max(0, asInt(get("children"), 0))
  const legacy = asInt(get("travelers"), 0)
  if (!get("adults") && legacy > 0) return { adults: Math.max(1, legacy), children: 0 }
  return { adults, children }
}

export default function ExperienceSearchPageClient({
  initialSearchParams
}: {
  initialSearchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter()
  const pathname = usePathname()

  const get = (k: string) => firstParam(initialSearchParams[k])

  const [isEditingSearch, setIsEditingSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchToken, setSearchToken] = useState(0)
  const [closeFiltersToken, setCloseFiltersToken] = useState(0)
  const searchTimeoutRef = useRef<number | null>(null)

  const [searchData, setSearchData] = useState<ExperienceSearchData>(() => {
    const date = get("date") ?? todayPlus(14)
    const destination = get("dest") ?? "Mogadishu"
    const category = safeCategory(get("type"))
    const travelers = parseTravelers(initialSearchParams)
    return { destination, date, category, travelers }
  })

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const updateUrl = (data: ExperienceSearchData) => {
    const params = new URLSearchParams()
    params.set("dest", data.destination)
    params.set("date", data.date)
    params.set("type", data.category)
    params.set("adults", String(data.travelers.adults))
    params.set("children", String(data.travelers.children))
    params.set("travelers", String(totalTravelers(data.travelers)))
    router.replace(`${pathname}?${params.toString()}`)
  }

  const [urlSyncToken, setUrlSyncToken] = useState(0)
  useEffect(() => {
    if (urlSyncToken === 0) return
    updateUrl(searchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSyncToken])

  const destinationSummary = useMemo(() => searchData.destination?.trim() || "Africa", [searchData.destination])
  const dateSummary = useMemo(() => (searchData.date ? searchData.date : "Any date"), [searchData.date])
  const typeSummary = useMemo(() => categoryLabel(searchData.category), [searchData.category])
  const travelersSummary = useMemo(() => {
    const t = totalTravelers(searchData.travelers)
    const parts = [`${t} traveler${t > 1 ? "s" : ""}`]
    parts.push(`${searchData.travelers.adults} adult${searchData.travelers.adults > 1 ? "s" : ""}`)
    if (searchData.travelers.children) parts.push(`${searchData.travelers.children} child${searchData.travelers.children === 1 ? "" : "ren"}`)
    return parts.join(" • ")
  }, [searchData.travelers])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <ExperienceSearchSummary
          destinationSummary={destinationSummary}
          dateSummary={dateSummary}
          typeSummary={typeSummary}
          travelersSummary={travelersSummary}
          onEdit={() => setIsEditingSearch(true)}
        />

        <ExperienceResultsComparison
          searchData={searchData}
          isLoading={isSearching}
          searchToken={searchToken}
          requestCloseFiltersToken={closeFiltersToken}
        />
      </main>

      {/* Edit Search Modal */}
      {isEditingSearch ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditingSearch(false)} />
          <div className="absolute inset-0 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="container py-10">
              <div className="max-w-5xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="font-semibold">Modify experience search</div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                    onClick={() => setIsEditingSearch(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="p-4">
                  <ExperienceSearchCard
                    value={searchData}
                    onChange={(next) => setSearchData(next)}
                    ctaLabel="Update results"
                    onSearch={() => {
                      setIsEditingSearch(false)
                      setUrlSyncToken((x) => x + 1)
                      setSearchToken((x) => x + 1)
                      setCloseFiltersToken((x) => x + 1)
                      setIsSearching(true)
                      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
                      searchTimeoutRef.current = window.setTimeout(() => setIsSearching(false), 420)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}

