"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  loadBookingDraft,
  saveBookingReceipt,
  type BookingDraft,
  type BookingReceipt,
  type TransportBookingDraft,
  type TransportBookingReceipt
} from "@/lib/booking-storage"
import { getMockTransportById } from "@/lib/mock-transport"
import { createAccountEmail, loadAuth, signInEmail, signOut, upsertTransportPassenger, type AuthState } from "@/lib/auth-storage"
import { BadgeCheck, CheckCircle2, ChevronDown, ChevronUp, Lock, ShieldCheck, Smartphone, CreditCard } from "lucide-react"
import { useMediaQuery } from "@/lib/use-media-query"

type Passenger = {
  id: string
  firstName: string
  lastName: string
  phone: string
}

function isTransportDraft(d: BookingDraft | null): d is TransportBookingDraft {
  return Boolean(d && (d as any).kind === "transport")
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function Stepper({ active }: { active: 1 | 2 | 3 | 4 }) {
  const steps = [
    { key: 1, label: "Trip summary" },
    { key: 2, label: "Passenger details" },
    { key: 3, label: "Payment" },
    { key: 4, label: "Confirmation" }
  ] as const
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center justify-center h-6 px-2 rounded-full border text-xs font-medium",
              s.key < active ? "bg-primary/10 border-primary/30 text-primary" : "",
              s.key === active ? "bg-background border-border text-foreground" : "",
              s.key > active ? "bg-muted/40 border-border text-muted-foreground" : ""
            ].join(" ")}
          >
            {s.label}
          </span>
          {idx < steps.length - 1 ? <span className="text-muted-foreground">→</span> : null}
        </div>
      ))}
    </div>
  )
}

export default function TransportCheckoutPage() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [draft, setDraft] = useState<TransportBookingDraft | null>(null)
  const [auth, setAuth] = useState<AuthState>({ version: 1, isLoggedIn: false, travelers: [] })

  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const [authMode, setAuthMode] = useState<"none" | "guest" | "signin" | "signup">("none")
  const [authEmail, setAuthEmail] = useState("")
  const [authPhone, setAuthPhone] = useState("")
  const [authPassword, setAuthPassword] = useState("")

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [activePassengerId, setActivePassengerId] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [openSection, setOpenSection] = useState<"auth" | "summary" | "passengers" | "contact" | "payment">("auth")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [isPaying, setIsPaying] = useState(false)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const payBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const d = loadBookingDraft()
    const a = loadAuth()
    setAuth(a)
    if (!isTransportDraft(d)) {
      setDraft(null)
      return
    }
    setDraft(d)

    const count = clamp(d.transport.search.passengers ?? 1, 1, 12)
    const list: Passenger[] = Array.from({ length: count }).map((_, idx) => ({
      id: `tp${idx + 1}`,
      firstName: "",
      lastName: "",
      phone: ""
    }))
    setPassengers(list)
    setActivePassengerId(list[0]?.id ?? null)
    setAuthMode("guest")

    if (a.email) setContactEmail(a.email)
    if (a.phone) setContactPhone(a.phone)
  }, [])

  const service = useMemo(() => {
    if (!draft) return null
    return getMockTransportById(draft.transport.serviceId)
  }, [draft])

  const totals = useMemo(() => draft?.transport.pricing ?? null, [draft])
  const baseSubtotal = useMemo(() => {
    if (!totals) return 0
    return totals.unit === "per_day" ? totals.amount * (totals.days ?? 1) : totals.amount
  }, [totals])

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!isEmail(contactEmail)) e.contactEmail = "Enter a valid email."
    if (contactPhone.trim().length < 7) e.contactPhone = "Enter a valid phone number."

    passengers.forEach((p) => {
      const base = `p.${p.id}`
      if (!p.firstName.trim()) e[`${base}.firstName`] = "Required."
      if (!p.lastName.trim()) e[`${base}.lastName`] = "Required."
      if (p.phone.trim().length < 7) e[`${base}.phone`] = "Enter a valid phone."
    })

    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "")
      if (digits.length < 12) e.cardNumber = "Enter a valid card number."
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) e.cardExpiry = "Use MM/YY."
      if (cardCvc.replace(/\D/g, "").length < 3) e.cardCvc = "Enter a valid CVC."
    }
    return e
  }, [contactEmail, contactPhone, passengers, paymentMethod, cardNumber, cardExpiry, cardCvc])

  const isValid = Object.keys(errors).length === 0 && Boolean(totals && totals.total > 0)
  const accountRequired = true
  const canPay = isValid && (!accountRequired || auth.isLoggedIn)

  const backToDetails = () => {
    if (!draft) return router.push("/transport")
    const url = draft.returnUrl ?? "/transport"
    router.push(url)
  }

  const onPay = async () => {
    setTouched((t) => ({ ...t, all: true }))
    if (!isValid) {
      setOpenSection("passengers")
      return
    }
    setReviewConfirmed(false)
    setReviewOpen(true)
  }

  const onConfirmAndPay = async () => {
    if (!reviewConfirmed) return
    if (!canPay) return
    if (!draft || !totals) return
    setIsPaying(true)
    try {
      await new Promise((r) => setTimeout(r, 900))
      const bookingId = `TRP-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString().slice(-4)}`

      const receipt: TransportBookingReceipt = {
        version: 2,
        kind: "transport",
        bookingId,
        createdAt: Date.now(),
        draft,
        passengers: passengers.map((p) => ({ firstName: p.firstName, lastName: p.lastName, phone: p.phone || undefined })),
        contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
        payment: paymentMethod === "card" ? { method: "card", last4: cardNumber.replace(/\D/g, "").slice(-4) } : { method: "mobile_money" },
        totals: {
          amount: baseSubtotal,
          unit: totals.unit,
          days: totals.days,
          fees: totals.fees,
          total: totals.total,
          currency: "USD"
        }
      }

      // Save primary passenger to profile (API-ready local storage) if logged in.
      if (auth.isLoggedIn) {
        const primary = passengers[0]
        if (primary) {
          upsertTransportPassenger({
            id: "transport:primary",
            label: `${primary.firstName || "Passenger"} ${primary.lastName || ""}`.trim() || "Primary passenger",
            firstName: primary.firstName,
            lastName: primary.lastName,
            phone: primary.phone || undefined
          })
          setAuth(loadAuth())
        }
      }

      saveBookingReceipt(receipt as BookingReceipt)
      router.push(`/transport/confirmation?bookingId=${encodeURIComponent(bookingId)}`)
    } finally {
      setIsPaying(false)
    }
  }

  if (!draft || !service || !totals) {
    return (
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-3xl mx-auto clean-card p-6">
          <Stepper active={1} />
          <div className="mt-6 space-y-2">
            <div className="text-lg font-semibold">No transport selected</div>
            <div className="text-muted-foreground text-sm">Go back to Transport search to pick an option first.</div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => router.push("/transport")}>Back to Transport</Button>
            <Button variant="outline" onClick={() => router.push("/transport/search?tab=airport_pickup")}>
              Search
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const showError = (k: string) => (touched.all || touched[k]) && !!errors[k]

  return (
    <main className="pt-20 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="clean-card p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Stepper active={3} />
            <Button variant="outline" onClick={backToDetails}>
              Back to details
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Authentication */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "auth" ? (isMobile ? "summary" : "auth") : "auth"))}
                aria-expanded={openSection === "auth"}
              >
                <div className="text-left">
                  <div className="font-semibold">Log in (recommended)</div>
                  <div className="text-sm text-muted-foreground">
                    {auth.isLoggedIn ? `Using saved account details • ${auth.email ?? "Signed in"}` : "Save passenger details and manage bookings easily."}
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
                      </div>

                      {authMode === "guest" ? (
                        <div className="border border-border rounded-xl p-4 bg-muted/20">
                          <div className="flex items-start gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium">Guest checkout is available up to review</div>
                              <div className="text-muted-foreground">
                                You’ll need an account before payment so we can deliver receipts securely and support changes.
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {authMode === "signin" ? (
                        <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                          <label className="space-y-1 block">
                            <span className="text-sm font-medium">Email</span>
                            <input className="clean-input w-full" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                          </label>
                          <label className="space-y-1 block">
                            <span className="text-sm font-medium">Password</span>
                            <input
                              className="clean-input w-full"
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                            />
                          </label>
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
                        </div>
                      ) : null}

                      {authMode === "signup" ? (
                        <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                          <label className="space-y-1 block">
                            <span className="text-sm font-medium">Email</span>
                            <input className="clean-input w-full" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Summary */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "summary" ? (isMobile ? "passengers" : "summary") : "summary"))}
                aria-expanded={openSection === "summary"}
              >
                <div className="text-left">
                  <div className="font-semibold">Trip summary</div>
                  <div className="text-sm text-muted-foreground">
                    {service.kind === "airport_pickup" ? "Airport pickup" : "Car rental"} • {totals.unit === "per_day" ? `${totals.days ?? 1} day(s)` : "Per trip"}
                  </div>
                </div>
                <span className="text-muted-foreground">{openSection === "summary" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "summary" || !isMobile ? (
                <div className="mt-4 border border-border rounded-xl p-4 bg-background">
                  <div className="font-medium">{service.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{service.provider.name}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Passengers: {draft.transport.search.passengers} • Unit: {totals.unit === "per_day" ? "Per day" : "Per trip"}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Passengers */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "passengers" ? (isMobile ? "contact" : "passengers") : "passengers"))}
                aria-expanded={openSection === "passengers"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Passenger details</h2>
                  <p className="text-sm text-muted-foreground">Add names and a reachable phone for pickup coordination.</p>
                </div>
                <span className="text-muted-foreground">{openSection === "passengers" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>

              {openSection === "passengers" || !isMobile ? (
                <div className="mt-5 space-y-3">
                  {passengers.map((p, idx) => {
                    const base = `p.${p.id}`
                    const isOpen = activePassengerId === p.id
                    return (
                      <div key={p.id} className="border border-border rounded-xl bg-background overflow-hidden">
                        <button
                          type="button"
                          className="w-full p-4 flex items-start justify-between gap-4"
                          onClick={() => setActivePassengerId((cur) => (cur === p.id ? null : p.id))}
                          aria-expanded={isOpen}
                        >
                          <div className="text-left">
                            <div className="font-semibold">{idx + 1}. Passenger</div>
                            <div className="text-sm text-muted-foreground">
                              {p.firstName || p.lastName ? `${p.firstName || "—"} ${p.lastName || ""}`.trim() : idx === 0 ? "Primary passenger" : "Passenger details"}
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
                                  value={p.firstName}
                                  onBlur={() => setTouched((t) => ({ ...t, [`${base}.firstName`]: true }))}
                                  onChange={(e) => setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, firstName: e.target.value } : x)))}
                                />
                                {showError(`${base}.firstName`) ? <div className="text-xs text-red-600">{errors[`${base}.firstName`]}</div> : null}
                              </label>
                              <label className="space-y-1">
                                <span className="text-sm font-medium">Last name</span>
                                <input
                                  className="clean-input w-full"
                                  value={p.lastName}
                                  onBlur={() => setTouched((t) => ({ ...t, [`${base}.lastName`]: true }))}
                                  onChange={(e) => setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, lastName: e.target.value } : x)))}
                                />
                                {showError(`${base}.lastName`) ? <div className="text-xs text-red-600">{errors[`${base}.lastName`]}</div> : null}
                              </label>
                              <label className="space-y-1 md:col-span-2">
                                <span className="text-sm font-medium">Phone</span>
                                <input
                                  className="clean-input w-full"
                                  value={p.phone}
                                  onBlur={() => setTouched((t) => ({ ...t, [`${base}.phone`]: true }))}
                                  onChange={(e) => setPassengers((arr) => arr.map((x) => (x.id === p.id ? { ...x, phone: e.target.value } : x)))}
                                  placeholder="+252..."
                                />
                                {showError(`${base}.phone`) ? <div className="text-xs text-red-600">{errors[`${base}.phone`]}</div> : null}
                              </label>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>

            {/* Contact */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection((s) => (s === "contact" ? (isMobile ? "payment" : "contact") : "contact"))}
                aria-expanded={openSection === "contact"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Where should we send updates?</h2>
                  <p className="text-sm text-muted-foreground">We’ll send receipts and booking reference here.</p>
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
                    {showError("contactEmail") ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Phone</span>
                    <input
                      className="clean-input w-full"
                      value={contactPhone}
                      onBlur={() => setTouched((t) => ({ ...t, contactPhone: true }))}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    {showError("contactPhone") ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
                  </label>
                </div>
              ) : null}
            </div>

            {/* Payment */}
            <div className="clean-card p-4 md:p-6">
              <button
                type="button"
                className="w-full flex items-start justify-between gap-4"
                onClick={() => setOpenSection("payment")}
                aria-expanded={openSection === "payment"}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Payment</h2>
                  <p className="text-sm text-muted-foreground">Secure checkout — you won’t be charged until you confirm.</p>
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
                            We require an account so we can securely deliver receipts and help manage changes.
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
                        <CreditCard className="h-4 w-4 inline mr-2" />
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
                        <Smartphone className="h-4 w-4 inline mr-2" />
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
                          <input className="clean-input w-full" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" />
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

          {/* Right */}
          <div className="space-y-6">
            <div className="clean-card p-4 md:p-6 lg:sticky lg:top-[calc(var(--sticky-stack-h,120px)+16px)]">
              <h2 className="text-lg font-semibold">Price summary</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure payment
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified providers
                </span>
                {service.freeCancellation ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Free cancellation
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Base {totals.unit === "per_day" ? `(${totals.days ?? 1} day(s))` : "(per trip)"}
                  </span>
                    <span className="font-medium tabular-nums">{fmtMoney(baseSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="font-medium tabular-nums">{fmtMoney(totals.fees)}</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold tabular-nums">{fmtMoney(totals.total)}</span>
                </div>
                <div className="text-xs text-muted-foreground">Includes service fees. Final details may vary by provider policies.</div>
              </div>

              <div className="mt-5">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!isValid || isPaying}
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
                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="font-medium">Transport</div>
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-foreground">{service.title}</div>
                          <div>{service.provider.name}</div>
                          <div className="text-xs mt-1">
                            {draft.transport.search.passengers} passenger{draft.transport.search.passengers > 1 ? "s" : ""} •{" "}
                            {totals.unit === "per_day" ? `${totals.days ?? 1} day(s)` : "Per trip"}
                          </div>
                        </div>
                        <div className="text-right text-foreground tabular-nums">{fmtMoney(totals.total)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="font-medium">Passengers</div>
                    <div className="mt-2 space-y-2 text-sm">
                      {passengers.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between gap-3">
                          <div className="text-foreground">
                            {idx + 1}. {p.firstName || "—"} {p.lastName || ""}{" "}
                            <span className="text-xs text-muted-foreground">• {p.phone || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-background">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">Total</div>
                      <div className="font-semibold tabular-nums">{fmtMoney(totals.total)}</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">You won’t be charged until you confirm.</div>
                  </div>

                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={reviewConfirmed} onChange={(e) => setReviewConfirmed(e.target.checked)} />
                    <span>I confirm passenger details and pickup info are correct. I agree to the provider’s policies.</span>
                  </label>
                </div>

                <div className="p-4 md:p-6 border-t border-border bg-background">
                  <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-2">
                    <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={isPaying}>
                      Back
                    </Button>
                    <Button onClick={onConfirmAndPay} disabled={!reviewConfirmed || isPaying || !canPay}>
                      {auth.isLoggedIn ? (isPaying ? "Processing…" : `Pay ${fmtMoney(totals.total)}`) : "Sign in to pay"}
                    </Button>
                  </div>
                  {!auth.isLoggedIn ? (
                    <div className="mt-3 text-xs text-muted-foreground">
                      Payment requires an account so we can securely deliver receipts and support changes later.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

