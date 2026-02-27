"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  loadBookingDraft,
  saveBookingReceipt,
  type BookingDraft,
  type BookingReceipt,
  type ExperienceBookingDraft,
  type FlightBookingDraft,
  type StayBookingDraft
} from "@/lib/booking-storage"
import { getMockFlightById } from "@/lib/mock-flights"
import { priceBreakdown } from "@/lib/flight-utils"
import { createAccountEmail, loadAuth, signInEmail, signOut, upsertTraveler, type AuthState, type TravelerProfile } from "@/lib/auth-storage"
import { CheckCircle2, ShieldCheck, BadgeCheck, Luggage, Utensils, Armchair, ChevronDown, ChevronUp, Lock } from "lucide-react"
import { useMediaQuery } from "@/lib/use-media-query"
import { getMockStayById } from "@/lib/mock-stays"
import { getMockExperienceById } from "@/lib/mock-experiences"

type PassengerType = "adult" | "child" | "infant"

type Passenger = {
  id: string
  type: PassengerType
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  passportExpiry: string
  gender?: string
  frequentFlyer?: string
}

type BookingKind = "flight" | "stay" | "experience"

type Guest = {
  id: string
  firstName: string
  lastName: string
}

type ExperienceTraveler = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

function isFlightDraft(d: BookingDraft | null): d is FlightBookingDraft {
  return Boolean(d && d.kind === "flight")
}

function isStayDraft(d: BookingDraft | null): d is StayBookingDraft {
  return Boolean(d && d.kind === "stay")
}

function isExperienceDraft(d: BookingDraft | null): d is ExperienceBookingDraft {
  return Boolean(d && d.kind === "experience")
}

function Stepper({ active, kind }: { active: "checkout" | "confirmation"; kind: BookingKind }) {
  const steps =
    kind === "stay"
      ? [
          { key: "stay", label: "Stay", state: "done" as const },
          {
            key: "checkout",
            label: "Guest Details & Payment",
            state: active === "checkout" ? "active" : ("upcoming" as const)
          },
          {
            key: "confirmation",
            label: "Confirmation",
            state: active === "confirmation" ? "active" : ("upcoming" as const)
          }
        ]
      : kind === "experience"
        ? [
            { key: "experiences", label: "Experience", state: "done" as const },
            {
              key: "checkout",
              label: "Traveler Details & Payment",
              state: active === "checkout" ? "active" : ("upcoming" as const)
            },
            {
              key: "confirmation",
              label: "Confirmation",
              state: active === "confirmation" ? "active" : ("upcoming" as const)
            }
          ]
        : [
          { key: "flights", label: "Flights", state: "done" as const },
          {
            key: "checkout",
            label: "Passenger Details & Payment",
            state: active === "checkout" ? "active" : ("upcoming" as const)
          },
          {
            key: "confirmation",
            label: "Confirmation",
            state: active === "confirmation" ? "active" : ("upcoming" as const)
          }
        ]

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center justify-center h-6 px-2 rounded-full border text-xs font-medium",
                s.state === "done" ? "bg-primary/10 border-primary/30 text-primary" : "",
                s.state === "active" ? "bg-background border-border text-foreground" : "",
                s.state === "upcoming" ? "bg-muted/40 border-border text-muted-foreground" : ""
              ].join(" ")}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 ? <span className="text-muted-foreground">→</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function newPassenger(id: string, type: PassengerType): Passenger {
  return {
    id,
    type,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    gender: "",
    frequentFlyer: ""
  }
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function calcAgeYears(dobISO: string): number | null {
  if (!dobISO) return null
  const d = new Date(dobISO)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

function passengerLabel(type: PassengerType) {
  return type === "adult" ? "Adult" : type === "child" ? "Child" : "Infant"
}

export default function CheckoutPage() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [flightSummaryOpen, setFlightSummaryOpen] = useState(true)
  const [staySummaryOpen, setStaySummaryOpen] = useState(true)
  const [experienceSummaryOpen, setExperienceSummaryOpen] = useState(true)

  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const [extras, setExtras] = useState({ baggage: false, meals: false, seatSelection: false })
  const [specialRequests, setSpecialRequests] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [isPaying, setIsPaying] = useState(false)

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [guestsList, setGuestsList] = useState<Guest[]>([])
  const [experienceTravelersList, setExperienceTravelersList] = useState<ExperienceTraveler[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [activePassengerId, setActivePassengerId] = useState<string | null>(null)
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null)
  const [activeExperienceTravelerId, setActiveExperienceTravelerId] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<"auth" | "itinerary" | "passengers" | "contact" | "addons" | "payment">(
    "auth"
  )

  const [auth, setAuth] = useState<AuthState>({ version: 1, isLoggedIn: false, travelers: [] })
  const [authMode, setAuthMode] = useState<"none" | "guest" | "signin" | "signup">("none")
  const [authEmail, setAuthEmail] = useState("")
  const [authPhone, setAuthPhone] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [selectedTravelerByPassengerId, setSelectedTravelerByPassengerId] = useState<Record<string, string | "">>({})

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const payBtnRef = useRef<HTMLButtonElement | null>(null)

  const kind: BookingKind = draft?.kind === "stay" ? "stay" : draft?.kind === "experience" ? "experience" : "flight"

  useEffect(() => {
    const d = loadBookingDraft()
    setDraft(d)
    setAuth(loadAuth())

    if (isFlightDraft(d)) {
      const pax = d?.searchData?.passengers
      const adults = Math.max(1, pax?.adults ?? 1)
      const children = pax?.childrenAges?.length ?? 0
      const infants = pax?.infants ?? 0

      const list: Passenger[] = []
      let n = 1
      for (let i = 0; i < adults; i++) list.push(newPassenger(`p${n++}`, "adult"))
      for (let i = 0; i < children; i++) list.push(newPassenger(`p${n++}`, "child"))
      for (let i = 0; i < infants; i++) list.push(newPassenger(`p${n++}`, "infant"))
      setPassengers(list)
      setActivePassengerId(list[0]?.id ?? null)
      setGuestsList([])
      setActiveGuestId(null)
    } else if (isStayDraft(d)) {
      const count = Math.max(1, (d.stay.search.guests?.adults ?? 1) + (d.stay.search.guests?.children ?? 0))
      const list: Guest[] = Array.from({ length: count }).map((_, idx) => ({
        id: `g${idx + 1}`,
        firstName: "",
        lastName: ""
      }))
      setGuestsList(list)
      setActiveGuestId(list[0]?.id ?? null)
      setPassengers([])
      setActivePassengerId(null)
      setExperienceTravelersList([])
      setActiveExperienceTravelerId(null)
    } else if (isExperienceDraft(d)) {
      const count = Math.max(1, (d.experience.travelers?.adults ?? 1) + (d.experience.travelers?.children ?? 0))
      const list: ExperienceTraveler[] = Array.from({ length: count }).map((_, idx) => ({
        id: `t${idx + 1}`,
        firstName: "",
        lastName: "",
        dateOfBirth: ""
      }))
      setExperienceTravelersList(list)
      setActiveExperienceTravelerId(list[0]?.id ?? null)
      setPassengers([])
      setActivePassengerId(null)
      setGuestsList([])
      setActiveGuestId(null)
    }
  }, [])

  // When signed in, softly auto-fill contact and primary traveler/guest.
  useEffect(() => {
    if (!auth.isLoggedIn) return
    if (auth.email && !contactEmail) setContactEmail(auth.email)
    if (auth.phone && !contactPhone) setContactPhone(auth.phone)

    const preferred = auth.travelers[0]
    if (!preferred) return

    if (kind === "flight") {
      const firstAdult = passengers.find((p) => p.type === "adult")
      if (!firstAdult) return
      setPassengers((arr) =>
        arr.map((p) =>
          p.id !== firstAdult.id
            ? p
            : {
                ...p,
                firstName: p.firstName || preferred.firstName,
                lastName: p.lastName || preferred.lastName,
                dateOfBirth: p.dateOfBirth || preferred.dateOfBirth,
                nationality: p.nationality || preferred.nationality,
                passportNumber: p.passportNumber || preferred.passportNumber,
                passportExpiry: p.passportExpiry || preferred.passportExpiry,
                gender: p.gender || preferred.gender,
                frequentFlyer: p.frequentFlyer || preferred.frequentFlyer
              }
        )
      )
      return
    }

    if (kind === "stay") {
      const firstGuest = guestsList[0]
      if (!firstGuest) return
      setGuestsList((arr) =>
        arr.map((g) =>
          g.id !== firstGuest.id
            ? g
            : {
                ...g,
                firstName: g.firstName || preferred.firstName,
                lastName: g.lastName || preferred.lastName
              }
        )
      )
      return
    }

    const firstTraveler = experienceTravelersList[0]
    if (!firstTraveler) return
    setExperienceTravelersList((arr) =>
      arr.map((t) =>
        t.id !== firstTraveler.id
          ? t
          : {
              ...t,
              firstName: t.firstName || preferred.firstName,
              lastName: t.lastName || preferred.lastName,
              dateOfBirth: t.dateOfBirth || preferred.dateOfBirth
            }
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLoggedIn, kind])

  const accountRequired = true

  const selectedFlights = useMemo(() => {
    if (!isFlightDraft(draft)) return []
    const ids = Object.entries(draft.selectedByLeg ?? {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v)
      .filter(Boolean) as string[]
    return ids.map((id) => getMockFlightById(id)).filter(Boolean)
  }, [draft])

  const selectedStay = useMemo(() => {
    if (!isStayDraft(draft)) return null
    return getMockStayById(draft.stay.stayId) ?? null
  }, [draft])

  const selectedExperience = useMemo(() => {
    if (!isExperienceDraft(draft)) return null
    return getMockExperienceById(draft.experience.experienceId) ?? null
  }, [draft])

  const travelers = useMemo(() => {
    if (kind === "stay") return guestsList.length || 1
    if (kind === "experience") return experienceTravelersList.length || 1
    // For now treat all passengers as travelers for totals; infants pricing differences can be added later.
    return passengers.length || 1
  }, [passengers.length, guestsList.length, experienceTravelersList.length, kind])

  const perTraveler = useMemo(() => {
    if (kind === "stay") return 0
    if (kind === "experience") return isExperienceDraft(draft) ? draft.experience.pricing.pricePerPerson : 0
    // For round-trip/multi-city, per-traveler price is sum of selected legs.
    const sum = selectedFlights.reduce((acc, f) => acc + (f?.price ?? 0), 0)
    return sum || 0
  }, [selectedFlights, kind, draft])

  const extrasTotal = useMemo(() => {
    if (kind !== "flight") return 0
    // simple, transparent pricing for now
    const bag = extras.baggage ? 30 * travelers : 0
    const meals = extras.meals ? 15 * travelers : 0
    const seats = extras.seatSelection ? 10 * travelers : 0
    return bag + meals + seats
  }, [extras, travelers, kind])

  const total = useMemo(() => {
    if (kind === "stay") {
      return isStayDraft(draft) ? draft.stay.pricing.total : 0
    }
    if (kind === "experience") {
      return isExperienceDraft(draft) ? draft.experience.pricing.total : 0
    }
    return perTraveler * travelers + extrasTotal
  }, [perTraveler, travelers, extrasTotal, kind, draft])

  const breakdown = useMemo(() => priceBreakdown(perTraveler), [perTraveler])
  const hasFreeCancellation = useMemo(() => {
    if (kind === "stay") {
      // placeholder; can be enriched when stay policies are modeled
      return false
    }
    if (kind === "experience") {
      const policy = (selectedExperience?.cancellationPolicy ?? "").toLowerCase()
      return policy.includes("free cancellation")
    }
    return selectedFlights.some((f) => (f?.cancellation ?? "").toLowerCase().includes("free"))
  }, [selectedFlights, kind, selectedExperience])

  const errors = useMemo(() => {
    const e: Record<string, string> = {}

    if (!isEmail(contactEmail)) e.contactEmail = "Enter a valid email."
    if (contactPhone.trim().length < 7) e.contactPhone = "Enter a valid phone number."

    if (kind === "stay") {
      guestsList.forEach((g) => {
        const base = `g.${g.id}`
        if (!g.firstName.trim()) e[`${base}.firstName`] = "Required."
        if (!g.lastName.trim()) e[`${base}.lastName`] = "Required."
      })
    } else if (kind === "experience") {
      experienceTravelersList.forEach((t) => {
        const base = `t.${t.id}`
        if (!t.firstName.trim()) e[`${base}.firstName`] = "Required."
        if (!t.lastName.trim()) e[`${base}.lastName`] = "Required."
        if (!t.dateOfBirth) e[`${base}.dob`] = "Date of birth required."
      })
    } else {
      passengers.forEach((p) => {
        const base = `p.${p.id}`
        if (!p.firstName.trim()) e[`${base}.firstName`] = "Required."
        if (!p.lastName.trim()) e[`${base}.lastName`] = "Required."
        if (!p.dateOfBirth) e[`${base}.dob`] = "Date of birth required."
        const age = calcAgeYears(p.dateOfBirth)
        if (p.type === "child") {
          if (age === null) {
            // covered by dob error
          } else if (age < 2 || age > 17) {
            e[`${base}.dob`] = "Child age must be 2–17."
          }
        }
        if (p.type === "infant") {
          if (age === null) {
            // covered by dob error
          } else if (age < 0 || age > 1) {
            e[`${base}.dob`] = "Infant age must be 0–1."
          }
        }
        if (!p.nationality.trim()) e[`${base}.nationality`] = "Required."
        if (!p.passportNumber.trim()) e[`${base}.passportNumber`] = "Required."
        if (!p.passportExpiry) e[`${base}.passportExpiry`] = "Required."
      })
    }

    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "")
      if (digits.length < 12) e.cardNumber = "Enter a valid card number."
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) e.cardExpiry = "Use MM/YY."
      if (cardCvc.replace(/\D/g, "").length < 3) e.cardCvc = "Enter a valid CVC."
    }

    return e
  }, [
    contactEmail,
    contactPhone,
    kind,
    guestsList,
    experienceTravelersList,
    passengers,
    paymentMethod,
    cardNumber,
    cardExpiry,
    cardCvc,
    accountRequired,
    auth.isLoggedIn
  ])

  const isValid =
    Object.keys(errors).length === 0 &&
    (kind === "stay" || kind === "experience" ? total > 0 : perTraveler > 0)
  const canReview = isValid
  const canPay = isValid && (!accountRequired || auth.isLoggedIn)

  const backToSearch = () => {
    const fallback =
      kind === "stay"
        ? `/stay?type=${isStayDraft(draft) ? draft.stay.type : "hotel"}`
        : kind === "experience"
          ? "/experiences"
          : "/flights"
    const url = draft?.returnUrl ?? fallback
    router.push(url)
  }

  const onPay = async () => {
    setTouched((t) => ({ ...t, all: true }))
    if (!canReview) {
      setOpenSection("passengers")
      return
    }

    // Review step first.
    setReviewConfirmed(false)
    setReviewOpen(true)
    return
  }

  const onConfirmAndPay = async () => {
    if (!reviewConfirmed) return
    if (!canPay) return

    setIsPaying(true)
    try {
      // simulate payment latency
      await new Promise((r) => setTimeout(r, 900))
      const bookingId = `BKG-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString().slice(-4)}`
      let receipt: BookingReceipt

      if (kind === "stay" && isStayDraft(draft)) {
        const totals = draft.stay.pricing
        receipt = {
          version: 2,
          kind: "stay",
          bookingId,
          createdAt: Date.now(),
          draft,
          guests: guestsList.map((g) => ({ firstName: g.firstName, lastName: g.lastName })),
          contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
          payment:
            paymentMethod === "card"
              ? { method: "card", last4: cardNumber.replace(/\D/g, "").slice(-4) }
              : { method: "mobile_money" },
          totals: {
            nights: totals.nights,
            pricePerNight: totals.pricePerNight,
            fees: totals.fees,
            discount: totals.discount,
            total: totals.total,
            currency: totals.currency
          }
        }
      } else if (kind === "experience" && isExperienceDraft(draft)) {
        const totals = draft.experience.pricing
        receipt = {
          version: 2,
          kind: "experience",
          bookingId,
          createdAt: Date.now(),
          draft,
          travelers: experienceTravelersList.map((t) => ({ firstName: t.firstName, lastName: t.lastName, dateOfBirth: t.dateOfBirth })),
          contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
          payment:
            paymentMethod === "card"
              ? { method: "card", last4: cardNumber.replace(/\D/g, "").slice(-4) }
              : { method: "mobile_money" },
          totals: {
            pricePerPerson: totals.pricePerPerson,
            travelers: totals.travelers,
            fees: totals.fees,
            total: totals.total,
            currency: totals.currency
          }
        }
      } else {
        if (!isFlightDraft(draft)) return
        receipt = {
          version: 2,
          kind: "flight",
          bookingId,
          createdAt: Date.now(),
          draft,
          passengers: passengers.map((p) => ({
            type: p.type,
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
            nationality: p.nationality,
            passportNumber: p.passportNumber,
            passportExpiry: p.passportExpiry,
            gender: p.gender || undefined,
            frequentFlyer: p.frequentFlyer || undefined
          })),
          contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
          extras,
          payment:
            paymentMethod === "card"
              ? { method: "card", last4: cardNumber.replace(/\D/g, "").slice(-4) }
              : { method: "mobile_money" },
          totals: { perTraveler, travelers, extrasTotal, total }
        }

        // Save frequent traveler profile for the first adult if logged in.
        if (auth.isLoggedIn) {
          const firstAdult = passengers.find((p) => p.type === "adult")
          if (firstAdult) {
            const profile: TravelerProfile = {
              id: "traveler:adult1",
              label: `${firstAdult.firstName || "Traveler"} ${firstAdult.lastName || ""}`.trim() || "Primary traveler",
              firstName: firstAdult.firstName,
              lastName: firstAdult.lastName,
              dateOfBirth: firstAdult.dateOfBirth,
              nationality: firstAdult.nationality,
              passportNumber: firstAdult.passportNumber,
              passportExpiry: firstAdult.passportExpiry,
              gender: firstAdult.gender || undefined,
              frequentFlyer: firstAdult.frequentFlyer || undefined
            }
            upsertTraveler(profile)
            setAuth(loadAuth())
          }
        }
      }

      saveBookingReceipt(receipt)
      router.push(`/confirmation?bookingId=${encodeURIComponent(bookingId)}`)
    } finally {
      setIsPaying(false)
    }
  }

  if (!draft) {
    return (
      <main className="pt-20 px-4">
        <div className="max-w-3xl mx-auto clean-card p-6">
          <Stepper active="checkout" kind="flight" />
          <div className="mt-6 space-y-2">
            <div className="text-lg font-semibold">No itinerary selected</div>
            <div className="text-muted-foreground text-sm">Go back to flights to pick an itinerary first.</div>
          </div>
          <div className="mt-6">
            <Button onClick={() => router.push("/flights")}>Back to flights</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="clean-card p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Stepper active="checkout" kind={kind} />
            <Button variant="outline" onClick={backToSearch}>
              {kind === "stay" ? "Back to stay" : kind === "experience" ? "Back to experiences" : "Back to flights"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: forms */}
          <div className="space-y-6">
            {/* Authentication */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "auth" ? (isMobile ? "passengers" : "auth") : "auth"))}
                aria-expanded={openSection === "auth"}
              >
                <div className="text-left">
                  <div className="font-semibold">Sign in (recommended)</div>
                  <div className="text-sm text-muted-foreground">
                    {auth.isLoggedIn
                      ? `Using saved account details • ${auth.email ?? "Signed in"}`
                      : "Auto-fill traveler details and keep tickets & receipts in one place."}
                  </div>
                </div>
                <span className="text-muted-foreground">{openSection === "auth" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "auth" || !isMobile ? (
                <div className="mt-4">
                  {auth.isLoggedIn ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm">
                        <div className="font-medium">Signed in</div>
                        <div className="text-muted-foreground">{auth.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut()
                            setAuth(loadAuth())
                            setAuthMode("guest")
                          }}
                        >
                          Sign out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant={authMode === "guest" ? "default" : "outline"} onClick={() => setAuthMode("guest")}>
                          Continue as Guest
                        </Button>
                        <Button variant={authMode === "signin" ? "default" : "outline"} onClick={() => setAuthMode("signin")}>
                          Sign In
                        </Button>
                        <Button variant={authMode === "signup" ? "default" : "outline"} onClick={() => setAuthMode("signup")}>
                          Create Account
                        </Button>
                        <Button variant="outline" disabled title="Google signup coming soon">
                          Continue with Google (soon)
                        </Button>
                      </div>

                      {authMode === "guest" ? (
                        <div className="border border-border rounded-xl p-4 bg-muted/20">
                          <div className="flex items-start gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Guest checkout is available up to review</div>
                              <div className="text-muted-foreground">
                                You’ll need to create an account before payment so we can deliver tickets and receipts securely.
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {authMode === "signin" ? (
                        <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-sm font-medium">Email</span>
                              <input className="clean-input w-full" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                            </label>
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-sm font-medium">Password</span>
                              <input
                                className="clean-input w-full"
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                signInEmail(authEmail)
                                setAuth(loadAuth())
                                setAuthMode("none")
                                setOpenSection("passengers")
                              }}
                              disabled={!isEmail(authEmail)}
                            >
                              Sign in
                            </Button>
                            <Button variant="outline" onClick={() => setAuthMode("none")}>
                              Cancel
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">Magic links and SSO can be added later.</div>
                        </div>
                      ) : null}

                      {authMode === "signup" ? (
                        <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-sm font-medium">Email</span>
                              <input className="clean-input w-full" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                            </label>
                            <label className="space-y-1">
                              <span className="text-sm font-medium">Phone (optional)</span>
                              <input className="clean-input w-full" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} />
                            </label>
                            <label className="space-y-1">
                              <span className="text-sm font-medium">Password</span>
                              <input
                                className="clean-input w-full"
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                createAccountEmail(authEmail, authPhone)
                                setAuth(loadAuth())
                                setAuthMode("none")
                                setOpenSection("passengers")
                              }}
                              disabled={!isEmail(authEmail)}
                            >
                              Create account
                            </Button>
                            <Button variant="outline" onClick={() => setAuthMode("none")}>
                              Cancel
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Creating an account helps us send tickets, receipts, and manage changes later.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Selected booking summary */}
            {kind === "stay" ? (
              <div className="clean-card p-4 md:p-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3"
                  onClick={() => setStaySummaryOpen((v) => !v)}
                  aria-expanded={staySummaryOpen}
                >
                  <div className="text-left">
                    <div className="font-semibold">Your selected stay</div>
                    <div className="text-sm text-muted-foreground">
                      {(isStayDraft(draft) ? draft.stay.pricing.nights : 1)} night
                      {(isStayDraft(draft) && draft.stay.pricing.nights > 1) ? "s" : ""} •{" "}
                      {isStayDraft(draft) ? `$${draft.stay.pricing.pricePerNight}/night` : ""}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{staySummaryOpen ? "Hide" : "Show"}</span>
                </button>

                {staySummaryOpen ? (
                  <div className="mt-4 space-y-3">
                    <div className="border border-border rounded-xl p-4 bg-background">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{selectedStay?.name ?? "Selected stay"}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedStay ? `${selectedStay.location.city}, ${selectedStay.location.country}` : "—"}
                          </div>
                          {isStayDraft(draft) ? (
                            <div className="text-xs text-muted-foreground mt-1">
                              {draft.stay.search.checkIn} → {draft.stay.search.checkOut} •{" "}
                              {Math.max(1, (draft.stay.search.guests?.adults ?? 1) + (draft.stay.search.guests?.children ?? 0))} guest
                              {Math.max(1, (draft.stay.search.guests?.adults ?? 1) + (draft.stay.search.guests?.children ?? 0)) > 1 ? "s" : ""}
                              {draft.stay.type === "hotel" ? ` • ${Math.max(1, draft.stay.search.rooms || 1)} room(s)` : null}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="font-semibold tabular-nums">${total}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : kind === "experience" ? (
              <div className="clean-card p-4 md:p-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3"
                  onClick={() => setExperienceSummaryOpen((v) => !v)}
                  aria-expanded={experienceSummaryOpen}
                >
                  <div className="text-left">
                    <div className="font-semibold">Your selected experience</div>
                    <div className="text-sm text-muted-foreground">
                      {isExperienceDraft(draft) ? `${draft.experience.pricing.travelers} traveler${draft.experience.pricing.travelers > 1 ? "s" : ""}` : ""}{" "}
                      {isExperienceDraft(draft) ? `• $${draft.experience.pricing.pricePerPerson}/person` : ""}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{experienceSummaryOpen ? "Hide" : "Show"}</span>
                </button>

                {experienceSummaryOpen ? (
                  <div className="mt-4 space-y-3">
                    <div className="border border-border rounded-xl p-4 bg-background">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{selectedExperience?.title ?? "Selected experience"}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedExperience ? `${selectedExperience.location.city}, ${selectedExperience.location.country}` : "—"}
                          </div>
                          {isExperienceDraft(draft) ? (
                            <div className="text-xs text-muted-foreground mt-1">
                              Date {draft.experience.date || "—"} • {draft.experience.travelers.adults} adult
                              {draft.experience.travelers.adults > 1 ? "s" : ""} • {draft.experience.travelers.children}{" "}
                              {draft.experience.travelers.children === 1 ? "child" : "children"}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="font-semibold tabular-nums">${total}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="clean-card p-4 md:p-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3"
                  onClick={() => setFlightSummaryOpen((v) => !v)}
                  aria-expanded={flightSummaryOpen}
                >
                  <div className="text-left">
                    <div className="font-semibold">Your selected itinerary</div>
                    <div className="text-sm text-muted-foreground">
                      {(isFlightDraft(draft) ? draft.legs.length : 0)} leg
                      {isFlightDraft(draft) && draft.legs.length > 1 ? "s" : ""} • ${perTraveler} per traveler
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{flightSummaryOpen ? "Hide" : "Show"}</span>
                </button>

                {flightSummaryOpen && isFlightDraft(draft) ? (
                  <div className="mt-4 space-y-3">
                    {draft.legs.map((leg, idx) => {
                      const flightId = draft.selectedByLeg[idx]
                      const flight = flightId ? getMockFlightById(flightId) : undefined
                      return (
                        <div key={idx} className="border border-border rounded-xl p-4 bg-background">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium">
                                {leg.label}: {leg.from} → {leg.to}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {flight ? `${flight.airline} ${flight.flightNumber} • ${flight.duration}` : "Not selected"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Per traveler</div>
                              <div className="font-semibold">${flight?.price ?? "—"}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )}

            {/* Passenger / guest details */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "passengers" ? (isMobile ? "contact" : "passengers") : "passengers"))}
                aria-expanded={openSection === "passengers"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">
                    {kind === "stay" ? "Who’s checking in?" : kind === "experience" ? "Who’s joining?" : "Who’s traveling?"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {kind === "stay"
                      ? "Add names for the guests staying at the property."
                      : kind === "experience"
                        ? "Add traveler details for everyone joining the experience."
                        : "Keep it simple: start with the main traveler, then add the rest."}
                  </p>
                </div>
                <span className="text-muted-foreground">
                  {openSection === "passengers" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {openSection === "passengers" || !isMobile ? (
                kind === "stay" ? (
                  <div className="mt-5 space-y-3">
                    {guestsList.map((g, idx) => {
                      const base = `g.${g.id}`
                      const isOpen = activeGuestId === g.id
                      const showError = (k: string) => (touched.all || touched[k]) && !!errors[k]
                      return (
                        <div key={g.id} className="border border-border rounded-xl bg-background overflow-hidden">
                          <button
                            type="button"
                            className="w-full p-4 flex items-start justify-between gap-4"
                            onClick={() => setActiveGuestId((cur) => (cur === g.id ? null : g.id))}
                            aria-expanded={isOpen}
                          >
                            <div className="text-left">
                              <div className="font-semibold">{idx + 1}. Guest</div>
                              <div className="text-sm text-muted-foreground">
                                {g.firstName || g.lastName ? `${g.firstName || "—"} ${g.lastName || ""}`.trim() : idx === 0 ? "Primary guest" : "Guest details"}
                              </div>
                            </div>
                            <span className="text-muted-foreground">{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                          </button>

                          {isOpen ? (
                            <div className="px-4 pb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">First name</span>
                                  <input
                                    className="clean-input w-full"
                                    value={g.firstName}
                                    onBlur={() => setTouched((t) => ({ ...t, [`${base}.firstName`]: true }))}
                                    onChange={(e) =>
                                      setGuestsList((arr) => arr.map((x) => (x.id === g.id ? { ...x, firstName: e.target.value } : x)))
                                    }
                                  />
                                  {showError(`${base}.firstName`) ? <div className="text-xs text-red-600">{errors[`${base}.firstName`]}</div> : null}
                                </label>

                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Last name</span>
                                  <input
                                    className="clean-input w-full"
                                    value={g.lastName}
                                    onBlur={() => setTouched((t) => ({ ...t, [`${base}.lastName`]: true }))}
                                    onChange={(e) =>
                                      setGuestsList((arr) => arr.map((x) => (x.id === g.id ? { ...x, lastName: e.target.value } : x)))
                                    }
                                  />
                                  {showError(`${base}.lastName`) ? <div className="text-xs text-red-600">{errors[`${base}.lastName`]}</div> : null}
                                </label>
                              </div>
                              <div className="mt-4 text-xs text-muted-foreground">
                                Tip: the primary guest name should match the ID used at check-in.
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : kind === "experience" ? (
                  <div className="mt-5 space-y-3">
                    {experienceTravelersList.map((t, idx) => {
                      const base = `t.${t.id}`
                      const isOpen = activeExperienceTravelerId === t.id
                      const showError = (k: string) => (touched.all || touched[k]) && !!errors[k]
                      return (
                        <div key={t.id} className="border border-border rounded-xl bg-background overflow-hidden">
                          <button
                            type="button"
                            className="w-full p-4 flex items-start justify-between gap-4"
                            onClick={() => setActiveExperienceTravelerId((cur) => (cur === t.id ? null : t.id))}
                            aria-expanded={isOpen}
                          >
                            <div className="text-left">
                              <div className="font-semibold">{idx + 1}. Traveler</div>
                              <div className="text-sm text-muted-foreground">
                                {t.firstName || t.lastName
                                  ? `${t.firstName || "—"} ${t.lastName || ""}`.trim()
                                  : idx === 0
                                    ? "Primary traveler"
                                    : "Traveler details"}
                                {t.dateOfBirth ? ` • DOB ${t.dateOfBirth}` : ""}
                              </div>
                            </div>
                            <span className="text-muted-foreground">
                              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </span>
                          </button>

                          {isOpen ? (
                            <div className="px-4 pb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">First name</span>
                                  <input
                                    className="clean-input w-full"
                                    value={t.firstName}
                                    onBlur={() => setTouched((m) => ({ ...m, [`${base}.firstName`]: true }))}
                                    onChange={(e) =>
                                      setExperienceTravelersList((arr) =>
                                        arr.map((x) => (x.id === t.id ? { ...x, firstName: e.target.value } : x))
                                      )
                                    }
                                  />
                                  {showError(`${base}.firstName`) ? <div className="text-xs text-red-600">{errors[`${base}.firstName`]}</div> : null}
                                </label>

                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Last name</span>
                                  <input
                                    className="clean-input w-full"
                                    value={t.lastName}
                                    onBlur={() => setTouched((m) => ({ ...m, [`${base}.lastName`]: true }))}
                                    onChange={(e) =>
                                      setExperienceTravelersList((arr) =>
                                        arr.map((x) => (x.id === t.id ? { ...x, lastName: e.target.value } : x))
                                      )
                                    }
                                  />
                                  {showError(`${base}.lastName`) ? <div className="text-xs text-red-600">{errors[`${base}.lastName`]}</div> : null}
                                </label>

                                <label className="space-y-1 md:col-span-2">
                                  <span className="text-sm font-medium">Date of birth</span>
                                  <input
                                    type="date"
                                    className="clean-input w-full"
                                    value={t.dateOfBirth}
                                    onBlur={() => setTouched((m) => ({ ...m, [`${base}.dob`]: true }))}
                                    onChange={(e) =>
                                      setExperienceTravelersList((arr) =>
                                        arr.map((x) => (x.id === t.id ? { ...x, dateOfBirth: e.target.value } : x))
                                      )
                                    }
                                  />
                                  {showError(`${base}.dob`) ? <div className="text-xs text-red-600">{errors[`${base}.dob`]}</div> : null}
                                </label>
                              </div>
                              <div className="mt-4 text-xs text-muted-foreground">
                                Tip: traveler names should match a valid ID for smooth check-in and operator verification.
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPassengers((p) => {
                            const next = [...p, newPassenger(`p${p.length + 1}`, "adult")]
                            return next
                          })
                        }}
                      >
                        Add adult
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPassengers((p) => {
                            const next = [...p, newPassenger(`p${p.length + 1}`, "child")]
                            return next
                          })
                        }}
                      >
                        Add child
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPassengers((p) => {
                            const next = [...p, newPassenger(`p${p.length + 1}`, "infant")]
                            return next
                          })
                        }}
                      >
                        Add infant
                      </Button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {passengers.map((p, idx) => {
                        const base = `p.${p.id}`
                        const isOpen = activePassengerId === p.id
                        const showError = (k: string) => (touched.all || touched[k]) && !!errors[k]
                        const adult1 = passengers.find((x) => x.type === "adult") ?? null
                        const age = calcAgeYears(p.dateOfBirth)

                        return (
                          <div key={p.id} className="border border-border rounded-xl bg-background overflow-hidden">
                            <button
                              type="button"
                              className="w-full p-4 flex items-start justify-between gap-4"
                              onClick={() => setActivePassengerId((cur) => (cur === p.id ? null : p.id))}
                              aria-expanded={isOpen}
                            >
                              <div className="text-left">
                                <div className="font-semibold">
                                  {idx + 1}. {passengerLabel(p.type)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {p.firstName || p.lastName
                                    ? `${p.firstName || "—"} ${p.lastName || ""}`.trim()
                                    : p.type === "adult"
                                      ? "Main traveler"
                                      : "Traveler details"}
                                  {p.type !== "adult" && age !== null ? ` • ${age}y` : null}
                                </div>
                              </div>
                              <span className="text-muted-foreground">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            </button>

                            {isOpen ? (
                              <div className="px-4 pb-4">
                                {auth.isLoggedIn && auth.travelers.length ? (
                                  <div className="mb-4">
                                    <label className="space-y-1">
                                      <span className="text-sm font-medium">Use a saved traveler (optional)</span>
                                      <select
                                        className="clean-input w-full"
                                        value={selectedTravelerByPassengerId[p.id] ?? ""}
                                        onChange={(e) => {
                                          const id = e.target.value
                                          setSelectedTravelerByPassengerId((m) => ({ ...m, [p.id]: id }))
                                          const t = auth.travelers.find((x) => x.id === id)
                                          if (!t) return
                                          setPassengers((arr) =>
                                            arr.map((x) =>
                                              x.id !== p.id
                                                ? x
                                                : {
                                                    ...x,
                                                    firstName: t.firstName,
                                                    lastName: t.lastName,
                                                    dateOfBirth: t.dateOfBirth,
                                                    nationality: t.nationality,
                                                    passportNumber: t.passportNumber,
                                                    passportExpiry: t.passportExpiry,
                                                    gender: t.gender ?? "",
                                                    frequentFlyer: t.frequentFlyer ?? ""
                                                  }
                                            )
                                          )
                                        }}
                                      >
                                        <option value="">Select traveler…</option>
                                        {auth.travelers.map((t) => (
                                          <option key={t.id} value={t.id}>
                                            {t.label}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  </div>
                                ) : null}

                                {p.type !== "adult" && adult1 ? (
                                  <div className="mb-4 flex flex-wrap gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPassengers((arr) =>
                                          arr.map((x) =>
                                            x.id !== p.id
                                              ? x
                                              : { ...x, lastName: x.lastName || adult1.lastName, nationality: x.nationality || adult1.nationality }
                                          )
                                        )
                                      }}
                                    >
                                      Copy last name & nationality from Adult 1
                                    </Button>
                                  </div>
                                ) : null}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">First name</span>
                                    <input
                                      className="clean-input w-full"
                                      value={p.firstName}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.firstName`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, firstName: e.target.value } : x)))
                                      }
                                    />
                                    {showError(`${base}.firstName`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.firstName`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Last name</span>
                                    <input
                                      className="clean-input w-full"
                                      value={p.lastName}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.lastName`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, lastName: e.target.value } : x)))
                                      }
                                    />
                                    {showError(`${base}.lastName`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.lastName`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Date of birth</span>
                                    <input
                                      type="date"
                                      className="clean-input w-full"
                                      value={p.dateOfBirth}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.dob`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, dateOfBirth: e.target.value } : x)))
                                      }
                                    />
                                    <div className="text-xs text-muted-foreground">
                                      {age === null ? "Age will be detected automatically." : `Detected age: ${age} years`}
                                    </div>
                                    {showError(`${base}.dob`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.dob`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Nationality</span>
                                    <input
                                      className="clean-input w-full"
                                      value={p.nationality}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.nationality`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, nationality: e.target.value } : x)))
                                      }
                                    />
                                    {showError(`${base}.nationality`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.nationality`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Passport number</span>
                                    <input
                                      className="clean-input w-full"
                                      value={p.passportNumber}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.passportNumber`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) =>
                                          arr.map((x) => (x.id === p.id ? { ...x, passportNumber: e.target.value } : x))
                                        )
                                      }
                                    />
                                    {showError(`${base}.passportNumber`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.passportNumber`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Passport expiry</span>
                                    <input
                                      type="date"
                                      className="clean-input w-full"
                                      value={p.passportExpiry}
                                      onBlur={() => setTouched((t) => ({ ...t, [`${base}.passportExpiry`]: true }))}
                                      onChange={(e) =>
                                        setPassengers((arr) =>
                                          arr.map((x) => (x.id === p.id ? { ...x, passportExpiry: e.target.value } : x))
                                        )
                                      }
                                    />
                                    {showError(`${base}.passportExpiry`) ? (
                                      <div className="text-xs text-red-600">{errors[`${base}.passportExpiry`]}</div>
                                    ) : null}
                                  </label>

                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Gender (optional)</span>
                                    <select
                                      className="clean-input w-full"
                                      value={p.gender ?? ""}
                                      onChange={(e) =>
                                        setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, gender: e.target.value } : x)))
                                      }
                                    >
                                      <option value="">Prefer not to say</option>
                                      <option value="female">Female</option>
                                      <option value="male">Male</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </label>

                                  <label className="space-y-1 md:col-span-2">
                                    <span className="text-sm font-medium">Frequent flyer (optional)</span>
                                    <input
                                      className="clean-input w-full"
                                      value={p.frequentFlyer ?? ""}
                                      onChange={(e) =>
                                        setPassengers((arr) =>
                                          arr.map((x) => (x.id === p.id ? { ...x, frequentFlyer: e.target.value } : x))
                                        )
                                      }
                                    />
                                  </label>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <div className="text-xs text-muted-foreground">Tip: names must match your travel document.</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPassengers((arr) => {
                                        const next = arr.filter((x) => x.id !== p.id)
                                        const adultsLeft = next.filter((x) => x.type === "adult").length
                                        return adultsLeft === 0 ? arr : next
                                      })
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              ) : null}
            </div>

            {/* Contact information */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "contact" ? (isMobile ? "addons" : "contact") : "contact"))}
                aria-expanded={openSection === "contact"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Where should we send updates?</h2>
                  <p className="text-sm text-muted-foreground">We’ll send tickets, receipts, and important notifications here.</p>
                </div>
                <span className="text-muted-foreground">{openSection === "contact" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "contact" || !isMobile ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      className="clean-input w-full"
                      value={contactEmail}
                      onBlur={() => setTouched((t) => ({ ...t, contactEmail: true }))}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    {(touched.all || touched.contactEmail) && errors.contactEmail ? (
                      <div className="text-xs text-red-600">{errors.contactEmail}</div>
                    ) : null}
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-medium">Phone</span>
                    <input
                      className="clean-input w-full"
                      value={contactPhone}
                      onBlur={() => setTouched((t) => ({ ...t, contactPhone: true }))}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    {(touched.all || touched.contactPhone) && errors.contactPhone ? (
                      <div className="text-xs text-red-600">{errors.contactPhone}</div>
                    ) : null}
                  </label>

                  {auth.isLoggedIn ? (
                    <div className="md:col-span-2 text-xs text-muted-foreground">
                      Using your account contact by default. You can edit it anytime.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Additional services */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "addons" ? (isMobile ? "payment" : "addons") : "addons"))}
                aria-expanded={openSection === "addons"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">{kind === "stay" ? "Requests (optional)" : "Add-ons (optional)"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {kind === "stay" ? "Tell the property anything we should know for check-in." : "A few extras people often add for comfort."}
                  </p>
                </div>
                <span className="text-muted-foreground">{openSection === "addons" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "addons" || !isMobile ? (
                kind === "stay" ? (
                  <div className="mt-4 space-y-2">
                    <label className="space-y-1 block">
                      <span className="text-sm font-medium">Special requests (optional)</span>
                      <textarea
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                        rows={4}
                        placeholder="Late check-in, quiet room, accessibility needs…"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </label>
                    <div className="text-xs text-muted-foreground">
                      We’ll share requests with the property, subject to availability.
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      className={[
                        "text-left p-4 rounded-xl border bg-background",
                        extras.baggage ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                      ].join(" ")}
                      onClick={() => setExtras((x) => ({ ...x, baggage: !x.baggage }))}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Luggage className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">Extra baggage</div>
                            <div className="text-xs text-muted-foreground">$30 per traveler</div>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Recommended
                        </span>
                      </div>
                      <div className="mt-3 text-sm">
                        {extras.baggage ? (
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> Added • ${30 * travelers}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Add for ${30 * travelers} total</span>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      className={[
                        "text-left p-4 rounded-xl border bg-background",
                        extras.meals ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                      ].join(" ")}
                      onClick={() => setExtras((x) => ({ ...x, meals: !x.meals }))}
                    >
                      <div className="flex items-start gap-2">
                        <Utensils className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Meals</div>
                          <div className="text-xs text-muted-foreground">$15 per traveler</div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        {extras.meals ? (
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> Added • ${15 * travelers}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Add for ${15 * travelers} total</span>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      className={[
                        "text-left p-4 rounded-xl border bg-background",
                        extras.seatSelection ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                      ].join(" ")}
                      onClick={() => setExtras((x) => ({ ...x, seatSelection: !x.seatSelection }))}
                    >
                      <div className="flex items-start gap-2">
                        <Armchair className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Seat selection</div>
                          <div className="text-xs text-muted-foreground">$10 per traveler • (placeholder)</div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        {extras.seatSelection ? (
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> Added • ${10 * travelers}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Add for ${10 * travelers} total</span>
                        )}
                      </div>
                    </button>
                  </div>
                )
              ) : null}
            </div>

            {/* Payment */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "payment" ? (isMobile ? "payment" : "payment") : "payment"))}
                aria-expanded={openSection === "payment"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <p className="text-sm text-muted-foreground">Almost done — you won’t be charged until you confirm.</p>
                </div>
                <span className="text-muted-foreground">{openSection === "payment" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "payment" || !isMobile ? (
                <div className="mt-4">
                  {!auth.isLoggedIn ? (
                    <div className="border border-border rounded-xl p-4 bg-muted/20">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Create an account to pay</div>
                          <div className="text-muted-foreground">
                            We require an account so we can deliver tickets and receipts securely, and support changes later.
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              onClick={() => {
                                setAuthMode("signup")
                                setOpenSection("auth")
                              }}
                            >
                              Create account
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAuthMode("signin")
                                setOpenSection("auth")
                              }}
                            >
                              Sign in
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className={auth.isLoggedIn ? "" : "opacity-50 pointer-events-none"}>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={[
                          "px-3 py-2 rounded-lg border text-sm",
                          paymentMethod === "card" ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                        ].join(" ")}
                        onClick={() => setPaymentMethod("card")}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        className={[
                          "px-3 py-2 rounded-lg border text-sm",
                          paymentMethod === "mobile_money" ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                        ].join(" ")}
                        onClick={() => setPaymentMethod("mobile_money")}
                      >
                        Mobile money
                      </button>
                    </div>

                    {paymentMethod === "card" ? (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-sm font-medium">Card number</span>
                          <input className="clean-input w-full" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                          {touched.all && errors.cardNumber ? <div className="text-xs text-red-600">{errors.cardNumber}</div> : null}
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm font-medium">Expiry (MM/YY)</span>
                          <input
                            className="clean-input w-full"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                          />
                          {touched.all && errors.cardExpiry ? <div className="text-xs text-red-600">{errors.cardExpiry}</div> : null}
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm font-medium">CVC</span>
                          <input className="clean-input w-full" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                          {touched.all && errors.cardCvc ? <div className="text-xs text-red-600">{errors.cardCvc}</div> : null}
                        </label>
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-muted-foreground">
                        Mobile money is a placeholder for now. You can complete the flow to see confirmation.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: sticky summary */}
          <div className="space-y-6">
            <div className="clean-card p-4 md:p-6 lg:sticky lg:top-[calc(var(--sticky-stack-h,120px)+16px)]">
              <h2 className="text-lg font-semibold">Price summary</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure payment
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <BadgeCheck className="h-3.5 w-3.5" /> No hidden fees
                </span>
                {hasFreeCancellation ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Free cancellation
                  </span>
                ) : null}
              </div>

              {kind === "stay" && isStayDraft(draft) ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per night</span>
                    <span className="font-medium tabular-nums">${draft.stay.pricing.pricePerNight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="font-medium">{draft.stay.pricing.nights}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium tabular-nums">${draft.stay.pricing.fees}</span>
                  </div>
                  {draft.stay.pricing.discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium tabular-nums text-primary">-${draft.stay.pricing.discount}</span>
                    </div>
                  ) : null}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold tabular-nums">${total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Includes taxes & fees. Final price may vary based on property policies.
                  </div>
                </div>
              ) : kind === "experience" && isExperienceDraft(draft) ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per person</span>
                    <span className="font-medium tabular-nums">${draft.experience.pricing.pricePerPerson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Travelers</span>
                    <span className="font-medium">{draft.experience.pricing.travelers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium tabular-nums">${draft.experience.pricing.fees}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold tabular-nums">${total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Includes taxes & service fees. Final details may vary by operator policies.</div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Per traveler</span>
                    <span className="font-medium">${perTraveler}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Travelers</span>
                    <span className="font-medium">{travelers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Extras</span>
                    <span className="font-medium">${extrasTotal}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold tabular-nums">${total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Includes taxes & fees. (Base ${breakdown.baseFare} + Taxes ${breakdown.taxesAndFees}) per traveler.
                  </div>
                </div>
              )}

              <div className="mt-5">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canReview || isPaying}
                  onClick={onPay}
                  ref={(el) => {
                    payBtnRef.current = el
                  }}
                >
                  {isPaying ? "Processing…" : "Review & Pay"}
                </Button>
                {touched.all && !canPay ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {!auth.isLoggedIn ? "You can review as a guest, but you’ll need an account before payment." : "Complete the required fields to continue."}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Review modal */}
        {reviewOpen ? (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => (isPaying ? null : setReviewOpen(false))} />
            <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-4">
              <div className="w-full md:max-w-2xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-border flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">Review & pay</div>
                    <div className="text-sm text-muted-foreground">Confirm details before we process payment.</div>
                  </div>
                  <Button variant="ghost" onClick={() => (isPaying ? null : setReviewOpen(false))} aria-label="Close review">
                    ✕
                  </Button>
                </div>

                <div className="p-4 md:p-6 space-y-5 max-h-[70dvh] overflow-y-auto">
                  {kind === "stay" && isStayDraft(draft) ? (
                    <>
                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Stay</div>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-foreground">{selectedStay?.name ?? "Selected stay"}</div>
                              <div>
                                {selectedStay ? `${selectedStay.location.city}, ${selectedStay.location.country}` : "—"}
                              </div>
                              <div className="text-xs mt-1">
                                {draft.stay.search.checkIn} → {draft.stay.search.checkOut} • {draft.stay.pricing.nights} night
                                {draft.stay.pricing.nights > 1 ? "s" : ""}
                              </div>
                              <div className="text-xs">
                                {Math.max(1, (draft.stay.search.guests?.adults ?? 1) + (draft.stay.search.guests?.children ?? 0))} guest
                                {Math.max(1, (draft.stay.search.guests?.adults ?? 1) + (draft.stay.search.guests?.children ?? 0)) > 1 ? "s" : ""}
                                {draft.stay.type === "hotel" ? ` • Room booking` : ` • Apartment booking`}
                              </div>
                            </div>
                            <div className="text-right text-foreground tabular-nums">${draft.stay.pricing.total}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Guests</div>
                        <div className="mt-2 space-y-2 text-sm">
                          {guestsList.map((g, idx) => (
                            <div key={g.id} className="flex items-center justify-between gap-3">
                              <div className="text-foreground">
                                {idx + 1}. {g.firstName || "—"} {g.lastName || ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : kind === "experience" && isExperienceDraft(draft) ? (
                    <>
                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Experience</div>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-foreground">{selectedExperience?.title ?? "Selected experience"}</div>
                              <div>{selectedExperience ? `${selectedExperience.location.city}, ${selectedExperience.location.country}` : "—"}</div>
                              <div className="text-xs mt-1">Date {draft.experience.date || "—"} • {draft.experience.pricing.travelers} traveler{draft.experience.pricing.travelers > 1 ? "s" : ""}</div>
                            </div>
                            <div className="text-right text-foreground tabular-nums">${draft.experience.pricing.total}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Travelers</div>
                        <div className="mt-2 space-y-2 text-sm">
                          {experienceTravelersList.map((t, idx) => (
                            <div key={t.id} className="flex items-center justify-between gap-3">
                              <div className="text-foreground">
                                {idx + 1}. {t.firstName || "—"} {t.lastName || ""}{" "}
                                <span className="text-xs text-muted-foreground">• DOB {t.dateOfBirth || "—"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Itinerary</div>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                          {isFlightDraft(draft)
                            ? draft.legs.map((leg, idx) => {
                                const flightId = draft.selectedByLeg[idx]
                                const flight = flightId ? getMockFlightById(flightId) : undefined
                                return (
                                  <div key={idx} className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-foreground">
                                        {leg.label}: {leg.from} → {leg.to}
                                      </div>
                                      <div>
                                        {flight ? `${flight.airline} ${flight.flightNumber} • ${flight.duration}` : "Not selected"}
                                      </div>
                                    </div>
                                    <div className="text-right text-foreground tabular-nums">${flight?.price ?? "—"}</div>
                                  </div>
                                )
                              })
                            : null}
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-4 bg-background">
                        <div className="font-medium">Passengers</div>
                        <div className="mt-2 space-y-2 text-sm">
                          {passengers.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-foreground">
                                  {idx + 1}. {passengerLabel(p.type)} • {p.firstName || "—"} {p.lastName || ""}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  DOB {p.dateOfBirth || "—"} • Passport {p.passportNumber || "—"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">Total</div>
                      <div className="font-semibold tabular-nums">${total}</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {hasFreeCancellation ? "Includes free cancellation where available." : "Cancellation terms may apply."} You won’t be charged
                      until you confirm.
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={reviewConfirmed} onChange={(e) => setReviewConfirmed(e.target.checked)} />
                    <span>
                      {kind === "stay"
                        ? "I confirm guest details are correct. I agree to the property’s policies and cancellation terms."
                        : kind === "experience"
                          ? "I confirm traveler details are correct. I agree to the operator’s terms and cancellation policy."
                          : "I confirm passenger details are correct and match the travel documents. I agree to the airline’s policies."}
                    </span>
                  </label>
                </div>

                <div className="p-4 md:p-6 border-t border-border bg-background">
                  <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2">
                    <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={isPaying}>
                      Back
                    </Button>
                    <Button onClick={onConfirmAndPay} disabled={!reviewConfirmed || isPaying || !canPay}>
                      {auth.isLoggedIn ? (isPaying ? "Processing…" : `Pay $${total}`) : "Sign in to pay"}
                    </Button>
                  </div>
                  {!auth.isLoggedIn ? (
                    <div className="mt-3 text-xs text-muted-foreground">
                      Payment requires an account so we can securely deliver tickets/receipts and support changes later.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Mobile sticky pay bar */}
        <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-semibold">${total}</div>
            </div>
            <Button
              className="flex-1"
              disabled={!canReview || isPaying}
              onClick={() => {
                setTouched((t) => ({ ...t, all: true }))
                onPay()
              }}
            >
              {isPaying ? "Processing…" : "Review & Pay"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

