"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getMockTransportById } from "@/lib/mock-transport"
import type { TransportSearchTab } from "@/lib/transport-types"
import { saveBookingDraft, type TransportBookingDraft } from "@/lib/booking-storage"
import { useMediaQuery } from "@/lib/use-media-query"
import { TransportGallery } from "@/components/transport/details/TransportGallery"
import { BadgeCheck, CalendarClock, CheckCircle2, MapPin, ShieldCheck, Star, Users } from "lucide-react"

function asInt(input: string | null, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function safeTab(input: string | null): TransportSearchTab {
  return input === "rent_a_car" ? "rent_a_car" : "airport_pickup"
}

function diffDays(dtStart: string, dtEnd: string) {
  const a = new Date(dtStart)
  const b = new Date(dtEnd)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1
  const ms = b.getTime() - a.getTime()
  const days = Math.ceil(ms / 86400000)
  return Math.max(1, Math.min(30, days))
}

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function vehicleTypeLabel(v: string) {
  return v === "sedan" ? "Sedan" : v === "suv" ? "SUV" : v === "van" ? "Van" : "Luxury"
}

export default function TransportDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sp = useSearchParams()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = !isMobile && !isDesktop

  const id = params?.id ? decodeURIComponent(params.id) : ""
  const service = id ? getMockTransportById(id) : null

  const tab = safeTab(sp.get("tab"))
  const passengers = Math.max(1, asInt(sp.get("passengers"), 2))

  const pickupDateTime = sp.get("dt") ?? sp.get("pickupDt") ?? ""
  const rentalPickupDateTime = sp.get("pickupDt") ?? pickupDateTime
  const rentalReturnDateTime = sp.get("returnDt") ?? ""
  const days = service?.pricing.unit === "per_day" ? diffDays(rentalPickupDateTime || "", rentalReturnDateTime || "") : 1

  const [agree, setAgree] = useState(true)

  useEffect(() => {
    setAgree(true)
  }, [id])

  const pricing = useMemo(() => {
    if (!service) return { amount: 0, days: 1, fees: 0, total: 0 }
    const amount = service.pricing.amount
    const base = service.pricing.unit === "per_day" ? amount * days : amount
    const fees = Math.round(base * 0.1 * 100) / 100 // simple service fee placeholder
    const total = Math.max(0, base + fees)
    return { amount, days, fees, total }
  }, [service, days])

  const canContinue = Boolean(service && agree && pricing.total > 0)

  const onContinue = () => {
    if (!service) return
    if (!canContinue) return

    const draft: TransportBookingDraft = {
      version: 2,
      kind: "transport",
      createdAt: Date.now(),
      returnUrl: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/transport",
      transport: {
        serviceId: service.id,
        search: {
          tab,
          pickupAirport: null, // kept lightweight; details page doesn't need full object for Phase 1
          dropOffLocation: sp.get("dropoff") ?? "",
          pickupDateTime: pickupDateTime || "",
          passengers,
          rentalPickupLocation: sp.get("pickup") ?? "",
          rentalPickupDateTime: rentalPickupDateTime || "",
          rentalReturnDateTime: rentalReturnDateTime || "",
          carType: (sp.get("carType") as any) ?? "any",
          rentalDriverMode: (sp.get("driver") as any) ?? "either"
        },
        pricing: {
          amount: service.pricing.amount,
          unit: service.pricing.unit,
          days: service.pricing.unit === "per_day" ? days : undefined,
          fees: pricing.fees,
          total: pricing.total,
          currency: "USD"
        }
      }
    }
    saveBookingDraft(draft)
    router.push("/transport/checkout")
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4">
          <div className="max-w-3xl mx-auto clean-card p-6">
            <div className="text-lg font-semibold">Transport option not found</div>
            <div className="mt-2 text-sm text-muted-foreground">This listing is unavailable. Please go back to results.</div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => router.push("/transport")}>Back to Transport</Button>
              <Button variant="outline" onClick={() => router.push("/transport/search?tab=airport_pickup")}>
                Search
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const driverAvailable = service.driver && service.driverModes.includes("with_driver")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
          <TransportGallery serviceId={service.id} images={service.images} title={service.title} />

          {/* Tablet booking card (below gallery) */}
          {isTablet ? (
            <div className="mt-6">
              <BookingCard
                serviceTitle={service.title}
                unit={service.pricing.unit}
                passengers={passengers}
                pickupDateTime={pickupDateTime || rentalPickupDateTime}
                returnDateTime={service.pricing.unit === "per_day" ? rentalReturnDateTime : ""}
                pricing={pricing}
                agree={agree}
                onToggleAgree={setAgree}
                canContinue={canContinue}
                onContinue={onContinue}
                onEditSearch={() => router.push(`/transport/search?${sp.toString()}`)}
              />
            </div>
          ) : null}

          <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
            {/* Left */}
            <div className="min-w-0 space-y-6 md:space-y-8">
              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {service.provider.verified ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium">
                          <BadgeCheck className="h-4 w-4" />
                          Verified provider
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-muted-foreground text-xs font-medium">
                          Provider
                        </span>
                      )}
                      {service.freeCancellation ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-muted-foreground text-xs font-medium">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Free cancellation
                        </span>
                      ) : null}
                    </div>

                    <h1 className="mt-4 text-2xl font-bold tracking-tight">{service.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {service.kind === "airport_pickup" ? "Airport pickup" : "Car rental"}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Up to {service.capacity} passengers
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="inline-flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        {service.rating.score.toFixed(1)} ({service.rating.reviewsCount.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/transport/search?${sp.toString()}`)}>
                      Back to results
                    </Button>
                  </div>
                </div>
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Overview</h2>
                <OverviewText text={service.overview.description} />
                {service.overview.highlights?.length ? (
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    {service.overview.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Vehicle details</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Vehicle type" value={vehicleTypeLabel(service.vehicleType)} />
                  <InfoItem label="Capacity" value={`${service.capacity} passengers`} />
                  <InfoItem
                    label="Driver options"
                    value={
                      service.driverModes.includes("self_drive") && service.driverModes.includes("with_driver")
                        ? "Self-drive or with driver"
                        : service.driverModes.includes("with_driver")
                          ? "With driver"
                          : "Self-drive"
                    }
                  />
                  {service.kind === "car_rental" ? (
                    <>
                      <InfoItem label="Transmission" value={service.rental?.transmission === "manual" ? "Manual" : "Automatic"} />
                      <InfoItem label="Mileage" value={service.rental?.mileage === "unlimited" ? "Unlimited" : "Limited"} />
                    </>
                  ) : null}
                </div>
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">What’s included</h2>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  {service.whatsIncluded.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </section>

              {driverAvailable ? (
                <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                  <h2 className="text-lg font-semibold">Driver details</h2>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div>
                      Driver: <span className="text-foreground font-medium">{service.driver!.name}</span>{" "}
                      {service.driver!.verified ? (
                        <span className="ml-2 text-[11px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      Languages: <span className="text-foreground font-medium">{service.driver!.languages.join(", ")}</span>
                    </div>
                    <div className="mt-2">
                      Experience: <span className="text-foreground font-medium">{service.driver!.yearsExperience}+ years</span>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Pickup instructions</h2>
                <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.pickupInstructions}</div>
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Cancellation policy</h2>
                <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.cancellationPolicy}</div>
              </section>

              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Reviews</h2>
                <div className="mt-4 space-y-3">
                  {service.reviews.length ? (
                    service.reviews.slice(0, 6).map((r) => (
                      <div key={r.id} className="border border-border rounded-xl p-4 bg-background">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.dateISO}</div>
                          </div>
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-background text-xs">
                            <Star className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold">{r.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground leading-relaxed">“{r.comment}”</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No reviews yet.</div>
                  )}
                </div>
              </section>
            </div>

            {/* Desktop sticky booking card */}
            {isDesktop ? (
              <BookingCard
                serviceTitle={service.title}
                unit={service.pricing.unit}
                passengers={passengers}
                pickupDateTime={pickupDateTime || rentalPickupDateTime}
                returnDateTime={service.pricing.unit === "per_day" ? rentalReturnDateTime : ""}
                pricing={pricing}
                agree={agree}
                onToggleAgree={setAgree}
                canContinue={canContinue}
                onContinue={onContinue}
                onEditSearch={() => router.push(`/transport/search?${sp.toString()}`)}
              />
            ) : null}
          </div>
        </div>

        {/* Mobile bottom sticky CTA */}
        {isMobile ? (
          <div className="fixed left-0 right-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`/transport/search?${sp.toString()}`)}
                  aria-label="Edit search"
                >
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-semibold tabular-nums truncate">
                    {fmtMoney(pricing.total)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {service.pricing.unit === "per_day" ? `• ${days} day${days > 1 ? "s" : ""}` : "• per trip"}
                    </span>
                  </div>
                </button>
                <Button className="h-11 flex-1" disabled={!canContinue} onClick={onContinue}>
                  Continue
                </Button>
              </div>
              {!agree ? <div className="mt-2 text-xs text-muted-foreground">Accept the agreement to continue.</div> : null}
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-background">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  )
}

function OverviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const long = (text || "").length > 180
  return (
    <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
      <p className={expanded ? "" : "line-clamp-3"}>{text}</p>
      {long ? (
        <button
          type="button"
          className="mt-2 text-sm font-medium text-primary hover:underline underline-offset-4"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  )
}

function BookingCard({
  serviceTitle,
  unit,
  passengers,
  pickupDateTime,
  returnDateTime,
  pricing,
  agree,
  onToggleAgree,
  canContinue,
  onContinue,
  onEditSearch
}: {
  serviceTitle: string
  unit: "per_trip" | "per_day"
  passengers: number
  pickupDateTime: string
  returnDateTime: string
  pricing: { amount: number; days: number; fees: number; total: number }
  agree: boolean
  onToggleAgree: (v: boolean) => void
  canContinue: boolean
  onContinue: () => void
  onEditSearch: () => void
}) {
  return (
    <aside className="clean-card p-4 md:p-6 border border-border/60 bg-card lg:sticky lg:top-[calc(var(--sticky-stack-h,120px)+16px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Selected</div>
          <div className="font-semibold truncate">{serviceTitle}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onEditSearch}>
          Edit
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="border border-border rounded-xl p-4 bg-background">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Dates & time
              </div>
              <div className="mt-1 text-sm font-medium truncate">{pickupDateTime || "—"}</div>
              {unit === "per_day" ? (
                <div className="mt-1 text-xs text-muted-foreground truncate">Return {returnDateTime || "—"}</div>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs text-muted-foreground">Passengers</div>
              <div className="font-semibold tabular-nums">{passengers}</div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 bg-background">
          <div className="text-sm font-semibold">Price breakdown</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Base {unit === "per_day" ? `(${pricing.days} day${pricing.days > 1 ? "s" : ""})` : "(per trip)"}
              </span>
              <span className="font-medium tabular-nums">
                {fmtMoney(unit === "per_day" ? pricing.amount * pricing.days : pricing.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span className="font-medium tabular-nums">{fmtMoney(pricing.fees)}</span>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold tabular-nums">{fmtMoney(pricing.total)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure payment
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
              <CheckCircle2 className="h-3.5 w-3.5" /> Instant confirmation (mock)
            </span>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => onToggleAgree(e.target.checked)} />
          <span>
            I agree to the provider’s terms and cancellation policy. I confirm pickup details are accurate.
          </span>
        </label>

        <Button size="lg" className="w-full" disabled={!canContinue} onClick={onContinue}>
          Continue to checkout
        </Button>
        {!agree ? <div className="text-xs text-muted-foreground">You must accept the agreement to continue.</div> : null}
      </div>
    </aside>
  )
}

