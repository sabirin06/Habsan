"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TransportSearchSummary } from "@/components/transport/TransportSearchSummary"
import { TransportResultsComparison } from "@/components/transport/TransportResultsComparison"
import { TransportSearchCard } from "@/components/transport/TransportSearchCard"
import type { Airport } from "@/lib/airports"
import { AIRPORTS } from "@/lib/airports"
import type { DriverMode, TransportSearchData, TransportSearchTab, VehicleType } from "@/lib/transport-types"

function firstParam(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
}

function asInt(input: string | null | undefined, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function safeTab(input: string | null | undefined): TransportSearchTab {
  return input === "rent_a_car" ? "rent_a_car" : "airport_pickup"
}

function safeVehicleType(input: string | null | undefined): VehicleType | "any" {
  const v = (input ?? "").toLowerCase()
  const allowed = new Set(["any", "sedan", "suv", "van", "luxury"])
  return allowed.has(v) ? (v as any) : "any"
}

function safeDriverMode(input: string | null | undefined): DriverMode | "either" {
  const v = (input ?? "").toLowerCase()
  const allowed = new Set(["either", "self_drive", "with_driver"])
  return allowed.has(v) ? (v as any) : "either"
}

function findAirportByCode(code: string | null | undefined): Airport | null {
  const c = (code ?? "").toUpperCase().trim()
  if (!c) return null
  return AIRPORTS.find((a) => a.code.toUpperCase() === c) ?? null
}

function todayPlusDateTime(days: number, hour24 = 10) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour24, 0, 0, 0)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

export default function TransportSearchPageClient({
  initialSearchParams
}: {
  initialSearchParams: Record<string, string | string[] | undefined>
}) {
  const router = useRouter()
  const pathname = usePathname()

  const get = (k: string) => firstParam(initialSearchParams[k])

  const [isEditingSearch, setIsEditingSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchToken, setSearchToken] = useState(0)
  const [closeFiltersToken, setCloseFiltersToken] = useState(0)
  const searchTimeoutRef = useRef<number | null>(null)

  const [searchData, setSearchData] = useState<TransportSearchData>(() => {
    const tab = safeTab(get("tab"))
    const passengers = clamp(asInt(get("passengers"), 2), 1, 12)
    return {
      tab,
      pickupAirport: findAirportByCode(get("airport")),
      dropOffLocation: get("dropoff") ?? "",
      pickupDateTime: get("dt") ?? todayPlusDateTime(7, 10),
      passengers,
      rentalPickupLocation: get("pickup") ?? "Mogadishu",
      rentalPickupDateTime: get("pickupDt") ?? todayPlusDateTime(7, 10),
      rentalReturnDateTime: get("returnDt") ?? todayPlusDateTime(10, 10),
      carType: safeVehicleType(get("carType")),
      rentalDriverMode: safeDriverMode(get("driver"))
    }
  })

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const updateUrl = (data: TransportSearchData) => {
    const params = new URLSearchParams()
    params.set("tab", data.tab)
    params.set("passengers", String(Math.max(1, data.passengers || 1)))

    if (data.tab === "airport_pickup") {
      if (data.pickupAirport) params.set("airport", data.pickupAirport.code)
      if (data.dropOffLocation.trim()) params.set("dropoff", data.dropOffLocation.trim())
      if (data.pickupDateTime) params.set("dt", data.pickupDateTime)
    } else {
      if (data.rentalPickupLocation.trim()) params.set("pickup", data.rentalPickupLocation.trim())
      if (data.rentalPickupDateTime) params.set("pickupDt", data.rentalPickupDateTime)
      if (data.rentalReturnDateTime) params.set("returnDt", data.rentalReturnDateTime)
      params.set("carType", data.carType)
      params.set("driver", data.rentalDriverMode)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const [urlSyncToken, setUrlSyncToken] = useState(0)
  useEffect(() => {
    if (urlSyncToken === 0) return
    updateUrl(searchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSyncToken])

  const title = useMemo(() => {
    return searchData.tab === "airport_pickup" ? "Airport pickup results" : "Car rental results"
  }, [searchData.tab])

  const subtitle = useMemo(() => {
    const pax = Math.max(1, searchData.passengers || 1)
    if (searchData.tab === "airport_pickup") {
      const a = searchData.pickupAirport
      const airportLabel = a ? `${a.city} (${a.code})` : "Any airport"
      const drop = searchData.dropOffLocation?.trim() ? ` → ${searchData.dropOffLocation.trim()}` : ""
      return `${airportLabel}${drop} • ${pax} passenger${pax > 1 ? "s" : ""}`
    }
    const loc = searchData.rentalPickupLocation?.trim() ? searchData.rentalPickupLocation.trim() : "Any pickup location"
    const driver =
      searchData.rentalDriverMode === "either"
        ? "Self-drive or driver"
        : searchData.rentalDriverMode === "self_drive"
          ? "Self-drive"
          : "With driver"
    const type = searchData.carType === "any" ? "Any car type" : searchData.carType.toUpperCase()
    return `${loc} • ${driver} • ${type} • ${pax} passenger${pax > 1 ? "s" : ""}`
  }, [searchData])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <TransportSearchSummary title={title} subtitle={subtitle} onEdit={() => setIsEditingSearch(true)} />

        <TransportResultsComparison
          searchData={searchData}
          isLoading={isSearching}
          searchToken={searchToken}
          requestCloseFiltersToken={closeFiltersToken}
        />
      </main>

      {/* Edit Search Modal */}
      {isEditingSearch ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditingSearch(false)} />
          <div className="absolute inset-0 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="container py-10">
              <div className="max-w-5xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="font-semibold">Modify transport search</div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                    onClick={() => setIsEditingSearch(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="p-4">
                  <TransportSearchCard
                    value={searchData}
                    onChange={(next) => setSearchData(next)}
                    ctaLabel="Update results"
                    onSearch={() => {
                      setIsEditingSearch(false)
                      setUrlSyncToken((x) => x + 1)
                      setSearchToken((x) => x + 1)
                      setCloseFiltersToken((x) => x + 1)
                      setIsSearching(true)
                      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
                      searchTimeoutRef.current = window.setTimeout(() => setIsSearching(false), 420)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

