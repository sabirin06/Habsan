"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getMockStayById } from "@/lib/mock-stays"
import type { Apartment, Hotel, StayType } from "@/lib/stay-types"
import { calcNights, clamp, isLongStay } from "@/lib/stay-utils"
import { Button } from "@/components/ui/button"
import { saveBookingDraft, type StayBookingDraft } from "@/lib/booking-storage"
import { Bath, BedDouble, Users } from "lucide-react"
import { useMediaQuery } from "@/lib/use-media-query"
import { StayGallery } from "@/components/stay/details/StayGallery"
import { PropertyHeader } from "@/components/stay/details/PropertyHeader"
import { RoomSelector } from "@/components/stay/details/RoomSelector"
import { StayBookingCard } from "@/components/stay/details/StayBookingCard"
import { BookingSummary } from "@/components/stay/details/BookingSummary"
import { AmenitiesSection } from "@/components/stay/details/AmenitiesSection"
import { PoliciesSection } from "@/components/stay/details/PoliciesSection"
import { ReviewsSection } from "@/components/stay/details/ReviewsSection"
import { LocationSection } from "@/components/stay/details/LocationSection"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function safeType(input: string | null): StayType {
  return input === "apartment" ? "apartment" : "hotel"
}

function asInt(input: string | null, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function totalGuests(adults: number, children: number) {
  return Math.max(1, Math.max(1, adults) + Math.max(0, children))
}

export default function StayDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sp = useSearchParams()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = !isMobile && !isDesktop

  const id = params?.id ? decodeURIComponent(params.id) : ""
  const stay = id ? getMockStayById(id) : undefined

  const typeFromUrl = safeType(sp.get("type"))
  const checkIn = sp.get("checkIn") ?? new Date().toISOString().slice(0, 10)
  const checkOut = sp.get("checkOut") ?? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  const adults = Math.max(1, asInt(sp.get("adults"), 2))
  const children = Math.max(0, asInt(sp.get("children"), 0))
  const guests = !sp.get("adults") && sp.get("guests") ? Math.max(1, asInt(sp.get("guests"), 2)) : totalGuests(adults, children)
  const rooms = Math.max(0, asInt(sp.get("rooms"), 1))
  const entirePlacePref = sp.get("entirePlace") === "1"

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [agreePolicies, setAgreePolicies] = useState(true)

  useEffect(() => {
    // reset room selection when navigating between stays
    setSelectedRoomId(null)
  }, [id])

  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut])
  const longStay = useMemo(() => isLongStay({ checkIn, checkOut }), [checkIn, checkOut])

  const effectiveType: StayType = stay?.type ?? typeFromUrl

  const pricing = useMemo(() => {
    if (!stay) {
      return { nights: 1, pricePerNight: 0, subtotal: 0, fees: 0, discount: 0, total: 0 }
    }

    const baseNightly =
      stay.type === "hotel"
        ? (() => {
            const h = stay as Hotel
            const room = selectedRoomId ? h.rooms.find((r) => r.id === selectedRoomId) : undefined
            return room?.pricePerNight ?? stay.pricePerNight
          })()
        : stay.pricePerNight

    const subtotal = baseNightly * nights
    const fees =
      stay.type === "apartment"
        ? Math.round(((stay as Apartment).cleaningFee + subtotal * 0.08) * 100) / 100 // cleaning + service
        : Math.round((subtotal * 0.12) * 100) / 100 // taxes placeholder

    const discount =
      stay.type === "apartment" && longStay && (stay as Apartment).longStayDiscountPct
        ? Math.round((subtotal * clamp((stay as Apartment).longStayDiscountPct! / 100, 0, 0.4)) * 100) / 100
        : 0

    const total = Math.max(0, subtotal + fees - discount)
    return { nights, pricePerNight: baseNightly, subtotal, fees, discount, total }
  }, [stay, nights, selectedRoomId, longStay])

  const canBook = useMemo(() => {
    if (!stay) return false
    if (!agreePolicies) return false
    if (stay.type === "hotel") return Boolean(selectedRoomId)
    return true
  }, [stay, selectedRoomId, agreePolicies])

  const onBook = () => {
    if (!stay) return
    if (!canBook) return

    const draft: StayBookingDraft = {
      version: 2,
      kind: "stay",
      createdAt: Date.now(),
      returnUrl: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/stay",
      stay: {
        type: stay.type,
        stayId: stay.id,
        roomId: stay.type === "hotel" ? (selectedRoomId ?? undefined) : undefined,
        search: {
          type: stay.type,
          destination: sp.get("dest") ?? stay.location.city,
          checkIn,
          checkOut,
          guests: { adults, children },
          rooms: stay.type === "hotel" ? rooms : Math.max(1, rooms || 1),
          entirePlace: stay.type === "apartment" ? Boolean(entirePlacePref) : false
        },
        pricing: {
          nights: pricing.nights,
          pricePerNight: pricing.pricePerNight,
          subtotal: pricing.subtotal,
          fees: pricing.fees,
          discount: pricing.discount,
          total: pricing.total,
          currency: "USD"
        }
      }
    }
    saveBookingDraft(draft)
    router.push("/checkout")
  }

  if (!stay) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4">
          <div className="max-w-3xl mx-auto clean-card p-6">
            <div className="text-lg font-semibold">Stay not found</div>
            <div className="mt-2 text-sm text-muted-foreground">
              This listing is unavailable. Please go back to search results.
            </div>
            <div className="mt-6">
              <Button onClick={() => router.push(`/stay?type=${effectiveType}`)}>Back to Stay</Button>
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
          <StayGallery stayId={stay.id} images={stay.images} title={stay.name} />

          {/* Tablet booking card (below gallery) */}
          {isTablet ? (
            <div className="mt-6">
              <BookingSummary
                stayType={stay.type}
                stay={stay as any}
                nights={nights}
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                guestsTotal={guests}
                rooms={rooms}
                pricing={pricing}
                agreePolicies={agreePolicies}
                onChangeAgreePolicies={setAgreePolicies}
                canBook={canBook}
                selectedRoomId={selectedRoomId}
                onBook={onBook}
                onEditSearch={() => router.push(`/stay/search?${sp.toString()}`)}
                variant="desktop"
              />
            </div>
          ) : null}

          <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
            {/* Left */}
            <div className="min-w-0 space-y-6 md:space-y-8">
              <PropertyHeader
                stay={stay as any}
                backHref={`/stay/search?${sp.toString()}`}
                onBack={() => router.push(`/stay/search?${sp.toString()}`)}
              />

              {/* Overview (with clamp + read more) */}
              <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                <h2 className="text-lg font-semibold">Overview</h2>
                <OverviewText
                  text={
                    stay.type === "hotel"
                      ? "A premium, comfortable hotel stay with modern amenities and responsive service. Great for business and leisure."
                      : (stay as Apartment).spaceDescription
                  }
                />
              </section>

              {stay.type === "hotel" ? (
                <>
                  <RoomSelector hotel={stay as Hotel} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
                  <PoliciesSection hotel={stay as Hotel} />
                </>
              ) : (
                <>
                  {(stay as Apartment).host?.name ? (
                    <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                      <h2 className="text-lg font-semibold">Host</h2>
                      <div className="mt-3 text-sm text-muted-foreground">
                        Hosted by <span className="text-foreground font-medium">{(stay as Apartment).host!.name}</span>
                        {(stay as Apartment).host!.badge ? (
                          <span className="ml-2 text-[11px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                            {(stay as Apartment).host!.badge}
                          </span>
                        ) : null}
                      </div>
                    </section>
                  ) : null}

                  <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                    <h2 className="text-lg font-semibold">House rules</h2>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {(stay as Apartment).houseRules.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="clean-card p-4 md:p-6 border border-border/60 bg-card">
                    <h2 className="text-lg font-semibold">Fees & long-stay pricing</h2>
                    <div className="mt-3 text-sm text-muted-foreground">
                      Cleaning fee: <span className="text-foreground font-medium">{fmtMoney((stay as Apartment).cleaningFee)}</span>
                      {longStay && (stay as Apartment).longStayDiscountPct ? (
                        <div className="mt-2">
                          Long-stay discount:{" "}
                          <span className="text-foreground font-medium">{(stay as Apartment).longStayDiscountPct}%</span> (applied at checkout)
                        </div>
                      ) : (
                        <div className="mt-2">Stay 7+ nights to unlock long-stay discounts on eligible listings.</div>
                      )}
                    </div>
                  </section>
                </>
              )}

              <AmenitiesSection stay={stay as any} />
              <ReviewsSection stay={stay as any} />
              <LocationSection stay={stay as any} />
            </div>

            {/* Desktop sticky booking card */}
            {isDesktop ? (
              <StayBookingCard
                stay={stay as any}
                stayType={stay.type}
                nights={nights}
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                guestsTotal={guests}
                rooms={rooms}
                pricing={pricing}
                agreePolicies={agreePolicies}
                onChangeAgreePolicies={setAgreePolicies}
                canBook={canBook}
                selectedRoomId={selectedRoomId}
                onBook={onBook}
                onEditSearch={() => router.push(`/stay/search?${sp.toString()}`)}
              />
            ) : null}
          </div>
        </div>

        {/* Mobile bottom sticky CTA only */}
        {isMobile ? (
          <div className="fixed left-0 right-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`/stay/search?${sp.toString()}`)}
                  aria-label="Edit search"
                >
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-semibold tabular-nums truncate">
                    {fmtMoney(pricing.total)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">• {nights} night{nights > 1 ? "s" : ""}</span>
                  </div>
                </button>
                <Button className="h-11 flex-1" disabled={!canBook} onClick={onBook}>
                  {stay.type === "hotel" ? (selectedRoomId ? "Reserve" : "Select room") : "Reserve"}
                </Button>
              </div>
              {!canBook && stay.type === "hotel" ? (
                <div className="mt-2 text-xs text-muted-foreground">Select a room to continue.</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
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

