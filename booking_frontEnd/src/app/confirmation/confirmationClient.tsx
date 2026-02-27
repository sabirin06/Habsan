"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadBookingReceipt, type BookingReceipt } from "@/lib/booking-storage"
import { getMockFlightById } from "@/lib/mock-flights"
import { getMockStayById } from "@/lib/mock-stays"
import { getMockExperienceById } from "@/lib/mock-experiences"
import { getMockTransportById } from "@/lib/mock-transport"

function Stepper({ kind }: { kind: "flight" | "stay" | "experience" | "transport" }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center justify-center h-6 px-2 rounded-full border text-xs font-medium bg-primary/10 border-primary/30 text-primary">
        {kind === "stay" ? "Stay" : kind === "experience" ? "Experience" : kind === "transport" ? "Transport" : "Flights"}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="inline-flex items-center justify-center h-6 px-2 rounded-full border text-xs font-medium bg-primary/10 border-primary/30 text-primary">
        {kind === "stay"
          ? "Guest Details & Payment"
          : kind === "experience"
            ? "Traveler Details & Payment"
            : kind === "transport"
              ? "Passenger Details & Payment"
              : "Passenger Details & Payment"}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="inline-flex items-center justify-center h-6 px-2 rounded-full border text-xs font-medium bg-background border-border text-foreground">
        Confirmation
      </span>
    </div>
  )
}

export default function ConfirmationClient({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null)

  useEffect(() => {
    if (!bookingId) return
    setReceipt(loadBookingReceipt(bookingId))
  }, [bookingId])

  const selectedFlights = useMemo(() => {
    if (!receipt || receipt.kind !== "flight") return []
    const ids = Object.entries(receipt.draft.selectedByLeg ?? {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v)
      .filter(Boolean) as string[]
    return ids.map((id) => getMockFlightById(id)).filter(Boolean)
  }, [receipt])

  const selectedStay = useMemo(() => {
    if (!receipt || receipt.kind !== "stay") return null
    return getMockStayById(receipt.draft.stay.stayId) ?? null
  }, [receipt])

  const selectedExperience = useMemo(() => {
    if (!receipt || receipt.kind !== "experience") return null
    return getMockExperienceById(receipt.draft.experience.experienceId) ?? null
  }, [receipt])

  const selectedTransport = useMemo(() => {
    if (!receipt || receipt.kind !== "transport") return null
    return getMockTransportById(receipt.draft.transport.serviceId) ?? null
  }, [receipt])

  if (!bookingId) {
    return (
      <main className="pt-20 px-4">
        <div className="max-w-3xl mx-auto clean-card p-6">
          <Stepper kind="flight" />
          <div className="mt-6 space-y-2">
            <div className="text-lg font-semibold">Missing booking ID</div>
            <div className="text-muted-foreground text-sm">Please return to checkout to complete payment.</div>
          </div>
          <div className="mt-6">
            <Button onClick={() => router.push("/checkout")}>Go to checkout</Button>
          </div>
        </div>
      </main>
    )
  }

  if (!receipt) {
    return (
      <main className="pt-20 px-4">
        <div className="max-w-3xl mx-auto clean-card p-6">
          <Stepper kind="flight" />
          <div className="mt-6 space-y-2">
            <div className="text-lg font-semibold">Booking not found</div>
            <div className="text-muted-foreground text-sm">This confirmation is unavailable. Please complete checkout again.</div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push("/checkout")}>Back to checkout</Button>
            <Button variant="outline" onClick={() => router.push("/flights")}>
              Back to flights
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const kind = receipt.kind

  return (
    <main className="pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="clean-card p-4 md:p-6">
          <Stepper kind={kind} />
          <div className="mt-6">
            <div className="text-2xl font-bold">
              {kind === "stay"
                ? "Your stay is confirmed"
                : kind === "experience"
                  ? "Your experience is confirmed"
                  : kind === "transport"
                    ? "Your transport is confirmed"
                    : "Your flight is confirmed"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Booking ID: <span className="font-mono text-foreground">{receipt.bookingId}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {kind === "stay" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Your stay</h2>
                <div className="mt-4 space-y-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{selectedStay?.name ?? "Selected stay"}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedStay ? `${selectedStay.location.city}, ${selectedStay.location.country}` : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {receipt.draft.stay.search.checkIn} → {receipt.draft.stay.search.checkOut} • {receipt.draft.stay.pricing.nights} night
                          {receipt.draft.stay.pricing.nights > 1 ? "s" : ""} •{" "}
                          {Math.max(
                            1,
                            (receipt.draft.stay.search.guests?.adults ?? 1) + (receipt.draft.stay.search.guests?.children ?? 0)
                          )}{" "}
                          guest
                          {Math.max(
                            1,
                            (receipt.draft.stay.search.guests?.adults ?? 1) + (receipt.draft.stay.search.guests?.children ?? 0)
                          ) > 1
                            ? "s"
                            : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-semibold">${receipt.totals.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : kind === "experience" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Your experience</h2>
                <div className="mt-4 space-y-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{selectedExperience?.title ?? "Selected experience"}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedExperience ? `${selectedExperience.location.city}, ${selectedExperience.location.country}` : "—"}
                        </div>
                        {receipt.kind === "experience" ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            Date {receipt.draft.experience.date} • {receipt.totals.travelers} traveler{receipt.totals.travelers > 1 ? "s" : ""} • $
                            {receipt.totals.pricePerPerson}/person
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-semibold">${receipt.totals.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : kind === "transport" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Your ride</h2>
                <div className="mt-4 space-y-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{selectedTransport?.title ?? "Selected transport"}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTransport ? `${selectedTransport.kind === "airport_pickup" ? "Airport pickup" : "Car rental"} • ${selectedTransport.provider.name}` : "—"}
                        </div>
                        {receipt.kind === "transport" ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            {receipt.draft.transport.search.passengers} passenger
                            {receipt.draft.transport.search.passengers > 1 ? "s" : ""} •{" "}
                            {receipt.draft.transport.pricing.unit === "per_day"
                              ? `${receipt.draft.transport.pricing.days ?? 1} day(s)`
                              : "One-way trip"}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-semibold">${receipt.totals.total}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Itinerary</h2>
                <div className="mt-4 space-y-3">
                  {receipt.kind === "flight"
                    ? receipt.draft.legs.map((leg, idx) => {
                        const flightId = receipt.draft.selectedByLeg[idx]
                        const flight = flightId ? getMockFlightById(flightId) : undefined
                        return (
                          <div key={idx} className="border border-border rounded-xl p-4 bg-background">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="font-medium">
                                  {leg.label}: {leg.from} → {leg.to}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {flight ? `${flight.airline} ${flight.flightNumber} • ${flight.duration}` : "—"}
                                </div>
                                {flight ? (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {flight.departure.time} {flight.departure.code} → {flight.arrival.time} {flight.arrival.code}
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Per traveler</div>
                                <div className="font-semibold">${flight?.price ?? "—"}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    : null}
                </div>
              </div>
            )}

            {kind === "stay" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Guests</h2>
                <div className="mt-4 space-y-2">
                  {receipt.kind === "stay"
                    ? receipt.guests.map((g, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 border border-border rounded-xl p-3 bg-background"
                        >
                          <div className="font-medium">
                            {g.firstName} {g.lastName}
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            ) : kind === "experience" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Travelers</h2>
                <div className="mt-4 space-y-2">
                  {receipt.kind === "experience"
                    ? receipt.travelers.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 border border-border rounded-xl p-3 bg-background"
                        >
                          <div>
                            <div className="font-medium">
                              {t.firstName} {t.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">DOB {t.dateOfBirth}</div>
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            ) : kind === "transport" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Passengers</h2>
                <div className="mt-4 space-y-2">
                  {receipt.kind === "transport"
                    ? receipt.passengers.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 border border-border rounded-xl p-3 bg-background">
                          <div className="font-medium">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{p.phone ?? ""}</div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            ) : (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Passengers</h2>
                <div className="mt-4 space-y-2">
                  {receipt.kind === "flight"
                    ? receipt.passengers.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 border border-border rounded-xl p-3 bg-background"
                        >
                          <div>
                            <div className="font-medium">
                              {p.firstName} {p.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {p.type.toUpperCase()} • DOB {p.dateOfBirth}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{p.passportNumber}</div>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            )}

            {kind === "stay" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Property contact</h2>
                <div className="mt-3 text-sm text-muted-foreground">
                  For changes or cancellations, contact the property. (Placeholder contact details.)
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="font-medium">{selectedStay?.name ?? "Property"}</div>
                    <div className="text-sm text-muted-foreground">Phone: +1 000 000 0000</div>
                    <div className="text-sm text-muted-foreground">Email: support@property.example</div>
                  </div>
                </div>
              </div>
            ) : kind === "experience" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Operator contact</h2>
                <div className="mt-3 text-sm text-muted-foreground">
                  For changes or cancellations, contact the tour operator. (Placeholder contact details.)
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="font-medium">{selectedExperience?.operator.name ?? "Operator"}</div>
                    <div className="text-sm text-muted-foreground">Phone: +1 000 000 0000</div>
                    <div className="text-sm text-muted-foreground">Email: support@operator.example</div>
                  </div>
                </div>
              </div>
            ) : kind === "transport" ? (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Driver contact</h2>
                <div className="mt-3 text-sm text-muted-foreground">
                  For pickup coordination, contact your driver. (Placeholder contact details if not available.)
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="font-medium">{selectedTransport?.driver?.name ?? "Assigned driver"}</div>
                    <div className="text-sm text-muted-foreground">Phone: {selectedTransport?.driver?.phone ?? "+1 000 000 0000"}</div>
                    <div className="text-sm text-muted-foreground">WhatsApp: {selectedTransport?.driver?.whatsapp ?? "+1 000 000 0000"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Airline contact</h2>
                <div className="mt-3 text-sm text-muted-foreground">
                  For changes or cancellations, contact the operating airline. (Placeholder contact details.)
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFlights.slice(0, 2).map((f) => (
                    <div key={f!.id} className="border border-border rounded-xl p-4 bg-background">
                      <div className="font-medium">{f!.airline}</div>
                      <div className="text-sm text-muted-foreground">Phone: +1 000 000 0000</div>
                      <div className="text-sm text-muted-foreground">
                        Email: support@{f!.airline.toLowerCase().replace(/\s+/g, "")}.example
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="clean-card p-4 md:p-6 lg:sticky lg:top-[calc(var(--sticky-stack-h,120px)+16px)]">
              <h2 className="text-lg font-semibold">Payment summary</h2>
              {kind === "stay" && receipt.kind === "stay" ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per night</span>
                    <span className="font-medium">${receipt.totals.pricePerNight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="font-medium">{receipt.totals.nights}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">${receipt.totals.fees}</span>
                  </div>
                  {receipt.totals.discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-primary">-${receipt.totals.discount}</span>
                    </div>
                  ) : null}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total paid</span>
                    <span className="font-semibold">${receipt.totals.total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid via {receipt.payment.method === "card" ? `Card •••• ${receipt.payment.last4 ?? "----"}` : "Mobile money"}.
                  </div>
                </div>
              ) : kind === "experience" && receipt.kind === "experience" ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per person</span>
                    <span className="font-medium">${receipt.totals.pricePerPerson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Travelers</span>
                    <span className="font-medium">{receipt.totals.travelers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">${receipt.totals.fees}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total paid</span>
                    <span className="font-semibold">${receipt.totals.total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid via {receipt.payment.method === "card" ? `Card •••• ${receipt.payment.last4 ?? "----"}` : "Mobile money"}.
                  </div>
                </div>
              ) : kind === "transport" && receipt.kind === "transport" ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Base {receipt.totals.unit === "per_day" ? `(${receipt.totals.days ?? 1} day(s))` : "(per trip)"}
                    </span>
                    <span className="font-medium tabular-nums">${receipt.totals.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium tabular-nums">${receipt.totals.fees}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total paid</span>
                    <span className="font-semibold tabular-nums">${receipt.totals.total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid via {receipt.payment.method === "card" ? `Card •••• ${receipt.payment.last4 ?? "----"}` : "Mobile money"}.
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm">
                  {receipt.kind === "flight" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Per traveler</span>
                        <span className="font-medium">${receipt.totals.perTraveler}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Travelers</span>
                        <span className="font-medium">{receipt.totals.travelers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Extras</span>
                        <span className="font-medium">${receipt.totals.extrasTotal}</span>
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="font-semibold">Total paid</span>
                        <span className="font-semibold">${receipt.totals.total}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paid via {receipt.payment.method === "card" ? `Card •••• ${receipt.payment.last4 ?? "----"}` : "Mobile money"}.
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              <div className="mt-5 space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  Download ticket (PDF placeholder)
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  Email confirmation (placeholder)
                </Button>
                <Button className="w-full" onClick={() => router.push("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

