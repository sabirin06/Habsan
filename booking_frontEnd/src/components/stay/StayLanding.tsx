"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { StayGuests, StaySearchData, StayType } from "@/lib/stay-types"
import { AFRICA_STAY_DESTINATIONS } from "@/lib/stay-destinations"
import { StayHero } from "./StayHero"
import { StayDestinationCard } from "./StayDestinationCard"
import { MOCK_STAYS } from "@/lib/mock-stays"
import { StayResultCard } from "./stay-result-card"
import { Building2, Home, ShieldCheck, BadgeDollarSign, Headset, CalendarCheck2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calcNights } from "@/lib/stay-utils"

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function safeType(input: string | null | undefined): StayType {
  return input === "apartment" ? "apartment" : "hotel"
}

function asInt(input: string | null | undefined, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function firstParam(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
}

function parseGuests(params: Record<string, string | string[] | undefined>): StayGuests {
  const get = (k: string) => firstParam(params[k])
  const adults = Math.max(1, asInt(get("adults"), 2))
  const children = Math.max(0, asInt(get("children"), 0))
  const legacyGuests = asInt(get("guests"), 0)
  if (!get("adults") && legacyGuests > 0) return { adults: Math.max(1, legacyGuests), children: 0 }
  return { adults, children }
}

function totalGuests(g: StayGuests) {
  return Math.max(1, (g.adults || 0) + (g.children || 0))
}

function buildSearchUrl(data: StaySearchData) {
  const params = new URLSearchParams()
  params.set("type", data.type)
  params.set("dest", data.destination)
  params.set("checkIn", data.checkIn)
  params.set("checkOut", data.checkOut)
  params.set("adults", String(data.guests.adults))
  params.set("children", String(data.guests.children))
  params.set("guests", String(totalGuests(data.guests)))
  params.set("rooms", String(data.rooms))
  if (data.entirePlace) params.set("entirePlace", "1")
  return `/stay/search?${params.toString()}`
}

export default function StayLanding({
  initialSearchParams
}: {
  initialSearchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement | null>(null)

  const get = (k: string) => firstParam(initialSearchParams[k])
  const initialType = safeType(get("type"))

  const [searchData, setSearchData] = useState<StaySearchData>(() => {
    const checkIn = get("checkIn") ?? todayPlus(14)
    const checkOut = get("checkOut") ?? todayPlus(21)
    const guests = parseGuests(initialSearchParams)
    return {
      type: initialType,
      destination: get("dest") ?? "Mogadishu",
      checkIn,
      checkOut,
      guests,
      rooms: Math.max(0, asInt(get("rooms"), initialType === "hotel" ? 0 : 1)),
      entirePlace: get("entirePlace") === "1"
    }
  })

  const nights = useMemo(() => calcNights(searchData.checkIn, searchData.checkOut), [searchData.checkIn, searchData.checkOut])

  const featured = useMemo(() => {
    // curated set: mix hotel + apartment, sorted by rating then price
    return [...MOCK_STAYS]
      .sort((a, b) => b.guestRating - a.guestRating || a.pricePerNight - b.pricePerNight)
      .slice(0, 4)
  }, [])

  const onSearch = () => {
    router.push(buildSearchUrl(searchData))
  }

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const setType = (t: StayType) => {
    setSearchData((cur) => ({
      ...cur,
      type: t,
      rooms: t === "hotel" ? cur.rooms : Math.max(1, cur.rooms || 1)
    }))
  }

  const quickCards = [
    {
      id: "hotel" as const,
      title: "Hotels",
      desc: "Comfort, services, and daily housekeeping",
      icon: Building2
    },
    {
      id: "apartment" as const,
      title: "Apartments",
      desc: "Entire places, long stays, local living",
      icon: Home
    }
  ]

  const benefits = [
    { title: "Best Price Guarantee", desc: "Transparent pricing, no surprises.", icon: BadgeDollarSign },
    { title: "Secure Payments", desc: "Protected checkout and receipts.", icon: ShieldCheck },
    { title: "Local Partner Support", desc: "Real help from regional teams.", icon: Headset },
    { title: "Flexible Cancellation", desc: "Choose stays with free cancellation.", icon: CalendarCheck2 }
  ]

  const ratingSummary = { score: 4.8, count: 18234 }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <StayHero
          heroRef={heroRef}
          searchData={searchData}
          onChangeSearch={setSearchData}
          onChangeType={setType}
          onSearch={onSearch}
        />

        {/* Quick stay type entry */}
        <section className="py-10 section-elevated">
          <div className="container">
            <div className="grid gap-4 sm:grid-cols-2">
              {quickCards.map((c) => {
                const Icon = c.icon
                const active = searchData.type === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setType(c.id)
                      scrollToHero()
                    }}
                    className={[
                      "clean-card p-6 text-left border border-border/60 hover:shadow-xl transition-shadow",
                      active ? "ring-2 ring-primary/10 border-primary/30" : ""
                    ].join(" ")}
                    aria-label={`Choose ${c.title}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">{c.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-border bg-background text-xs font-medium">
                        Explore {c.title}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular destinations */}
        <section className="py-14 section-muted">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Popular stays this season</h2>
                <p className="mt-2 text-muted-foreground">African-first destinations with great availability right now.</p>
              </div>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => {
                  setSearchData((s) => ({ ...s, destination: "Nairobi" }))
                  scrollToHero()
                }}
              >
                Try Nairobi
              </Button>
            </div>

            <div className="mt-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-4 snap-x snap-mandatory">
                {AFRICA_STAY_DESTINATIONS.map((d) => (
                  <div key={d.city} className="snap-start">
                    <StayDestinationCard
                      destination={d}
                      onClick={() => {
                        setSearchData((s) => ({ ...s, destination: d.city }))
                        scrollToHero()
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured stays */}
        <section className="py-14 section-elevated">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Top-rated stays</h2>
                <p className="mt-2 text-muted-foreground">Highly reviewed hotels and apartments — curated for confidence.</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex" onClick={onSearch}>
                View all stays
              </Button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {featured.map((s) => (
                <div key={s.id} className="relative">
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-primary" /> {s.guestRating.toFixed(1)}
                      </span>
                    </span>
                    {("freeCancellation" in s && (s as any).freeCancellation) ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        Free cancellation
                      </span>
                    ) : null}
                    <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                      Best price
                    </span>
                  </div>

                  <StayResultCard
                    stay={s as any}
                    onView={() => {
                      const params = new URLSearchParams()
                      params.set("type", s.type)
                      params.set("dest", searchData.destination)
                      params.set("checkIn", searchData.checkIn)
                      params.set("checkOut", searchData.checkOut)
                      params.set("adults", String(searchData.guests.adults))
                      params.set("children", String(searchData.guests.children))
                      params.set("guests", String(totalGuests(searchData.guests)))
                      params.set("rooms", String(searchData.rooms))
                      if (searchData.entirePlace) params.set("entirePlace", "1")
                      router.push(`/stay/${encodeURIComponent(s.id)}?${params.toString()}`)
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 sm:hidden">
              <Button className="w-full" onClick={onSearch}>
                View all stays
              </Button>
            </div>
          </div>
        </section>

        {/* Why book */}
        <section className="py-14 section-muted">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight">Why book with TravelPro</h2>
              <p className="mt-2 text-muted-foreground">Premium, simple, and built for African travelers.</p>
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

        {/* Trust & social proof */}
        <section className="py-14 section-elevated">
          <div className="container">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Trusted by African travelers</h2>
                <p className="mt-2 text-muted-foreground">A premium stay experience with support you can count on.</p>
              </div>
              <div className="clean-card px-5 py-4 border border-border/60 inline-flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">
                    {ratingSummary.score.toFixed(1)}/5
                    <span className="text-muted-foreground font-medium"> average</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{ratingSummary.count.toLocaleString()} reviews</div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {[
                {
                  name: "Asha M.",
                  from: "Nairobi, Kenya",
                  quote: "The apartment was exactly as described — fast check-in and great local support.",
                  tag: "Apartment stay"
                },
                {
                  name: "Khalid A.",
                  from: "Dakar, Senegal",
                  quote: "Booked a hotel for business — clean, secure payment, and no surprises at checkout.",
                  tag: "Hotel stay"
                },
                {
                  name: "Samira H.",
                  from: "Hargeisa, Somaliland",
                  quote: "Loved the simplicity. Great options for longer stays and remote work.",
                  tag: "Long stay"
                }
              ].map((r) => (
                <div key={r.name} className="clean-card p-6 border border-border/60">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20">
                    {r.tag}
                  </div>
                  <div className="mt-4 text-foreground leading-relaxed">“{r.quote}”</div>
                  <div className="mt-6 pt-4 border-t border-border/60">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.from}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 clean-card p-6 border border-border/60">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="font-semibold">Partners you already trust</div>
                  <div className="text-sm text-muted-foreground">Hotels, hosts, and payment providers across Africa.</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Serena Hotels", "Radisson Blu", "Hilton", "Top Hosts", "Visa", "Mastercard", "M‑Pesa"].map((p) => (
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
        <section className="py-16 section-muted">
          <div className="container">
            <div className="clean-card p-8 md:p-10 border border-border/60 overflow-hidden relative">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-emerald-500/10" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight">Ready to book your stay?</div>
                  <div className="mt-2 text-muted-foreground">
                    {searchData.destination || "Anywhere"} • {nights} night{nights > 1 ? "s" : ""} • {totalGuests(searchData.guests)} guests
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={scrollToHero}>
                    Edit search
                  </Button>
                  <Button onClick={onSearch}>Search stays</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">{searchData.destination || "Anywhere"}</div>
              <div className="text-sm font-semibold tabular-nums">
                {totalGuests(searchData.guests)} guests • {nights} night{nights > 1 ? "s" : ""}
              </div>
            </div>
            <Button className="flex-1" onClick={onSearch}>
              Search stays
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

