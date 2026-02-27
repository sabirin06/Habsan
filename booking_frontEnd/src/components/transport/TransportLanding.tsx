"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { TransportSearchCard } from "@/components/transport/TransportSearchCard"
import { MOCK_TRANSPORT } from "@/lib/mock-transport"
import type { TransportSearchData } from "@/lib/transport-types"
import { BadgeCheck, Headset, ShieldCheck, Sparkles, Star } from "lucide-react"
import { TransportResultCard } from "@/components/transport/TransportResultCard"

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function todayPlusDateTime(days: number, hour24 = 10) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour24, 0, 0, 0)
  // datetime-local: YYYY-MM-DDTHH:mm
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function buildSearchUrl(data: TransportSearchData) {
  const params = new URLSearchParams()
  params.set("tab", data.tab)

  if (data.tab === "airport_pickup") {
    if (data.pickupAirport) params.set("airport", data.pickupAirport.code)
    if (data.dropOffLocation.trim()) params.set("dropoff", data.dropOffLocation.trim())
    if (data.pickupDateTime) params.set("dt", data.pickupDateTime)
    params.set("passengers", String(Math.max(1, data.passengers || 1)))
  } else {
    if (data.rentalPickupLocation.trim()) params.set("pickup", data.rentalPickupLocation.trim())
    if (data.rentalPickupDateTime) params.set("pickupDt", data.rentalPickupDateTime)
    if (data.rentalReturnDateTime) params.set("returnDt", data.rentalReturnDateTime)
    params.set("carType", data.carType)
    params.set("driver", data.rentalDriverMode)
    params.set("passengers", String(Math.max(1, data.passengers || 1)))
  }
  return `/transport/search?${params.toString()}`
}

export default function TransportLanding({
  initialSearchParams
}: {
  initialSearchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement | null>(null)

  const firstParam = (v: string | string[] | undefined) => (typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined)
  const get = (k: string) => firstParam(initialSearchParams[k])

  const [searchData, setSearchData] = useState<TransportSearchData>(() => {
    // Keep it simple for Phase 1: a premium default that works instantly.
    const tab = get("tab") === "rent_a_car" ? "rent_a_car" : "airport_pickup"
    const passengers = Math.max(1, Math.min(12, Number(get("passengers") || 2) || 2))
    return {
      tab,
      pickupAirport: null,
      dropOffLocation: get("dropoff") ?? "",
      pickupDateTime: get("dt") ?? todayPlusDateTime(7, 10),
      passengers,
      rentalPickupLocation: get("pickup") ?? "Mogadishu",
      rentalPickupDateTime: get("pickupDt") ?? `${todayPlus(7)}T10:00`,
      rentalReturnDateTime: get("returnDt") ?? `${todayPlus(10)}T10:00`,
      carType: (get("carType") as any) ?? "any",
      rentalDriverMode: (get("driver") as any) ?? "either"
    }
  })

  const mostBooked = useMemo(() => {
    const ids = new Set(["trp_pick_mog_mia_economy", "trp_pick_mog_suv_family", "trp_pick_hrg_black_exec"])
    const list = MOCK_TRANSPORT.filter((t) => ids.has(t.id))
    return list.length ? list : MOCK_TRANSPORT.slice(0, 3)
  }, [])

  const onSearch = () => router.push(buildSearchUrl(searchData))
  const scrollToHero = () => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const trust = [
    { title: "Verified drivers", icon: BadgeCheck },
    { title: "Secure payments", icon: ShieldCheck },
    { title: "24/7 local support", icon: Headset }
  ]

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
                Transport • Somalia → Africa-wide
              </div>
              <h1 className="mt-4 text-headline">Your ride awaits — airport pickups & car rentals made simple</h1>
              <p className="mt-3 text-body text-muted-foreground max-w-2xl">
                Seamless, secure rides across Somalia & Africa.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trust.map((t) => {
                  const Icon = t.icon
                  return (
                    <span
                      key={t.title}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {t.title}
                    </span>
                  )
                })}
              </div>

              <div className="mt-8 flex gap-2">
                <Button onClick={scrollToHero} className="hidden">
                  {/* reserved */}
                </Button>
                <Button
                  className="premium-button-primary"
                  onClick={() => {
                    scrollToHero()
                    // Focus will naturally land on first input; no hard focus to keep it calm.
                  }}
                >
                  Book a ride
                </Button>
                <Button variant="outline" onClick={() => router.push("/transport/search?tab=airport_pickup")}>
                  Browse options
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <TransportSearchCard value={searchData} onChange={setSearchData} onSearch={onSearch} ctaLabel="Search" />
            </div>
          </div>
        </section>

        {/* Most booked */}
        <section className="py-14 section-elevated">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Most booked services</h2>
                <p className="mt-2 text-muted-foreground">Premium, reliable picks travelers book the most.</p>
              </div>
              <Button variant="outline" className="hidden sm:inline-flex" onClick={() => router.push("/transport/search?tab=airport_pickup")}>
                View all
              </Button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {mostBooked.map((s) => (
                <div key={s.id} className="relative">
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-primary" /> {s.rating.score.toFixed(1)}
                      </span>
                    </span>
                    {s.features.includes("wifi") ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                        Wi‑Fi
                      </span>
                    ) : null}
                    {s.features.includes("ac") ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                        AC
                      </span>
                    ) : null}
                    {s.features.includes("child_seat") ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">
                        Child seat
                      </span>
                    ) : null}
                  </div>

                  <TransportResultCard
                    service={s}
                    variant="grid"
                    onView={() => router.push(`/transport/details/${encodeURIComponent(s.id)}?tab=${searchData.tab}`)}
                    onBook={() => router.push(`/transport/details/${encodeURIComponent(s.id)}?tab=${searchData.tab}`)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 sm:hidden">
              <Button className="w-full" onClick={() => router.push("/transport/search?tab=airport_pickup")}>
                View all
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

