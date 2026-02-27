"use client"

import { useEffect, useState } from "react"
import { Calendar, ArrowLeftRight, Search, Route, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Airport } from "@/lib/airports"
import { AIRPORTS } from "@/lib/airports"
import { AirportAutocomplete } from "@/components/flight-search/airport-autocomplete"
import { PassengerPicker, type PassengerState, formatPassengerSummary } from "@/components/flight-search/passenger-picker"

type TripType = "round-trip" | "one-way" | "multi-city"

type RouteLeg = {
    from: Airport | null
    to: Airport | null
    date: string
}

export type SearchData =
    | {
        tripType: "one-way" | "round-trip"
        from: Airport
        to: Airport
        departDate: string
        returnDate?: string
        passengers: PassengerState
    }
    | {
        tripType: "multi-city"
        routes: RouteLeg[]
        passengers: PassengerState
    }

interface FlightSearchCompactProps {
    onSearch?: (data: SearchData) => void
    initialData?: SearchData
    onCancel?: () => void
}

export function FlightSearchCompact({ onSearch, initialData, onCancel }: FlightSearchCompactProps) {
    const [tripType, setTripType] = useState<TripType>("round-trip")
    const [from, setFrom] = useState<Airport | null>(null)
    const [to, setTo] = useState<Airport | null>(null)
    const [departDate, setDepartDate] = useState("")
    const [returnDate, setReturnDate] = useState("")
    const [routes, setRoutes] = useState<RouteLeg[]>([
        { from: null, to: null, date: "" },
        { from: null, to: null, date: "" }
    ])
    const [passengers, setPassengers] = useState<PassengerState>({ adults: 1, infants: 0, childrenAges: [] })
    const [modeTab, setModeTab] = useState<"popular" | "status" | "checkin" | "manage">("popular")
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [statusForm, setStatusForm] = useState({ flightNumber: "", date: "" })
    const [checkinForm, setCheckinForm] = useState({ bookingRef: "", lastName: "" })
    const [manageForm, setManageForm] = useState({ bookingRef: "", lastName: "" })
    const [actionResult, setActionResult] = useState<string | null>(null)

    useEffect(() => {
        if (!initialData) return

        setModeTab("popular")
        setTouched({})
        setActionResult(null)
        setPassengers(initialData.passengers)

        if (initialData.tripType === "multi-city") {
            setTripType("multi-city")
            setRoutes(
                initialData.routes.length >= 2
                    ? initialData.routes.map((r) => ({ from: r.from ?? null, to: r.to ?? null, date: r.date ?? "" }))
                    : [
                        { from: null, to: null, date: "" },
                        { from: null, to: null, date: "" }
                    ]
            )
            setFrom(null)
            setTo(null)
            setDepartDate("")
            setReturnDate("")
            return
        }

        setTripType(initialData.tripType)
        setFrom(initialData.from)
        setTo(initialData.to)
        setDepartDate(initialData.departDate)
        setReturnDate(initialData.tripType === "round-trip" ? initialData.returnDate ?? "" : "")
    }, [initialData])

    const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }))

    const errors = (() => {
        const e: Record<string, string> = {}

        // Passenger rules
        if (passengers.adults < 1) e.passengers = "Please include at least 1 adult."
        if (passengers.infants > passengers.adults) e.passengers = "Infants can’t exceed adults."

        if (modeTab !== "popular") {
            if (modeTab === "status") {
                if (!statusForm.flightNumber.trim()) e.flightNumber = "Enter a flight number (e.g., KQ 101)."
                if (!statusForm.date) e.statusDate = "Choose a date."
            }
            if (modeTab === "checkin") {
                if (!checkinForm.bookingRef.trim()) e.bookingRef = "Enter your booking reference."
                if (!checkinForm.lastName.trim()) e.lastName = "Enter the passenger’s last name."
            }
            if (modeTab === "manage") {
                if (!manageForm.bookingRef.trim()) e.mBookingRef = "Enter your booking reference."
                if (!manageForm.lastName.trim()) e.mLastName = "Enter the passenger’s last name."
            }
            return e
        }

        if (tripType === "multi-city") {
            if (routes.length < 2) e.routes = "Add at least two routes."
            routes.forEach((r, idx) => {
                if (!r.from) e[`r${idx}-from`] = "Choose an origin."
                if (!r.to) e[`r${idx}-to`] = "Choose a destination."
                if (r.from && r.to && r.from.code === r.to.code) e[`r${idx}-to`] = "Destination must differ from origin."
                if (!r.date) e[`r${idx}-date`] = "Choose a date."
            })
            return e
        }

        if (!from) e.from = "Choose an origin airport."
        if (!to) e.to = "Choose a destination airport."
        if (from && to && from.code === to.code) e.to = "Destination must differ from origin."
        if (!departDate) e.departDate = "Choose a departure date."
        if (tripType === "round-trip") {
            if (!returnDate) e.returnDate = "Choose a return date."
            if (departDate && returnDate && returnDate < departDate) e.returnDate = "Return date should be after departure."
        }

        return e
    })()

    const isValid = Object.keys(errors).length === 0

    const handleSearch = () => {
        setActionResult(null)

        // mark key fields touched so messages show
        if (modeTab === "popular") {
            if (tripType === "multi-city") {
                routes.forEach((_, idx) => {
                    markTouched(`r${idx}-from`)
                    markTouched(`r${idx}-to`)
                    markTouched(`r${idx}-date`)
                })
            } else {
                markTouched("from")
                markTouched("to")
                markTouched("departDate")
                if (tripType === "round-trip") markTouched("returnDate")
            }
            markTouched("passengers")

            if (!isValid) return

            if (tripType === "multi-city") {
                onSearch?.({ tripType, routes: routes as RouteLeg[], passengers })
                return
            }

            if (!from || !to) return

            onSearch?.({
                tripType,
                from,
                to,
                departDate,
                returnDate: tripType === "round-trip" ? returnDate : undefined,
                passengers
            })
            return
        }

        // Secondary modes (status/check-in/manage)
        if (!isValid) {
            if (modeTab === "status") {
                markTouched("flightNumber")
                markTouched("statusDate")
            } else if (modeTab === "checkin") {
                markTouched("bookingRef")
                markTouched("lastName")
            } else if (modeTab === "manage") {
                markTouched("mBookingRef")
                markTouched("mLastName")
            }
            return
        }

        if (modeTab === "status") {
            setActionResult(`We’ll show live status for “${statusForm.flightNumber.trim()}” on ${statusForm.date}.`)
        } else if (modeTab === "checkin") {
            setActionResult(`Looking up check-in for ${checkinForm.bookingRef.trim().toUpperCase()}…`)
        } else if (modeTab === "manage") {
            setActionResult(`Opening booking ${manageForm.bookingRef.trim().toUpperCase()}…`)
        }
    }

    const handleSwapLocations = () => {
        const temp = from
        setFrom(to)
        setTo(temp)
    }

    const popularRoutes: Array<{ from: string; to: string }> = [
        { from: "NBO", to: "DXB" },
        { from: "NBO", to: "IST" },
        { from: "NBO", to: "LHR" },
        { from: "EBB", to: "NBO" },
        { from: "DAR", to: "DXB" }
    ]

    const pickAirportByCode = (code: string) => AIRPORTS.find((a) => a.code === code) ?? null

    return (
        <section className="pb-16 section-background">
            <div className="container">
                <div className="max-w-5xl mx-auto">
                    <div className="clean-card relative z-20 p-6 border dark:border-border/80 dark:bg-card/90 dark:backdrop-blur-xl animate-in fade-in slide-in-from-bottom-1 duration-500 ease-out">
                        {/* Trip Type Selection */}
                        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted dark:bg-muted/80 rounded-lg border dark:border-border/60 w-fit">
                            {[
                                { id: "round-trip" as const, label: "Round Trip" },
                                { id: "one-way" as const, label: "One Way" },
                                { id: "multi-city" as const, label: "Multi City" }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setTripType(type.id)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${tripType === type.id
                                        ? "bg-background dark:bg-card text-foreground shadow-sm border dark:border-border/60"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-card/50"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Mode tabs */}
                        <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Search modes">
                            {[
                                { id: "popular" as const, label: "Popular Routes" },
                                { id: "status" as const, label: "Flight Status" },
                                { id: "checkin" as const, label: "Check-in" },
                                { id: "manage" as const, label: "Manage Booking" }
                            ].map((t) => {
                                const active = modeTab === t.id
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        className={[
                                            "px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200",
                                            active ? "bg-accent border-border text-foreground" : "border-border hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                                        ].join(" ")}
                                        onClick={() => {
                                            setModeTab(t.id)
                                            setActionResult(null)
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Search content */}
                        {modeTab === "popular" ? (
                            <>
                                {tripType === "multi-city" ? (
                                    <div className="space-y-4 mb-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="text-sm font-semibold inline-flex items-center gap-2">
                                                <Route className="h-4 w-4 text-primary" />
                                                Routes
                                            </div>
                                            <button
                                                type="button"
                                                className="text-xs font-medium inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-accent disabled:opacity-50"
                                                disabled={routes.length >= 5}
                                                onClick={() => setRoutes((r) => [...r, { from: null, to: null, date: "" }])}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add route
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {routes.map((r, idx) => (
                                                <div key={idx} className="clean-card p-4 border border-border/60 bg-background/50">
                                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                                                        <div className="lg:col-span-4">
                                                            <AirportAutocomplete
                                                                id={`r${idx}-from`}
                                                                label="From"
                                                                placeholder="City or airport"
                                                                required
                                                                value={r.from}
                                                                excludeCodes={r.to ? [r.to.code] : []}
                                                                error={touched[`r${idx}-from`] ? errors[`r${idx}-from`] : undefined}
                                                                onBlur={() => markTouched(`r${idx}-from`)}
                                                                onChange={(a) => {
                                                                    setRoutes((prev) => {
                                                                        const next = prev.slice()
                                                                        const cur = next[idx]
                                                                        next[idx] = { ...cur, from: a }
                                                                        if (a && next[idx].to?.code === a.code) next[idx] = { ...next[idx], to: null }
                                                                        return next
                                                                    })
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="lg:col-span-4">
                                                            <AirportAutocomplete
                                                                id={`r${idx}-to`}
                                                                label="To"
                                                                placeholder="City or airport"
                                                                required
                                                                value={r.to}
                                                                excludeCodes={r.from ? [r.from.code] : []}
                                                                error={touched[`r${idx}-to`] ? errors[`r${idx}-to`] : undefined}
                                                                onBlur={() => markTouched(`r${idx}-to`)}
                                                                onChange={(a) => {
                                                                    setRoutes((prev) => {
                                                                        const next = prev.slice()
                                                                        const cur = next[idx]
                                                                        next[idx] = { ...cur, to: a }
                                                                        if (a && next[idx].from?.code === a.code) next[idx] = { ...next[idx], from: null }
                                                                        return next
                                                                    })
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="lg:col-span-3">
                                                            <div className="space-y-2">
                                                                <label
                                                                    htmlFor={`r${idx}-date`}
                                                                    className="text-sm font-medium text-foreground flex items-center gap-2"
                                                                >
                                                                    <Calendar className="h-4 w-4 text-primary" />
                                                                    Date <span className="text-muted-foreground">*</span>
                                                                </label>
                                                                <input
                                                                    id={`r${idx}-date`}
                                                                    type="date"
                                                                    value={r.date}
                                                                    onChange={(e) => {
                                                                        const v = e.target.value
                                                                        setRoutes((prev) => {
                                                                            const next = prev.slice()
                                                                            next[idx] = { ...next[idx], date: v }
                                                                            return next
                                                                        })
                                                                    }}
                                                                    onBlur={() => markTouched(`r${idx}-date`)}
                                                                    className={[
                                                                        "clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground",
                                                                        touched[`r${idx}-date`] && errors[`r${idx}-date`]
                                                                            ? "border-destructive/60 focus-visible:ring-destructive/20"
                                                                            : ""
                                                                    ].join(" ")}
                                                                    aria-invalid={!!(touched[`r${idx}-date`] && errors[`r${idx}-date`])}
                                                                />
                                                                {touched[`r${idx}-date`] && errors[`r${idx}-date`] ? (
                                                                    <p className="text-xs text-destructive leading-relaxed">{errors[`r${idx}-date`]}</p>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-1 flex items-end justify-end">
                                                            <button
                                                                type="button"
                                                                className="h-10 w-10 rounded-lg border border-border hover:bg-accent disabled:opacity-50 inline-flex items-center justify-center"
                                                                onClick={() => setRoutes((prev) => prev.filter((_, i) => i !== idx))}
                                                                disabled={routes.length <= 2}
                                                                aria-label="Remove route"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 mb-4">
                                        <div className="lg:col-span-4">
                                            <AirportAutocomplete
                                                id="from"
                                                label="From"
                                                placeholder="City or airport"
                                                required
                                                value={from}
                                                excludeCodes={to ? [to.code] : []}
                                                error={touched.from ? errors.from : undefined}
                                                onBlur={() => markTouched("from")}
                                                onChange={(a) => {
                                                    setFrom(a)
                                                    if (a && to?.code === a.code) setTo(null)
                                                }}
                                            />
                                        </div>

                                        <div className="lg:col-span-4">
                                            <div className="relative">
                                                <AirportAutocomplete
                                                    id="to"
                                                    label="To"
                                                    placeholder="City or airport"
                                                    required
                                                    value={to}
                                                    excludeCodes={from ? [from.code] : []}
                                                    error={touched.to ? errors.to : undefined}
                                                    onBlur={() => markTouched("to")}
                                                    onChange={(a) => {
                                                        setTo(a)
                                                        if (a && from?.code === a.code) setFrom(null)
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSwapLocations}
                                                    className="absolute right-2 top-9 p-2 rounded-full hover:bg-accent transition-colors"
                                                    aria-label="Swap departure and destination"
                                                >
                                                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="space-y-2">
                                                <label htmlFor="departDate" className="text-sm font-medium text-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    Departure <span className="text-muted-foreground">*</span>
                                                </label>
                                                <input
                                                    id="departDate"
                                                    type="date"
                                                    value={departDate}
                                                    onChange={(e) => setDepartDate(e.target.value)}
                                                    onBlur={() => markTouched("departDate")}
                                                    className={[
                                                        "clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground",
                                                        touched.departDate && errors.departDate ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                                    ].join(" ")}
                                                    aria-invalid={!!(touched.departDate && errors.departDate)}
                                                />
                                                {touched.departDate && errors.departDate ? (
                                                    <p className="text-xs text-destructive leading-relaxed">{errors.departDate}</p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {tripType === "round-trip" ? (
                                            <div className="lg:col-span-2">
                                                <div className="space-y-2">
                                                    <label htmlFor="returnDate" className="text-sm font-medium text-foreground flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                        Return <span className="text-muted-foreground">*</span>
                                                    </label>
                                                    <input
                                                        id="returnDate"
                                                        type="date"
                                                        value={returnDate}
                                                        onChange={(e) => setReturnDate(e.target.value)}
                                                        onBlur={() => markTouched("returnDate")}
                                                        className={[
                                                            "clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground",
                                                            touched.returnDate && errors.returnDate ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                                        ].join(" ")}
                                                        aria-invalid={!!(touched.returnDate && errors.returnDate)}
                                                    />
                                                    {touched.returnDate && errors.returnDate ? (
                                                        <p className="text-xs text-destructive leading-relaxed">{errors.returnDate}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className={tripType === "round-trip" ? "lg:col-span-4" : "lg:col-span-4"}>
                                            <PassengerPicker
                                                id="passengers"
                                                label="Passengers"
                                                value={passengers}
                                                onChange={(p) => setPassengers(p)}
                                                error={touched.passengers ? errors.passengers : undefined}
                                                onBlur={() => markTouched("passengers")}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Popular route shortcuts */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {popularRoutes.map((r) => (
                                        <button
                                            key={`${r.from}-${r.to}`}
                                            type="button"
                                            className="px-3 py-1.5 rounded-full border border-border hover:bg-accent text-xs font-medium"
                                            onClick={() => {
                                                const aFrom = pickAirportByCode(r.from)
                                                const aTo = pickAirportByCode(r.to)
                                                setTripType("one-way")
                                                setFrom(aFrom)
                                                setTo(aTo)
                                                setModeTab("popular")
                                                setActionResult(null)
                                            }}
                                        >
                                            {r.from} → {r.to}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {modeTab === "status" ? (
                            <div className="grid gap-4 md:grid-cols-2 mb-4" role="tabpanel" aria-label="Flight status">
                                <div className="space-y-2">
                                    <label htmlFor="flightNumber" className="text-sm font-medium text-foreground">
                                        Flight number <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="flightNumber"
                                        value={statusForm.flightNumber}
                                        onChange={(e) => setStatusForm((s) => ({ ...s, flightNumber: e.target.value }))}
                                        onBlur={() => markTouched("flightNumber")}
                                        placeholder="e.g., KQ 101"
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.flightNumber && errors.flightNumber ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.flightNumber && errors.flightNumber ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.flightNumber}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="statusDate" className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Date <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="statusDate"
                                        type="date"
                                        value={statusForm.date}
                                        onChange={(e) => setStatusForm((s) => ({ ...s, date: e.target.value }))}
                                        onBlur={() => markTouched("statusDate")}
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.statusDate && errors.statusDate ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.statusDate && errors.statusDate ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.statusDate}</p>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                        {modeTab === "checkin" ? (
                            <div className="grid gap-4 md:grid-cols-2 mb-4" role="tabpanel" aria-label="Check-in">
                                <div className="space-y-2">
                                    <label htmlFor="bookingRef" className="text-sm font-medium text-foreground">
                                        Booking reference <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="bookingRef"
                                        value={checkinForm.bookingRef}
                                        onChange={(e) => setCheckinForm((s) => ({ ...s, bookingRef: e.target.value.toUpperCase() }))}
                                        onBlur={() => markTouched("bookingRef")}
                                        placeholder="e.g., AB12CD"
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.bookingRef && errors.bookingRef ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.bookingRef && errors.bookingRef ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.bookingRef}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                                        Last name <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        value={checkinForm.lastName}
                                        onChange={(e) => setCheckinForm((s) => ({ ...s, lastName: e.target.value }))}
                                        onBlur={() => markTouched("lastName")}
                                        placeholder="e.g., Ahmed"
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.lastName && errors.lastName ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.lastName && errors.lastName ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.lastName}</p>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                        {modeTab === "manage" ? (
                            <div className="grid gap-4 md:grid-cols-2 mb-4" role="tabpanel" aria-label="Manage booking">
                                <div className="space-y-2">
                                    <label htmlFor="mBookingRef" className="text-sm font-medium text-foreground">
                                        Booking reference <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="mBookingRef"
                                        value={manageForm.bookingRef}
                                        onChange={(e) => setManageForm((s) => ({ ...s, bookingRef: e.target.value.toUpperCase() }))}
                                        onBlur={() => markTouched("mBookingRef")}
                                        placeholder="e.g., AB12CD"
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.mBookingRef && errors.mBookingRef ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.mBookingRef && errors.mBookingRef ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.mBookingRef}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="mLastName" className="text-sm font-medium text-foreground">
                                        Last name <span className="text-muted-foreground">*</span>
                                    </label>
                                    <input
                                        id="mLastName"
                                        value={manageForm.lastName}
                                        onChange={(e) => setManageForm((s) => ({ ...s, lastName: e.target.value }))}
                                        onBlur={() => markTouched("mLastName")}
                                        placeholder="e.g., Ahmed"
                                        className={[
                                            "clean-input dark:bg-input dark:border-border/80 dark:text-foreground",
                                            touched.mLastName && errors.mLastName ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
                                        ].join(" ")}
                                    />
                                    {touched.mLastName && errors.mLastName ? (
                                        <p className="text-xs text-destructive leading-relaxed">{errors.mLastName}</p>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                        {/* Action */}
                        <div className="md:col-span-2 lg:col-span-12">
                            <div className={onCancel ? "grid gap-2 sm:grid-cols-2" : ""}>
                                <Button
                                    onClick={handleSearch}
                                    disabled={!isValid}
                                    className="w-full bg-primary hover:bg-primary/90 hover:shadow-md font-semibold transition-all duration-200 disabled:opacity-60 disabled:hover:shadow-none"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    {modeTab === "popular"
                                        ? "Search flights"
                                        : modeTab === "status"
                                            ? "Check status"
                                            : modeTab === "checkin"
                                                ? "Find check-in"
                                                : "Open booking"}
                                </Button>
                                {onCancel ? (
                                    <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                                        Cancel
                                    </Button>
                                ) : null}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {modeTab === "popular" ? (
                                    <span>
                                        {tripType === "multi-city" ? "Add 2–5 routes and we’ll search each leg." : "Search by city, airport name, or code (e.g., NBO)."}{" "}
                                        <span className="text-foreground/80">Passengers:</span> {formatPassengerSummary(passengers)}
                                    </span>
                                ) : (
                                    <span>We’ll confirm details before any payment.</span>
                                )}
                            </div>
                            {actionResult ? (
                                <div className="mt-3 clean-card border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                                    {actionResult}
                                </div>
                            ) : null}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}