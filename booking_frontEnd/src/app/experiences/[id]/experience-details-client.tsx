/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ExperienceGallery } from "@/components/experiences/details/ExperienceGallery"
import { ExperienceBookingCard } from "@/components/experiences/details/ExperienceBookingCard"
import type { ExperienceBookingDraft } from "@/lib/booking-storage"
import { saveBookingDraft } from "@/lib/booking-storage"
import { getMockExperienceById } from "@/lib/mock-experiences"
import type { ExperienceTravelers } from "@/lib/experience-types"
import { totalTravelers } from "@/lib/experience-utils"
import { MapPin, Star, ShieldCheck, BadgeCheck, ArrowLeft } from "lucide-react"
import { MOCK_STAYS } from "@/lib/mock-stays"
import { StayResultCard } from "@/components/stay/stay-result-card"

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function asInt(input: string | null | undefined, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

export default function ExperienceDetailsClient({ id }: { id: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const experience = useMemo(() => getMockExperienceById(id), [id])

  const [date, setDate] = useState(() => sp.get("date") ?? todayPlus(14))
  const [travelers, setTravelers] = useState<ExperienceTravelers>(() => ({
    adults: Math.max(1, asInt(sp.get("adults"), 2)),
    children: Math.max(0, asInt(sp.get("children"), 0))
  }))

  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") return "/experiences"
    return `${window.location.pathname}${window.location.search}`
  }, [])

  const backHref = useMemo(() => {
    const dest = sp.get("dest")
    const type = sp.get("type")
    const adults = sp.get("adults")
    const children = sp.get("children")
    const qs = new URLSearchParams()
    if (dest) qs.set("dest", dest)
    if (date) qs.set("date", date)
    if (type) qs.set("type", type)
    if (adults) qs.set("adults", adults)
    if (children) qs.set("children", children)
    return `/experiences/search?${qs.toString()}`
  }, [sp, date])

  const pricing = useMemo(() => {
    if (!experience) return { pricePerPerson: 0, travelers: 1, fees: 0, total: 0, currency: "USD" as const }
    const t = totalTravelers(travelers)
    const subtotal = experience.pricePerPerson * t
    const fees = Math.round(subtotal * 0.08 * 100) / 100
    const total = Math.max(0, subtotal + fees)
    return { pricePerPerson: experience.pricePerPerson, travelers: t, fees, total, currency: "USD" as const }
  }, [experience, travelers])

  const onBook = () => {
    if (!experience) return
    const draft: ExperienceBookingDraft = {
      version: 2,
      kind: "experience",
      createdAt: Date.now(),
      returnUrl,
      experience: {
        experienceId: experience.id,
        date,
        travelers,
        pricing
      }
    }
    saveBookingDraft(draft)
    router.push("/checkout")
  }

  const linkedStay = useMemo(() => {
    if (!experience) return null
    const city = experience.location.city.toLowerCase()
    const country = experience.location.country.toLowerCase()
    return (
      MOCK_STAYS.find((s) => s.location.city.toLowerCase() === city) ??
      MOCK_STAYS.find((s) => s.location.country.toLowerCase() === country) ??
      null
    )
  }, [experience])

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4">
          <div className="max-w-3xl mx-auto clean-card p-6">
            <div className="text-lg font-semibold">Experience not found</div>
            <div className="mt-2 text-sm text-muted-foreground">This tour is unavailable. Please go back to search results.</div>
            <div className="mt-6">
              <Button onClick={() => router.push("/experiences")}>Back to Experiences</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => router.push(backHref)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to results
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure payment
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified operators
              </span>
            </div>
          </div>

          <div className="mt-4">
            <ExperienceGallery experienceId={experience.id} images={experience.images} title={experience.title} />
          </div>

          <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
            <div className="min-w-0 space-y-6 md:space-y-8">
              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">{experience.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {experience.location.city}, {experience.location.country}
                      </span>
                      <span className="hidden sm:inline text-muted-foreground/60">•</span>
                      <span className="inline-flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="text-foreground font-medium">{experience.rating.score.toFixed(1)}</span>
                        <span className="text-muted-foreground">({experience.rating.reviewsCount.toLocaleString()} reviews)</span>
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        {experience.operator.verified ? "Verified operator" : "Operator"} • {experience.operator.name}
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground">
                        {experience.durationLabel}
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground">
                        {experience.groupType === "private" ? "Private" : "Shared"} • up to {experience.groupSizeMax}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <Tabs defaultValue="overview">
                  <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="included">Included</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold">Description</h2>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{experience.overview.description}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="border border-border/60 rounded-xl p-4 bg-background">
                          <h3 className="font-semibold">Highlights</h3>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                            {experience.overview.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-border/60 rounded-xl p-4 bg-background">
                          <h3 className="font-semibold">Who it’s for</h3>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                            {experience.overview.whoItsFor.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="itinerary">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Day-by-day itinerary</h2>
                      <Accordion type="single" collapsible className="space-y-2">
                        {experience.itinerary.map((d) => (
                          <AccordionItem key={d.day} value={`day-${d.day}`}>
                            <AccordionTrigger>
                              Day {d.day}: {d.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm text-muted-foreground">{d.summary}</div>
                              {d.stops?.length ? (
                                <div className="mt-3">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stops</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {d.stops.map((s) => (
                                      <span
                                        key={s}
                                        className="text-[11px] px-2 py-1 rounded-full bg-muted/40 border border-border/60 text-muted-foreground"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>

                  <TabsContent value="included">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="border border-border/60 rounded-xl p-4 bg-background">
                        <h3 className="font-semibold">What’s included</h3>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                          {experience.included.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-border/60 rounded-xl p-4 bg-background">
                        <h3 className="font-semibold">What’s excluded</h3>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                          {experience.excluded.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <div className="space-y-4">
                      <div className="flex items-end justify-between gap-4">
                        <h2 className="text-lg font-semibold">Reviews</h2>
                        <div className="text-sm text-muted-foreground">
                          {experience.rating.score.toFixed(1)} • {experience.rating.reviewsCount.toLocaleString()} reviews
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {[
                          {
                            name: "Ayaan M.",
                            from: `${experience.location.city}`,
                            quote: "Premium pacing and a knowledgeable guide. Felt safe, calm, and well-organized."
                          },
                          {
                            name: "Khalid A.",
                            from: "Nairobi",
                            quote: "Clear communication and no surprises. The itinerary matched exactly what was promised."
                          },
                          {
                            name: "Samira H.",
                            from: "Hargeisa",
                            quote: "Loved the small-group feel. Great photo stops and a respectful cultural approach."
                          }
                        ].map((r) => (
                          <div key={r.name} className="border border-border/60 rounded-xl p-4 bg-background">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="font-semibold">{r.name}</div>
                                <div className="text-xs text-muted-foreground">{r.from}</div>
                              </div>
                              <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                Verified booking
                              </span>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground leading-relaxed">“{r.quote}”</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cancellation">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Cancellation policy</h2>
                      <div className="border border-border/60 rounded-xl p-4 bg-background">
                        <div className="text-sm text-muted-foreground leading-relaxed">{experience.cancellationPolicy}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        We show operator policies clearly. You’ll confirm the final terms in checkout before payment.
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>

              {linkedStay ? (
                <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Where you’ll stay</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Optional: add a partner stay to keep the trip effortless.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/stay?type=hotel")} className="hidden sm:inline-flex">
                      Browse stays
                    </Button>
                  </div>
                  <div className="mt-4">
                    <StayResultCard
                      stay={linkedStay as any}
                      variant="listing"
                      onView={() => {
                        const qs = new URLSearchParams()
                        qs.set("type", linkedStay.type)
                        qs.set("dest", linkedStay.location.city)
                        qs.set("checkIn", todayPlus(14))
                        qs.set("checkOut", todayPlus(21))
                        qs.set("adults", String(travelers.adults))
                        qs.set("children", String(travelers.children))
                        qs.set("guests", String(totalTravelers(travelers)))
                        qs.set("rooms", "1")
                        router.push(`/stay/${encodeURIComponent(linkedStay.id)}?${qs.toString()}`)
                      }}
                    />
                  </div>
                </section>
              ) : null}

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Meeting point</h2>
                <div className="mt-2 text-sm text-muted-foreground">
                  {experience.meetingPoint?.label ?? "Meeting point details will be shared after booking."}
                </div>
                <div className="mt-4 rounded-2xl border border-border/60 bg-muted/20 h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  Map placeholder (route / pin)
                </div>
              </section>
            </div>

            <div className="min-w-0">
              <ExperienceBookingCard
                experience={experience}
                date={date}
                travelers={travelers}
                onChangeDate={setDate}
                onChangeTravelers={setTravelers}
                onBook={onBook}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

