"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FlightHeader } from "@/components/sections/flight-header"
import { FlightSearchCompact, type SearchData } from "@/components/sections/flight-search-compact"
import { FlightSearchSummary } from "@/components/sections/flight-search-summary"
import { FlightResultsComparison } from "@/components/sections/flight-results-comparison"
import { FlightDealsExclusive } from "@/components/sections/flight-deals-exclusive"
import { FlightTrustSignals } from "@/components/sections/flight-trust-signals"
import { FlightFAQCompact } from "@/components/sections/flight-faq-compact"
import { AIRPORTS } from "@/lib/airports"
import { formatPassengerSummary } from "@/components/flight-search/passenger-picker"

function fmtDate(input: string) {
    // handles both ISO (yyyy-mm-dd) and human strings gracefully
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) return input
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(d)
}

export default function FlightsPage() {
    const router = useRouter()
    const pathname = usePathname()

    const [showResults, setShowResults] = useState(false)
    const [isEditingSearch, setIsEditingSearch] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchToken, setSearchToken] = useState(0)
    const [closeFiltersToken, setCloseFiltersToken] = useState(0)
    const searchTimeoutRef = useRef<number | null>(null)

    const [searchData, setSearchData] = useState<SearchData>(() => {
        const from = AIRPORTS.find((a) => a.code === "JFK") ?? AIRPORTS[0]
        const to = AIRPORTS.find((a) => a.code === "LHR") ?? AIRPORTS[1]
        return {
            tripType: "round-trip",
            from,
            to,
            departDate: "2026-03-15",
            returnDate: "2026-03-22",
            passengers: { adults: 1, infants: 0, childrenAges: [] }
        }
    })

    const appliedUrlSearchRef = useRef<string | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return
        const qs = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search
        if (!qs) return
        if (appliedUrlSearchRef.current === qs) return

        const searchParams = new URLSearchParams(qs)

        // Only auto-run if the URL contains actual flight query inputs
        const tripType = (searchParams.get("tripType") as any) || undefined
        const hasMultiRoutes = Boolean(searchParams.get("routes"))
        const hasSimple = Boolean(searchParams.get("from") || searchParams.get("to") || searchParams.get("depart") || searchParams.get("return"))
        if (!tripType && !hasMultiRoutes && !hasSimple) return

        function airportByCode(code: string | null) {
            if (!code) return null
            const c = code.trim().toUpperCase()
            return AIRPORTS.find((a) => a.code.toUpperCase() === c) ?? null
        }

        function asInt(v: string | null, fallback: number) {
            const n = Number(v)
            return Number.isFinite(n) ? n : fallback
        }

        const passengers = {
            adults: Math.max(1, asInt(searchParams.get("adults"), 1)),
            infants: Math.max(0, asInt(searchParams.get("infants"), 0)),
            childrenAges: (() => {
                const raw = (searchParams.get("childrenAges") ?? "").trim()
                if (!raw) return []
                return raw
                    .split(",")
                    .map((x) => Number(x))
                    .filter((n) => Number.isFinite(n))
                    .map((n) => Math.max(2, Math.min(17, n)))
                    .slice(0, 15)
            })()
        }

        let nextData: SearchData | null = null

        const normalizedTrip =
            tripType === "multi-city" || hasMultiRoutes ? "multi-city" : tripType === "one-way" ? "one-way" : "round-trip"

        if (normalizedTrip === "multi-city") {
            const routesParam = searchParams.get("routes")
            if (routesParam) {
                try {
                    const decoded = decodeURIComponent(routesParam)
                    const parsed = JSON.parse(decoded) as Array<{ from?: string; to?: string; date?: string }>
                    const routes = (Array.isArray(parsed) ? parsed : [])
                        .slice(0, 5)
                        .map((r) => ({
                            from: airportByCode(r.from ?? "") ,
                            to: airportByCode(r.to ?? ""),
                            date: r.date ?? ""
                        }))
                    if (routes.length >= 2) {
                        nextData = { tripType: "multi-city", routes, passengers }
                    }
                } catch {
                    // ignore
                }
            }
        } else {
            const from = airportByCode(searchParams.get("from"))
            const to = airportByCode(searchParams.get("to"))
            const depart = searchParams.get("depart") ?? ""
            const ret = searchParams.get("return") ?? ""
            if (from && to && depart) {
                nextData =
                    normalizedTrip === "round-trip"
                        ? { tripType: "round-trip", from, to, departDate: depart, returnDate: ret || undefined, passengers }
                        : { tripType: "one-way", from, to, departDate: depart, passengers }
            }
        }

        if (!nextData) return
        appliedUrlSearchRef.current = qs
        handleSearch(nextData)
        // We intentionally run once on mount; handleSearch() will sync URL after.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
        }
    }, [])

    const routeLabel = useMemo(() => {
        if (searchData.tripType === "multi-city") {
            const first = searchData.routes[0]
            const last = searchData.routes[searchData.routes.length - 1]
            const from = first?.from?.code ?? "—"
            const to = last?.to?.code ?? "—"
            return `${from} → ${to}`
        }
        return `${searchData.from.code} → ${searchData.to.code}`
    }, [searchData])

    const updateUrl = (data: SearchData) => {
        const params = new URLSearchParams()
        params.set("tripType", data.tripType)
        params.set("pax", formatPassengerSummary(data.passengers))

        if (data.tripType === "multi-city") {
            params.set(
                "routes",
                encodeURIComponent(
                    JSON.stringify(
                        data.routes.map((r) => ({
                            from: r.from?.code ?? "",
                            to: r.to?.code ?? "",
                            date: r.date
                        }))
                    )
                )
            )
        } else {
            params.set("from", data.from.code)
            params.set("to", data.to.code)
            params.set("depart", data.departDate)
            if (data.tripType === "round-trip" && data.returnDate) params.set("return", data.returnDate)
        }

        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleSearch = (data: SearchData) => {
        setSearchData(data)
        setShowResults(true)
        setIsEditingSearch(false)

        setSearchToken((t) => t + 1)
        setCloseFiltersToken((t) => t + 1)
        updateUrl(data)

        setIsSearching(true)
        if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = window.setTimeout(() => setIsSearching(false), 650)
    }

    const handleEditSearch = () => {
        setIsEditingSearch(true)
    }

    if (showResults) {
        const routeSummary =
            searchData.tripType === "multi-city"
                ? (() => {
                    const first = searchData.routes[0]
                    const last = searchData.routes[searchData.routes.length - 1]
                    const legs = searchData.routes.length
                    const from = first?.from ? `${first.from.city} (${first.from.code})` : "—"
                    const to = last?.to ? `${last.to.city} (${last.to.code})` : "—"
                    return `${from} → ${to} • ${legs} legs`
                })()
                : `${searchData.from.city} (${searchData.from.code}) → ${searchData.to.city} (${searchData.to.code})`

        const dateSummary =
            searchData.tripType === "multi-city"
                ? `${fmtDate(searchData.routes[0]?.date ?? "")} + ${Math.max(0, searchData.routes.length - 1)} more`
                : searchData.tripType === "round-trip"
                    ? `${fmtDate(searchData.departDate)} – ${fmtDate(searchData.returnDate ?? "")}`
                    : fmtDate(searchData.departDate)

        const passengersSummary = formatPassengerSummary(searchData.passengers)

        return (
            <div className="min-h-screen bg-background">
                <Header />

                <main className="pt-20">
                    {/* Sticky Search Summary */}
                    <FlightSearchSummary
                        routeSummary={routeSummary}
                        dateSummary={dateSummary}
                        passengersSummary={passengersSummary}
                        tripType={searchData.tripType}
                        onEdit={handleEditSearch}
                    />

                    {/* Main Results Interface */}
                    <FlightResultsComparison
                        routeLabel={routeLabel}
                        isLoading={isSearching}
                        searchToken={searchToken}
                        requestCloseFiltersToken={closeFiltersToken}
                        searchData={searchData}
                    />
                </main>

                {/* Edit Search Modal */}
                {isEditingSearch ? (
                    <div className="fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditingSearch(false)} />
                        <div className="absolute inset-0 overflow-auto">
                            <div className="container py-10">
                                <div className="max-w-5xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <div className="font-semibold">Modify search</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                                                onClick={() => {
                                                    const from = AIRPORTS.find((a) => a.code === "JFK") ?? AIRPORTS[0]
                                                    const to = AIRPORTS.find((a) => a.code === "LHR") ?? AIRPORTS[1]
                                                    setSearchData({
                                                        tripType: "round-trip",
                                                        from,
                                                        to,
                                                        departDate: "2026-03-15",
                                                        returnDate: "2026-03-22",
                                                        passengers: { adults: 1, infants: 0, childrenAges: [] }
                                                    })
                                                }}
                                            >
                                                Reset search
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                                                onClick={() => setIsEditingSearch(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <FlightSearchCompact
                                            onSearch={handleSearch}
                                            initialData={searchData}
                                            onCancel={() => setIsEditingSearch(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main>
                <FlightHeader />
                <FlightSearchCompact onSearch={handleSearch} />
                <FlightDealsExclusive />
                <FlightTrustSignals />
                <FlightFAQCompact />
            </main>

            <Footer />
        </div>
    )
}