"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { StayGuests, StaySearchData, StayType } from "@/lib/stay-types"
import { StaySearchSummary } from "@/components/stay/stay-search-summary"
import { StayResultsComparison } from "@/components/stay/stay-results-comparison"
import { calcNights } from "@/lib/stay-utils"

function todayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function safeType(input: string | null | undefined): StayType {
  return input === "apartment" ? "apartment" : "hotel"
}

function asInt(input: string | null | undefined, fallback: number) {
  const n = Number(input)
  return Number.isFinite(n) ? n : fallback
}

function firstParam(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
}

function parseGuests(params: Record<string, string | string[] | undefined>): StayGuests {
  const get = (k: string) => firstParam(params[k])
  const adults = Math.max(1, asInt(get("adults"), 2))
  const children = Math.max(0, asInt(get("children"), 0))
  // Back-compat: if only `guests` exists, treat as adults count.
  const legacyGuests = asInt(get("guests"), 0)
  if (!get("adults") && legacyGuests > 0) return { adults: Math.max(1, legacyGuests), children: 0 }
  return { adults, children }
}

function totalGuests(g: StayGuests) {
  return Math.max(1, (g.adults || 0) + (g.children || 0))
}

export default function StaySearchPageClient({
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

  const [searchData, setSearchData] = useState<StaySearchData>(() => {
    const type = safeType(get("type"))
    const checkIn = get("checkIn") ?? todayPlus(14)
    const checkOut = get("checkOut") ?? todayPlus(21)
    const guests = parseGuests(initialSearchParams)
    return {
      type,
      destination: get("dest") ?? "Mogadishu",
      checkIn,
      checkOut,
      guests,
      rooms: Math.max(0, asInt(get("rooms"), type === "hotel" ? 0 : 1)),
      entirePlace: get("entirePlace") === "1"
    }
  })

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const updateUrl = (data: StaySearchData) => {
    const params = new URLSearchParams()
    params.set("type", data.type)
    params.set("dest", data.destination)
    params.set("checkIn", data.checkIn)
    params.set("checkOut", data.checkOut)
    params.set("adults", String(data.guests.adults))
    params.set("children", String(data.guests.children))
    params.set("rooms", String(data.rooms))
    // Also keep `guests` for back-compat and simple readability.
    params.set("guests", String(totalGuests(data.guests)))
    if (data.entirePlace) params.set("entirePlace", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }

  const [urlSyncToken, setUrlSyncToken] = useState(0)
  useEffect(() => {
    if (urlSyncToken === 0) return
    updateUrl(searchData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSyncToken])

  const setType = (t: StayType) => {
    setSearchData((cur) => ({
      ...cur,
      type: t,
      rooms: t === "hotel" ? cur.rooms : Math.max(1, cur.rooms || 1)
    }))
    setCloseFiltersToken((x) => x + 1)
    setUrlSyncToken((x) => x + 1)
    setSearchToken((x) => x + 1)

    setIsSearching(true)
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = window.setTimeout(() => setIsSearching(false), 420)
  }

  const destinationSummary = useMemo(() => searchData.destination?.trim() || "Anywhere", [searchData.destination])
  const nights = useMemo(() => calcNights(searchData.checkIn, searchData.checkOut), [searchData.checkIn, searchData.checkOut])
  const dateSummary = useMemo(
    () => `${searchData.checkIn} → ${searchData.checkOut} • ${nights} night${nights > 1 ? "s" : ""}`,
    [searchData.checkIn, searchData.checkOut, nights]
  )
  const guestsSummary = useMemo(() => {
    const t = totalGuests(searchData.guests)
    const parts = [`${t} guest${t > 1 ? "s" : ""}`]
    parts.push(`${searchData.guests.adults} adult${searchData.guests.adults > 1 ? "s" : ""}`)
    if (searchData.guests.children) parts.push(`${searchData.guests.children} child${searchData.guests.children > 1 ? "ren" : ""}`)
    if (searchData.type === "hotel" && searchData.rooms) parts.push(`${searchData.rooms} room${searchData.rooms > 1 ? "s" : ""}`)
    return parts.join(" • ")
  }, [searchData.guests, searchData.rooms, searchData.type])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <StaySearchSummary
          destinationSummary={destinationSummary}
          dateSummary={dateSummary}
          guestsSummary={guestsSummary}
          stayType={searchData.type}
          onChangeType={setType}
          onEdit={() => setIsEditingSearch(true)}
        />

        <StayResultsComparison
          searchData={searchData}
          isLoading={isSearching}
          searchToken={searchToken}
          requestCloseFiltersToken={closeFiltersToken}
        />
      </main>

      {/* Edit Search Modal - reuses the landing search card UI */}
      {isEditingSearch ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditingSearch(false)} />
          <div className="absolute inset-0 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="container py-10">
              <div className="max-w-5xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="font-semibold">Modify stay search</div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                    onClick={() => setIsEditingSearch(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="p-4">
                  {/* Minimal edit UI for now: we keep results page focused.
                      Landing page will provide the full premium search card experience. */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Destination</span>
                      <input
                        className="clean-input"
                        value={searchData.destination}
                        onChange={(e) => setSearchData((s) => ({ ...s, destination: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Adults</span>
                      <input
                        type="number"
                        min={1}
                        className="clean-input"
                        value={searchData.guests.adults}
                        onChange={(e) =>
                          setSearchData((s) => ({ ...s, guests: { ...s.guests, adults: Math.max(1, Number(e.target.value || 1)) } }))
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Check-in</span>
                      <input
                        type="date"
                        className="clean-input"
                        value={searchData.checkIn}
                        onChange={(e) => setSearchData((s) => ({ ...s, checkIn: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Check-out</span>
                      <input
                        type="date"
                        className="clean-input"
                        value={searchData.checkOut}
                        onChange={(e) => setSearchData((s) => ({ ...s, checkOut: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Children</span>
                      <input
                        type="number"
                        min={0}
                        className="clean-input"
                        value={searchData.guests.children}
                        onChange={(e) =>
                          setSearchData((s) => ({
                            ...s,
                            guests: { ...s.guests, children: Math.max(0, Number(e.target.value || 0)) }
                          }))
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Rooms</span>
                      <input
                        type="number"
                        min={0}
                        className="clean-input"
                        value={searchData.rooms}
                        onChange={(e) => setSearchData((s) => ({ ...s, rooms: Math.max(0, Number(e.target.value || 0)) }))}
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                      onClick={() => {
                        setIsEditingSearch(false)
                        setUrlSyncToken((x) => x + 1)
                        setSearchToken((x) => x + 1)
                        setCloseFiltersToken((x) => x + 1)
                      }}
                    >
                      Update results
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                      onClick={() => setIsEditingSearch(false)}
                    >
                      Cancel
                    </button>
                  </div>
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

