"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { ExperienceCategory, ExperienceSearchData, ExperienceTravelers } from "@/lib/experience-types"
import { categoryLabel, totalTravelers } from "@/lib/experience-utils"
import { MOCK_EXPERIENCES } from "@/lib/mock-experiences"
import { ExperienceSearchCard } from "./ExperienceSearchCard"
import { ExperienceResultCard } from "./ExperienceResultCard"
import { BadgeCheck, CalendarCheck2, Headset, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

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

function buildSearchUrl(data: ExperienceSearchData) {
  const params = new URLSearchParams()
  params.set("dest", data.destination)
  params.set("date", data.date)
  params.set("type", data.category)
  params.set("adults", String(data.travelers.adults))
  params.set("children", String(data.travelers.children))
  params.set("travelers", String(totalTravelers(data.travelers)))
  return `/experiences/search?${params.toString()}`
}

export default function ExperiencesLanding({
  initialSearchParams
}: {
  initialSearchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement | null>(null)

  const get = (k: string) => firstParam(initialSearchParams[k])

  const [searchData, setSearchData] = useState<ExperienceSearchData>(() => {
    const destination = get("dest") ?? "Mogadishu"
    const date = get("date") ?? todayPlus(14)
    const category = safeCategory(get("type"))
    const travelers = parseTravelers(initialSearchParams)
    return { destination, date, category, travelers }
  })

  const featured = useMemo(() => {
    // Curated: Somalia-first; then best-rated.
    const somaliaFirst = [...MOCK_EXPERIENCES].sort((a, b) => {
      const aSom = a.location.country.toLowerCase().includes("somalia") ? 1 : 0
      const bSom = b.location.country.toLowerCase().includes("somalia") ? 1 : 0
      return bSom - aSom || b.rating.score - a.rating.score || a.pricePerPerson - b.pricePerPerson
    })
    return somaliaFirst.slice(0, 4)
  }, [])

  const categories: Array<{ id: ExperienceCategory; title: string; desc: string }> = [
    { id: "cultural", title: "Cultural", desc: "Heritage, museums, local stories" },
    { id: "adventure", title: "Adventure", desc: "Hikes, dunes, adrenaline" },
    { id: "nature", title: "Nature", desc: "Wildlife, landscapes, calm walks" },
    { id: "city_tours", title: "City tours", desc: "Curated highlights with a guide" },
    { id: "beach", title: "Beach", desc: "Coasts, islands, snorkeling" },
    { id: "family", title: "Family", desc: "Easy pace, kid-friendly routes" },
    { id: "private_tours", title: "Private tours", desc: "Flexible schedules, privacy" }
  ]

  const benefits = [
    { title: "Verified operators", desc: "We curate trusted local partners.", icon: BadgeCheck },
    { title: "Secure payments", desc: "Protected checkout and receipts.", icon: ShieldCheck },
    { title: "Local experts", desc: "Guides who know the place deeply.", icon: Headset },
    { title: "Flexible cancellation", desc: "Clear policies you can trust.", icon: CalendarCheck2 }
  ]

  const onSearch = () => router.push(buildSearchUrl(searchData))
  const scrollToHero = () => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="section-primary pt-24 pb-10">
          <div className="container" ref={heroRef}>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="h-4 w-4" />
                Experiences • Somalia → Africa-wide
              </div>
              <h1 className="mt-4 text-headline">Discover unforgettable experiences in Africa</h1>
              <p className="mt-3 text-body text-muted-foreground max-w-2xl">
                Culture, adventure, guided tours, and trusted operators — designed for calm planning and confident booking.
              </p>
            </div>

            <div className="mt-8">
              <ExperienceSearchCard value={searchData} onChange={setSearchData} onSearch={onSearch} ctaLabel="Search" />
            </div>
          </div>
        </section>

        {/* Popular experiences */}
        <section className="py-14 section-elevated">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Popular experiences</h2>
                <p className="mt-2 text-muted-foreground">Premium, well-reviewed tours to start with.</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex" onClick={onSearch}>
                View all
              </Button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {featured.map((e) => (
                <ExperienceResultCard
                  key={e.id}
                  experience={e}
                  variant="listing"
                  onView={() => router.push(`/experiences/${encodeURIComponent(e.id)}`)}
                  onBook={() => router.push(`/experiences/${encodeURIComponent(e.id)}`)}
                />
              ))}
            </div>

            <div className="mt-8 sm:hidden">
              <Button className="w-full" onClick={onSearch}>
                View all
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-14 section-muted">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
              <p className="mt-2 text-muted-foreground">Progressive disclosure: choose a type and we’ll do the rest.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={[
                    "clean-card p-6 text-left border border-border/60 hover:shadow-xl transition-shadow",
                    searchData.category === c.id ? "ring-2 ring-primary/10 border-primary/30" : ""
                  ].join(" ")}
                  onClick={() => {
                    setSearchData((s) => ({ ...s, category: c.id }))
                    scrollToHero()
                  }}
                  aria-label={`Choose ${c.title}`}
                >
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
                  <div className="mt-5">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-border bg-background text-xs font-medium">
                      Explore {c.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Why book */}
        <section className="py-14 section-elevated">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight">Why book with TravelPro</h2>
              <p className="mt-2 text-muted-foreground">Verified tours, clear pricing, and a calm booking flow.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.title} className="clean-card p-6 border border-border/60">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-4 font-semibold">{b.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{b.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-14 section-muted">
          <div className="container">
            <div className="clean-card p-6 md:p-8 border border-border/60">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="font-semibold">Trusted partners</div>
                  <div className="text-sm text-muted-foreground">Tour operators and local companies across Africa.</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["DalmarPlus", "Horn Heritage Guides", "Red Sea Adventures", "Island Roots Co.", "Visa", "Mastercard", "M‑Pesa"].map((p) => (
                    <span key={p} className="text-xs px-3 py-2 rounded-full border border-border bg-background">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 section-elevated">
          <div className="container">
            <div className="clean-card p-8 md:p-10 border border-border/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-emerald-500/10" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight">Ready to book your next experience?</div>
                  <div className="mt-2 text-muted-foreground">
                    {searchData.destination || "Africa"} • {categoryLabel(searchData.category)} • {totalTravelers(searchData.travelers)} travelers
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={scrollToHero}>
                    Edit search
                  </Button>
                  <Button onClick={onSearch}>Search experiences</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">{searchData.destination || "Africa"}</div>
              <div className="text-sm font-semibold tabular-nums">
                {totalTravelers(searchData.travelers)} travelers • {categoryLabel(searchData.category)}
              </div>
            </div>
            <Button className="flex-1" onClick={onSearch}>
              Search
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

